// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockEndpoint {
    address public delegate;
    function setDelegate(address _delegate) external {
        delegate = _delegate;
    }
    // Dummy quote function (matches LayerZero interface)
    function quote(uint32, bytes calldata, bytes calldata, bool) external pure returns (uint256, uint256) {
        return (0, 0);
    }
    // Dummy sendCompose function
    function sendCompose(address, bytes32, uint256, bytes calldata) external pure {}
    // Fallback to catch all unknown calls
    fallback() external payable {}
    // Receive to accept ETH
    receive() external payable {}
} 