import { flowTestnet, hederaTestnet, sepolia, baseSepolia } from "viem/chains";

// Contract addresses for different networks
export const CONTRACTS = {
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
