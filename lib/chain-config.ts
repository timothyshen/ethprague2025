import { flowTestnet, hederaTestnet, sepolia, baseSepolia } from "viem/chains";

// Chain configuration for different networks
export const CHAIN_CONFIG = {
  // Ethereum Mainnet
  [sepolia.id]: {
    name: "Ethereum Sepolia",
    chainId: sepolia.id,
    rpcUrl: sepolia.rpcUrls.default.http[0],
    explorerUrl: sepolia.blockExplorers.default.url,
  },
  [flowTestnet.id]: {
    name: "Flow Testnet",
    chainId: flowTestnet.id,
    rpcUrl: flowTestnet.rpcUrls.default.http[0],
    explorerUrl: flowTestnet.blockExplorers.default.url,
  },
  [hederaTestnet.id]: {
    name: "Hedera Testnet",
    chainId: hederaTestnet.id,
    rpcUrl: hederaTestnet.rpcUrls.default.http[0],
    explorerUrl: hederaTestnet.blockExplorers.default.url,
  },
} as const;

export type ChainId = keyof typeof CHAIN_CONFIG;

export function getChainConfig(chainId: number) {
  return CHAIN_CONFIG[chainId as ChainId];
}

export function isChainSupported(chainId: number): chainId is ChainId {
  return chainId in CHAIN_CONFIG;
}
