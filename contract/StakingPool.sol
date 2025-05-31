// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StakingPool is ReentrancyGuard, Ownable, Pausable {
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastStakeTime;
    }

    mapping(address => UserInfo) public userInfo;
    
    uint256 public totalStaked;
    uint256 public apy = 1250; // 12.50% APY (in basis points)
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public minStakeAmount = 0.01 ether;
    uint256 public lockPeriod = 30 days;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor() {}

    function stake() external payable nonReentrant whenNotPaused {
        require(msg.value >= minStakeAmount, "Amount below minimum stake");
        
        UserInfo storage user = userInfo[msg.sender];
        
        // Claim pending rewards before updating stake
        if (user.amount > 0) {
            uint256 pending = getPendingRewards(msg.sender);
            if (pending > 0) {
                payable(msg.sender).transfer(pending);
                emit RewardsClaimed(msg.sender, pending);
            }
        }
        
        user.amount += msg.value;
        user.lastStakeTime = block.timestamp;
        user.rewardDebt = (user.amount * apy * (block.timestamp - user.lastStakeTime)) / (SECONDS_PER_YEAR * BASIS_POINTS);
        
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= amount, "Insufficient staked amount");
        require(block.timestamp >= user.lastStakeTime + lockPeriod, "Tokens still locked");
        
        // Claim pending rewards
        uint256 pending = getPendingRewards(msg.sender);
        if (pending > 0) {
            payable(msg.sender).transfer(pending);
            emit RewardsClaimed(msg.sender, pending);
        }
        
        user.amount -= amount;
        user.rewardDebt = (user.amount * apy * (block.timestamp - user.lastStakeTime)) / (SECONDS_PER_YEAR * BASIS_POINTS);
        
        totalStaked -= amount;
        
        payable(msg.sender).transfer(amount);
        
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        uint256 pending = getPendingRewards(msg.sender);
        require(pending > 0, "No rewards to claim");
        
        UserInfo storage user = userInfo[msg.sender];
        user.rewardDebt = (user.amount * apy * (block.timestamp - user.lastStakeTime)) / (SECONDS_PER_YEAR * BASIS_POINTS);
        
        payable(msg.sender).transfer(pending);
        
        emit RewardsClaimed(msg.sender, pending);
    }

    function getPendingRewards(address _user) public view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        if (user.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - user.lastStakeTime;
        uint256 rewards = (user.amount * apy * timeStaked) / (SECONDS_PER_YEAR * BASIS_POINTS);
        
        return rewards - user.rewardDebt;
    }

    function getStakedAmount(address _user) external view returns (uint256) {
        return userInfo[_user].amount;
    }

    // Admin functions
    function setAPY(uint256 _apy) external onlyOwner {
        apy = _apy;
    }

    function setMinStakeAmount(uint256 _minStakeAmount) external onlyOwner {
        minStakeAmount = _minStakeAmount;
    }

    function setLockPeriod(uint256 _lockPeriod) external onlyOwner {
        lockPeriod = _lockPeriod;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {
        // Allow contract to receive ETH
    }
}
