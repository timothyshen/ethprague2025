// Chain configuration for different networks
export const CHAIN_CONFIG = {
  // Ethereum Mainnet
  1: {
    name: "Ethereum",
    logo: "🔷",
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  // Base
  8453: {
    name: "Base",
    logo: "🔵",
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  // Optimism
  10: {
    name: "Optimism",
    logo: "🔴",
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  // Polygon
  137: {
    name: "Polygon",
    logo: "🟣",
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  // Sepolia Testnet
  11155111: {
    name: "Sepolia",
    logo: "🔷",
    rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const

export type ChainId = keyof typeof CHAIN_CONFIG

export function getChainConfig(chainId: number) {
  return CHAIN_CONFIG[chainId as ChainId]
}

export function isChainSupported(chainId: number): chainId is ChainId {
  return chainId in CHAIN_CONFIG
}
