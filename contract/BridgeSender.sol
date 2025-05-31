// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BridgeSender is ReentrancyGuard, Ownable {
    enum BridgeStatus { Pending, Processing, Completed, Failed }
    
    struct BridgeTransaction {
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        BridgeStatus status;
    }

    mapping(bytes32 => BridgeTransaction) public bridgeTransactions;
    mapping(bytes32 => BridgeStatus) public bridgeStatus;
    
    address public bridgeOperator;
    uint256 public bridgeFee = 0.001 ether;
    
    event BridgeInitiated(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        bytes32 indexed bridgeId
    );
    
    event BridgeStatusUpdated(bytes32 indexed bridgeId, BridgeStatus status);

    constructor(address _bridgeOperator) {
        bridgeOperator = _bridgeOperator;
    }

    function bridgeToEthereum(address recipient) external payable nonReentrant {
        require(msg.value > bridgeFee, "Amount must be greater than bridge fee");
        
        uint256 bridgeAmount = msg.value - bridgeFee;
        bytes32 bridgeId = keccak256(abi.encodePacked(msg.sender, recipient, bridgeAmount, block.timestamp));
        
        bridgeTransactions[bridgeId] = BridgeTransaction({
            sender: msg.sender,
            recipient: recipient,
            amount: bridgeAmount,
            timestamp: block.timestamp,
            status: BridgeStatus.Pending
        });
        
        bridgeStatus[bridgeId] = BridgeStatus.Pending;
        
        // Send bridge fee to operator
        payable(bridgeOperator).transfer(bridgeFee);
        
        emit BridgeInitiated(msg.sender, recipient, bridgeAmount, bridgeId);
    }

    function updateBridgeStatus(bytes32 bridgeId, BridgeStatus status) external {
        require(msg.sender == bridgeOperator, "Only bridge operator can update status");
        
        bridgeStatus[bridgeId] = status;
        bridgeTransactions[bridgeId].status = status;
        
        emit BridgeStatusUpdated(bridgeId, status);
    }

    function getBridgeStatus(bytes32 bridgeId) external view returns (BridgeStatus) {
        return bridgeStatus[bridgeId];
    }

    function setBridgeFee(uint256 _bridgeFee) external onlyOwner {
        bridgeFee = _bridgeFee;
    }

    function setBridgeOperator(address _bridgeOperator) external onlyOwner {
        bridgeOperator = _bridgeOperator;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
