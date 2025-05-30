"use client"

import { useState } from "react"
import { useAccount, useBalance, useChainId } from "wagmi"
import { base, optimism, polygon, mainnet } from "wagmi/chains"
import { formatEther } from "viem"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Loader2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const chains = [
  { ...mainnet, logo: "🔷" },
  { ...base, logo: "🔵" },
  { ...optimism, logo: "🔴" },
  { ...polygon, logo: "🟣" },
]

export function CrossChainBridge() {
  const [amount, setAmount] = useState("")
  const [sourceChain, setSourceChain] = useState(mainnet.id.toString())
  const [targetChain, setTargetChain] = useState(base.id.toString())
  const [isTransferring, setIsTransferring] = useState(false)

  const { address } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()

  const { data: balance } = useBalance({
    address,
  })

  const handleTransfer = async () => {
    if (!amount || !address) return

    try {
      setIsTransferring(true)

      // Simulate cross-chain transfer
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "Cross-Chain Transfer Initiated",
        description: `Transferring ${amount} ETH from ${getChainName(sourceChain)} to ${getChainName(targetChain)}`,
      })

      setAmount("")
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsTransferring(false)
    }
  }

  const getChainName = (chainId: string) => {
    const chain = chains.find((c) => c.id.toString() === chainId)
    return chain?.name || "Unknown Chain"
  }

  const getChainLogo = (chainId: string) => {
    const chain = chains.find((c) => c.id.toString() === chainId)
    return chain?.logo || "🌐"
  }

  const estimatedFee = 0.001
  const estimatedTime = sourceChain === targetChain ? "< 1 minute" : "15-30 minutes"

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cross-Chain Bridge</CardTitle>
        <CardDescription>Transfer tokens between different blockchain networks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="source-chain">Source Chain</Label>
          <Select value={sourceChain} onValueChange={setSourceChain}>
            <SelectTrigger id="source-chain">
              <SelectValue placeholder="Select source chain" />
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{chain.logo}</span>
                    <span>{chain.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-2">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-chain">Target Chain</Label>
          <Select value={targetChain} onValueChange={setTargetChain}>
            <SelectTrigger id="target-chain">
              <SelectValue placeholder="Select target chain" />
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{chain.logo}</span>
                    <span>{chain.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="flex space-x-2">
            <Input
              id="amount"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
            />
            <Button variant="outline" onClick={() => balance && setAmount(formatEther(balance.value))}>
              Max
            </Button>
          </div>
          {balance && (
            <p className="text-sm text-muted-foreground">
              Balance: {formatEther(balance.value)} {balance.symbol}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Estimated Fee</p>
            <p className="font-medium">{estimatedFee} ETH</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estimated Time</p>
            <p className="font-medium">{estimatedTime}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button onClick={handleTransfer} disabled={!amount || isTransferring || !address} className="w-full">
          {isTransferring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              Transfer {amount ? `${amount} ETH` : ""}
              {amount ? (
                <div className="ml-2 flex items-center space-x-1">
                  <span>{getChainLogo(sourceChain)}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{getChainLogo(targetChain)}</span>
                </div>
              ) : null}
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Powered by LayerZero Protocol{" "}
          <a
            href="https://layerzero.network"
            target="_blank"
            rel="noopener noreferrer"
            className="underline inline-flex items-center"
          >
            Learn more <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
