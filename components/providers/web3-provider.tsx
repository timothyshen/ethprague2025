"use client"

import type React from "react"

import { WagmiProvider, createConfig, http } from "wagmi"
import { flowTestnet, hederaTestnet, sepolia, baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"


const config = createConfig(
  getDefaultConfig({
    chains: [flowTestnet, hederaTestnet, sepolia, baseSepolia],
    transports: {
      [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [flowTestnet.id]: http(`https://flow-testnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      [hederaTestnet.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    appName: "AnyStaking",
    appDescription: "Cross-Chain Staking Protocol",
  }),
)

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="auto">{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
