"use client"

import { useAccount } from "wagmi"
import { Navbar } from "@/components/navbar"
import { CrossChainBridge } from "@/components/cross-chain-bridge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectKitButton } from "connectkit"

export default function BridgePage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Cross-Chain Bridge</h1>
          <p className="text-muted-foreground">Transfer your tokens seamlessly between different blockchain networks</p>
        </div>

        {isConnected ? (
          <div className="max-w-md mx-auto">
            <CrossChainBridge />
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>Connect your wallet to use the cross-chain bridge</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ConnectKitButton />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
