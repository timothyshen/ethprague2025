"use client"

import { useAccount, useChainId } from "wagmi"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { getChainConfig } from "@/lib/chain-config"

export function NetworkStatus() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const chainConfig = getChainConfig(chainId)

  if (!isConnected) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex items-center space-x-2 p-3">
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">Not Connected</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-500/50">
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">{chainConfig?.name || "Unknown Network"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
