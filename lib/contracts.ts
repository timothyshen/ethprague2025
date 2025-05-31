import { flowTestnet, hederaTestnet, sepolia } from "viem/chains";

// Contract addresses for different networks
export const CONTRACTS_NEW = {
  // Ethereum Mainnet
  [sepolia.id]: {
    endpointId: 40121,
    stakeAggregator: "0x57a05e30AFad23658740DcF65e20d2A794eDf81d",
    anyStake: "0xE08a7eb4F58347063350738c4571aaA4DF991570",
  },
  [flowTestnet.id]: {
    endpointId: 40351,
    stakeAggregator: "0xF3682fcb801aD48D0088aA7EC3641F15171696e3",
    anyStake: "0x0395E9a0aD62cBB28a15281B0c5D801c72a9364c",
  },
  [hederaTestnet.id]: {
    endpointId: 40285,
    stakeAggregator: "0x9C5Ad9F21165a9A6aFA588C24Ed7292902987CbE",
    anyStake: "0x3ea06d7b5FE23615d39F8D8D63eDB6D717eb9a8A",
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
