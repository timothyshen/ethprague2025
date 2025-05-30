// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import { ILayerZeroComposer } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroComposer.sol";

/**
 * @title StakeAggregator
 * @notice A LayerZero composed contract that handles both local and cross-chain staking
 * @dev Implements ILayerZeroComposer to receive composed messages from LayerZero OApp
 */
contract StakeAggregator is ILayerZeroComposer {

    /// @notice LayerZero endpoint and authorized OApp addresses
    address public immutable endpoint;
    address public immutable oApp;

    mapping(address => uint256) public stakedAmount;
    uint256 public totalStaked;

    // Operation types (must match MyOApp.sol)
    uint8 public constant OPERATION_DEPOSIT = 1;
    uint8 public constant OPERATION_WITHDRAW = 2;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event ComposedMessageReceived(address indexed user, uint256 amount, bytes32 guid, uint8 operation);

    constructor(address _endpoint, address _oApp) {
        endpoint = _endpoint;
        oApp = _oApp;
    }

    /**
     * @notice Implements ILayerZeroComposer to receive composed messages from LayerZero
     * @param _oApp The OApp address that sent the composed message
     * @param _guid The global unique identifier for the message
     * @param _message The composed message payload
     */
    function lzCompose(
        address _oApp,
        bytes32 _guid,
        bytes calldata _message,
        address,
        bytes calldata
    ) external payable override {
        // Perform checks to make sure composed message comes from correct OApp
        require(_oApp == oApp, "!oApp");
        require(msg.sender == endpoint, "!endpoint");

        // Decode the payload to get the operation, amount and user address
        (uint8 _operation, uint256 _amount, address _user) = abi.decode(_message, (uint8, uint256, address));
        
        if (_operation == OPERATION_DEPOSIT) {
            // Perform deposit/staking logic
            stakedAmount[_user] += _amount;
            totalStaked += _amount;
            emit Deposited(_user, _amount);
            
        } else if (_operation == OPERATION_WITHDRAW) {
            // Perform withdraw/unstaking logic
            require(stakedAmount[_user] >= _amount, "Insufficient staked amount");
            require(address(this).balance >= _amount, "Insufficient contract balance");
            
            stakedAmount[_user] -= _amount;
            totalStaked -= _amount;
            
            // Transfer the withdrawn amount back to the user
            (bool success, ) = payable(_user).call{value: _amount}("");
            require(success, "ETH transfer failed");
            emit Withdrawn(_user, _amount);
            
        } else {
            revert("Invalid operation");
        }
        
        emit ComposedMessageReceived(_user, _amount, _guid, _operation);
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
     * @param amount The amount to withdraw
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
     * @param user The user address
     * @return The staked amount
     */
    function getStakedAmount(address user) external view returns (uint256) {
        return stakedAmount[user];
    }   

    /**
     * @notice Get the total staked amount across all users
     * @return The total staked amount
     */
    function getTotalStakedAmount() external view returns (uint256) {
        return totalStaked;
    }

    /**
     * @notice Get the contract's ETH balance
     * @return The contract's ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Allow the contract to receive ETH
     */
    receive() external payable {}
}