"use client"

import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { sepolia, baseSepolia, flowTestnet, hederaTestnet } from "wagmi/chains"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const chains = [
  { ...sepolia, logo: "🔷", name: "Sepolia" },
  { ...baseSepolia, logo: "🔵", name: "Base Sepolia" },
  { ...flowTestnet, logo: "🌊", name: "Flow Testnet" },
  { ...hederaTestnet, logo: "♦️", name: "Hedera Testnet" },
]

export function ChainSelector() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const currentChain = chains.find((chain) => chain.id === chainId) || chains[0]

  if (!isConnected) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentChain.logo}</span>
            <span>{currentChain.name}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {chains.map((chain) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => switchChain({ chainId: chain.id })}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{chain.logo}</span>
              <span>{chain.name}</span>
            </div>
            {chainId === chain.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
