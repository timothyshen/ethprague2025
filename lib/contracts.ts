import { flowTestnet, hederaTestnet, sepolia, baseSepolia } from "viem/chains";

// Contract addresses for different networks
export const CONTRACTS_NEW = {
  // Ethereum Mainnet
  [sepolia.id]: {
    stakingAggregator: "0x1234567890123456789012345678901234567890",
    anyStake: "0x2345678901234567890123456789012345678901",
  },
  [baseSepolia.id]: {
    stakingAggregator: "0x1234567890123456789012345678901234567890",
    anyStake: "0x2345678901234567890123456789012345678901",
  },
  [flowTestnet.id]: {
    stakingAggregator: "0x1234567890123456789012345678901234567890",
    anyStake: "0x2345678901234567890123456789012345678901",
  },
  [hederaTestnet.id]: {
    stakingAggregator: "0x1234567890123456789012345678901234567890",
    anyStake: "0x2345678901234567890123456789012345678901",
  },
} as const;

// Contract addresses for different networks
export const CONTRACTS = {
  // Ethereum Mainnet
  1: {
    stakingPool: "0x1234567890123456789012345678901234567890", // Replace with actual contract
    bridgeReceiver: "0x2345678901234567890123456789012345678901",
  },
  // Base
  8453: {
    bridgeSender: "0x3456789012345678901234567890123456789012",
  },
  // Optimism
  10: {
    bridgeSender: "0x4567890123456789012345678901234567890123",
  },
  // Polygon
  137: {
    bridgeSender: "0x5678901234567890123456789012345678901234",
  },
} as const;

// Staking Pool ABI
export const STAKING_POOL_ABI = [
  {
    inputs: [],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getStakedAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getPendingRewards",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStaked",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "apy",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Staked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Unstaked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RewardsClaimed",
    type: "event",
  },
] as const;

// Bridge Sender ABI (for L2s)
export const BRIDGE_SENDER_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "bridgeToEthereum",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "txHash",
        type: "bytes32",
      },
    ],
    name: "getBridgeStatus",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "bridgeId",
        type: "bytes32",
      },
    ],
    name: "BridgeInitiated",
    type: "event",
  },
] as const;

// Bridge Receiver ABI (for Ethereum)
export const BRIDGE_RECEIVER_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "bridgeId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "completeBridge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "bridgeId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BridgeCompleted",
    type: "event",
  },
] as const;
