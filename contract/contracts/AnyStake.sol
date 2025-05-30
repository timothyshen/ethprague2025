// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";

/**
 * @title AnyStake
 * @notice A LayerZero OApp that supports cross-chain staking with composed messaging
 * @dev This contract demonstrates the composed messaging pattern where messages from one chain
 *      trigger actions on another chain and then call external contracts
 */
contract AnyStake is OApp, OAppOptionsType3 {
    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    string public data = "Nothing received yet.";

    mapping(address => uint256) public lockedBalances;

    // Operation types for composed messaging
    uint8 public constant OPERATION_DEPOSIT = 1;
    uint8 public constant OPERATION_WITHDRAW = 2;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event ComposedMessageSent(address indexed user, uint256 amount, address composedAddress, uint32 dstEid, uint8 operation);

    /**
     * @notice Stakes tokens by locking them and sending a cross-chain composed message
     * @param _dstEid The endpoint ID of the destination chain
     * @param _composedAddress The address of the composed contract (StakingAggregator) on destination chain
     * @param _options Additional options for message execution
     * @dev This demonstrates the A -> B1 -> B2 pattern where:
     *      A = source chain, B1 = destination OApp, B2 = composed contract (StakingAggregator)
     * @return receipt A `MessagingReceipt` struct containing details of the message sent
     */
    function deposit(
        uint32 _dstEid,
        address _composedAddress,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        require(msg.value > 0, "Must send ETH to stake");
        
        // Lock the tokens on source chain
        lockedBalances[msg.sender] += msg.value;
        
        // Create payload with operation type, amount, user address, and composed address
        bytes memory _payload = abi.encode(OPERATION_DEPOSIT, msg.value, msg.sender, _composedAddress);
        
        // Send cross-chain message
        receipt = _lzSend(_dstEid, _payload, _options, MessagingFee(msg.value, 0), payable(msg.sender));
        
        emit Deposited(msg.sender, msg.value);
        emit ComposedMessageSent(msg.sender, msg.value, _composedAddress, _dstEid, OPERATION_DEPOSIT);
    }

    /**
     * @notice Withdraws locked tokens and sends a cross-chain message to unstake on destination.
     * @param _dstEid The endpoint ID of the destination chain.
     * @param _amount The amount to withdraw.
     * @param _composedAddress The address for composed message handling.
     * @param _options Additional options for message execution.
     * @dev Unlocks the specified amount and sends a withdraw operation to the destination.
     * @return receipt A `MessagingReceipt` struct containing details of the message sent.
     */
    function withdraw(
        uint32 _dstEid,
        uint256 _amount,
        address _composedAddress,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        require(lockedBalances[msg.sender] >= _amount, "Insufficient balance");
        
        // Unlock the tokens on source chain
        lockedBalances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        // Create payload with withdraw operation type
        bytes memory _payload = abi.encode(OPERATION_WITHDRAW, _amount, msg.sender, _composedAddress);
        receipt = _lzSend(_dstEid, _payload, _options, MessagingFee(msg.value, 0), payable(msg.sender));
        
        emit Withdrawn(msg.sender, _amount);
        emit ComposedMessageSent(msg.sender, _amount, _composedAddress, _dstEid, OPERATION_WITHDRAW);
    }

    /**
     * @notice Quotes the gas needed to pay for the full omnichain transaction in native gas or ZRO token.
     * @param _dstEid Destination chain's endpoint ID.
     * @param _operation The operation type (1=deposit, 2=withdraw).
     * @param _amount The amount for the transaction.
     * @param _user The user address for the transaction.
     * @param _composedAddress The composed contract address.
     * @param _options Message execution options (e.g., for sending gas to destination).
     * @param _payInLzToken Whether to return fee in ZRO token.
     * @return fee A `MessagingFee` struct containing the calculated gas fee in either the native token or ZRO token.
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
     * @dev Internal function override to handle incoming messages from another chain.
     * @dev This function implements the composed messaging pattern by calling sendCompose
     * @param _origin A struct containing information about the message sender.
     * @param _guid A unique global packet identifier for the message.
     * @param payload The encoded message payload being received.
     *
     * Decodes the received payload and sends a composed message to the specified contract.
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata payload,
        address,
        bytes calldata
    ) internal override {
        (uint8 _operation, uint256 _amount, address _user, address _composedAddress) = abi.decode(payload, (uint8, uint256, address, address));

        // Update data with the received information
        string memory operationStr = _operation == OPERATION_DEPOSIT ? "DEPOSIT" : "WITHDRAW";
        data = string(abi.encodePacked("Received ", operationStr, " from user: ", addressToString(_user), " amount: ", uintToString(_amount)));
        
        // Create payload for the composed message (operation, amount and user)
        bytes memory composedPayload = abi.encode(_operation, _amount, _user);
        
        // Send a composed message to the StakingAggregator contract
        // This is the key part of the composed pattern: A -> B1 -> B2
        endpoint.sendCompose(_composedAddress, _guid, 0, composedPayload);
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
     * @notice Utility function to convert uint to string
     */
    function uintToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
