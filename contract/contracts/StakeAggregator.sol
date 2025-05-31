// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import { ILayerZeroComposer } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroComposer.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

// Interface for calling AnyStake's send function
interface IAnyStake {
    function send(
        uint32 _dstEid,
        address _user,
        uint256 _amount,
        bool _success
    ) external payable;
    
    function getSendQuote(
        uint32 _dstEid,
        address _user,
        uint256 _amount,
        bool _success
    ) external view returns (uint256);
}

/**
 * @title StakeAggregator
 * @notice Simplified staking contract for hackathon - only implements ILayerZeroComposer
 * @dev Calls AnyStake.send() to send confirmations back to source chain
 */
contract StakeAggregator is ILayerZeroComposer, Ownable {

    address public endpoint;
    address public anyStakeContract;
    
    mapping(address => uint256) public stakedAmount;
    uint256 public totalStaked;

    // Operation types (must match AnyStake.sol)
    uint8 public constant OPERATION_DEPOSIT = 1;
    uint8 public constant OPERATION_WITHDRAW = 2;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event ComposedMessageReceived(address indexed user, uint256 amount, bytes32 guid, uint8 operation);
    event ConfirmationSent(address indexed user, uint256 amount, uint32 srcEid, bool success);

    constructor(address _endpoint, address _anyStakeContract, address _delegate) Ownable(_delegate) {
        endpoint = _endpoint;
        anyStakeContract = _anyStakeContract;
    }

    /**
     * @notice Set the AnyStake contract address
     */
    function setAnyStakeContract(address _anyStakeContract) external onlyOwner {
        anyStakeContract = _anyStakeContract;
    }

    /**
     * @notice Implements ILayerZeroComposer to receive composed messages from LayerZero
     * @dev Simplified for hackathon - assumes all operations are successful
     */
    function lzCompose(
        address _oApp,
        bytes32 _guid,
        bytes calldata _message,
        address,
        bytes calldata
    ) external payable override {
        require(msg.sender == endpoint, "!endpoint");

        (uint8 _operation, uint256 _amount, address _user, uint32 _srcEid, bytes32 _originalGuid) = 
            abi.decode(_message, (uint8, uint256, address, uint32, bytes32));
        
        if (_operation == OPERATION_DEPOSIT) {
            // Perform staking
            stakedAmount[_user] += _amount;
            totalStaked += _amount;
            emit Deposited(_user, _amount);
            
        } else if (_operation == OPERATION_WITHDRAW) {
            // Perform withdrawal - simplified to always succeed for hackathon
            bool success = false;
            if (stakedAmount[_user] >= _amount && address(this).balance >= _amount) {
                stakedAmount[_user] -= _amount;
                totalStaked -= _amount;
                success = true;
                emit Withdrawn(_user, _amount);
            }
            
            // Send confirmation back to source via AnyStake.send()
            _sendConfirmationViaAnyStake(_user, _amount, _srcEid, success);
        }
        
        emit ComposedMessageReceived(_user, _amount, _guid, _operation);
    }

    /**
     * @notice Send confirmation back to source chain via AnyStake contract
     * @dev Simplified for hackathon - calls AnyStake.send() directly
     */
    function _sendConfirmationViaAnyStake(
        address _user,
        uint256 _amount,
        uint32 _srcEid,
        bool _success
    ) internal {
        require(anyStakeContract != address(0), "AnyStake contract not set");
        
        // For hackathon simplicity, assume we have enough ETH for gas fees
        // In production, you'd want proper gas fee management
        try IAnyStake(anyStakeContract).send{value: msg.value}(
            _srcEid,
            _user,
            _amount,
            _success
        ) {
            emit ConfirmationSent(_user, _amount, _srcEid, _success);
        } catch {
            // For hackathon, just emit event if sending fails
            emit ConfirmationSent(_user, _amount, _srcEid, false);
        }
    }

    /**
     * @notice Stake ETH locally (non-LayerZero)
     */
    function stake() external payable {
        require(msg.value > 0, "Must stake a positive amount");
        
        stakedAmount[msg.sender] += msg.value;
        totalStaked += msg.value;
        
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw a specific amount locally
     */
    function withdraw(uint256 amount) external {
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked amount");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        stakedAmount[msg.sender] -= amount;
        totalStaked -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Get the staked amount for a specific user
     */
    function getStakedAmount(address user) external view returns (uint256) {
        return stakedAmount[user];
    }   

    /**
     * @notice Get the total staked amount across all users
     */
    function getTotalStakedAmount() external view returns (uint256) {
        return totalStaked;
    }

    /**
     * @notice Get the contract's ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Manual function to send confirmation (for testing/emergency)
     */
    function manualSendConfirmation(
        address _user,
        uint256 _amount,
        uint32 _srcEid,
        bool _success
    ) external payable onlyOwner {
        _sendConfirmationViaAnyStake(_user, _amount, _srcEid, _success);
    }

    /**
     * @notice Allow the contract to receive ETH
     */
    receive() external payable {}
}