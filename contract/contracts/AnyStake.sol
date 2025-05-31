// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";

/**
 * @title AnyStake
 * @notice A LayerZero OApp that handles all cross-chain messaging for hackathon
 * @dev Simplified for hackathon - only this contract handles LayerZero messaging
 */
contract AnyStake is OApp, OAppOptionsType3 {
    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    string public data = "Nothing received yet.";

    mapping(address => uint256) public lockedBalances;
    mapping(bytes32 => PendingWithdrawal) public pendingWithdrawals;

    struct PendingWithdrawal {
        address user;
        uint256 amount;
        bool exists;
    }

    // Operation types for messaging
    uint8 public constant OPERATION_DEPOSIT = 1;
    uint8 public constant OPERATION_WITHDRAW = 2;
    uint8 public constant OPERATION_WITHDRAW_SUCCESS = 3;
    uint8 public constant OPERATION_WITHDRAW_FAILED = 4;

    event Deposited(address indexed user, uint256 amount);
    event WithdrawalInitiated(address indexed user, uint256 amount, bytes32 indexed guid);
    event WithdrawalConfirmed(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event ComposedMessageSent(address indexed user, uint256 amount, address composedAddress, uint32 dstEid, uint8 operation);

    /**
     * @notice Stakes tokens by locking them and sending a cross-chain composed message
     */
    function deposit(
        uint32 _dstEid,
        uint256 _amount,
        address _composedAddress,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        require(msg.value >= _amount, "Insufficient ETH sent");
        require(_amount > 0, "Must stake a positive amount");

        MessagingFee memory messagingFee = quote(_dstEid, OPERATION_DEPOSIT, _amount, msg.sender, _composedAddress, _options, false);
        require(msg.value >= messagingFee.nativeFee + _amount, "Insufficient ETH sent");
        
        lockedBalances[msg.sender] += _amount;
        
        bytes memory _payload = abi.encode(OPERATION_DEPOSIT, _amount, msg.sender, _composedAddress);
        receipt = _lzSend(_dstEid, _payload, _options, messagingFee, payable(msg.sender));
        
        emit Deposited(msg.sender, _amount);
        emit ComposedMessageSent(msg.sender, _amount, _composedAddress, _dstEid, OPERATION_DEPOSIT);
    }

    /**
     * @notice Initiates withdrawal - tokens remain locked until confirmation
     */
    function withdraw(
        uint32 _dstEid,
        uint256 _amount,
        address _composedAddress,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        require(lockedBalances[msg.sender] >= _amount, "Insufficient balance");
        require(_amount > 0, "Must withdraw a positive amount");

        MessagingFee memory messagingFee = quote(_dstEid, OPERATION_WITHDRAW, _amount, msg.sender, _composedAddress, _options, false);
        require(msg.value >= messagingFee.nativeFee, "Insufficient ETH for fees");

        bytes memory _payload = abi.encode(OPERATION_WITHDRAW, _amount, msg.sender, _composedAddress);
        receipt = _lzSend(_dstEid, _payload, _options, messagingFee, payable(msg.sender));
        
        // Store pending withdrawal
        pendingWithdrawals[receipt.guid] = PendingWithdrawal({
            user: msg.sender,
            amount: _amount,
            exists: true
        });
        
        emit WithdrawalInitiated(msg.sender, _amount, receipt.guid);
        emit ComposedMessageSent(msg.sender, _amount, _composedAddress, _dstEid, OPERATION_WITHDRAW);
    }

    /**
     * @notice Simple send function for StakeAggregator to call back to source
     * @param _dstEid Destination endpoint ID (source chain)
     * @param _user User address
     * @param _amount Amount
     * @param _success Whether withdrawal was successful
     */
    function send(
        uint32 _dstEid,
        address _user,
        uint256 _amount,
        bool _success
    ) external payable {
        uint8 operation = _success ? OPERATION_WITHDRAW_SUCCESS : OPERATION_WITHDRAW_FAILED;
        bytes memory _payload = abi.encode(operation, _amount, _user, address(0));
        
        bytes memory _options = abi.encodePacked(uint16(1), uint128(200000)); // Basic options
        MessagingFee memory messagingFee = _quote(_dstEid, _payload, _options, false);
        require(msg.value >= messagingFee.nativeFee, "Insufficient ETH for fees");
        
        _lzSend(_dstEid, _payload, _options, messagingFee, payable(msg.sender));
    }

    /**
     * @notice Get quote for send function
     */
    function getSendQuote(
        uint32 _dstEid,
        address _user,
        uint256 _amount,
        bool _success
    ) external view returns (MessagingFee memory fee) {
        uint8 operation = _success ? OPERATION_WITHDRAW_SUCCESS : OPERATION_WITHDRAW_FAILED;
        bytes memory payload = abi.encode(operation, _amount, _user, address(0));
        bytes memory options = abi.encodePacked(uint16(1), uint128(200000));
        fee = _quote(_dstEid, payload, options, false);
    }

    /**
     * @notice Quotes the gas needed for messaging operations
     */
    function quote(
        uint32 _dstEid,
        uint8 _operation,
        uint256 _amount,
        address _user,
        address _composedAddress,
        bytes memory _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory payload = abi.encode(_operation, _amount, _user, _composedAddress);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    /**
     * @notice Get the quote for a deposit operation
     */
    function getDepositQuote(
        uint32 _dstEid,
        uint256 _amount,
        address _composedAddress,
        bytes memory _options
    ) external view returns (MessagingFee memory fee) {
        return quote(_dstEid, OPERATION_DEPOSIT, _amount, msg.sender, _composedAddress, _options, false);
    }

    /**
     * @notice Get the quote for a withdraw operation
     */
    function getWithdrawQuote(
        uint32 _dstEid,
        uint256 _amount,
        address _composedAddress,
        bytes memory _options
    ) external view returns (MessagingFee memory fee) {
        return quote(_dstEid, OPERATION_WITHDRAW, _amount, msg.sender, _composedAddress, _options, false);
    }

    /**
     * @dev Handle incoming messages
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata payload,
        address,
        bytes calldata
    ) internal override {
        (uint8 _operation, uint256 _amount, address _user, address _composedAddress) = abi.decode(payload, (uint8, uint256, address, address));

        if (_operation == OPERATION_WITHDRAW_SUCCESS) {
            _handleWithdrawalSuccess(_user, _amount);
        } else if (_operation == OPERATION_WITHDRAW_FAILED) {
            _handleWithdrawalFailure(_user, _amount);
        } else {
            // Handle composed messages
            _handleComposedMessage(_origin, _guid, _operation, _amount, _user, _composedAddress);
        }
    }

    /**
     * @notice Handle successful withdrawal confirmation - simplified for hackathon
     */
    function _handleWithdrawalSuccess(address _user, uint256 _amount) internal {
        // Simplified: find and process withdrawal
        bytes32 pendingGuid = _findPendingWithdrawal(_user, _amount);
        if (pendingGuid != bytes32(0)) {
            delete pendingWithdrawals[pendingGuid];
            
            lockedBalances[_user] -= _amount;
            (bool success, ) = payable(_user).call{value: _amount}("");
            require(success, "ETH transfer failed");
            
            data = "Withdrawal successful";
            emit WithdrawalConfirmed(_user, _amount);
            emit Withdrawn(_user, _amount);
        }
    }

    /**
     * @notice Handle failed withdrawal - simplified for hackathon
     */
    function _handleWithdrawalFailure(address _user, uint256 _amount) internal {
        bytes32 pendingGuid = _findPendingWithdrawal(_user, _amount);
        if (pendingGuid != bytes32(0)) {
            delete pendingWithdrawals[pendingGuid];
            data = "Withdrawal failed";
        }
    }

    /**
     * @notice Simple helper to find pending withdrawal
     */
    function _findPendingWithdrawal(address _user, uint256 _amount) internal view returns (bytes32) {
        // Simplified for hackathon - just find the first matching withdrawal
        // In production, this would need proper implementation
        return bytes32(uint256(1)); // Simplified return
    }

    /**
     * @notice Handle composed messages
     */
    function _handleComposedMessage(
        Origin calldata _origin,
        bytes32 _guid,
        uint8 _operation,
        uint256 _amount,
        address _user,
        address _composedAddress
    ) internal {
        string memory operationStr = _operation == OPERATION_DEPOSIT ? "DEPOSIT" : "WITHDRAW";
        data = string(abi.encodePacked("Received ", operationStr, " from user: ", addressToString(_user)));
        
        bytes memory composedPayload = abi.encode(_operation, _amount, _user, _origin.srcEid, _guid);
        endpoint.sendCompose(_composedAddress, _guid, 0, composedPayload);
    }

    /**
     * @notice Get pending withdrawal details
     */
    function getPendingWithdrawal(bytes32 _guid) external view returns (PendingWithdrawal memory) {
        return pendingWithdrawals[_guid];
    }

    /**
     * @notice Utility function to convert address to string
     */
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    /**
     * @notice Allow contract to receive ETH
     */
    receive() external payable {}
}
