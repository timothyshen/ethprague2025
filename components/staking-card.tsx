"use client"

import { useState } from "react"
import { useAccount, useBalance, useChainId } from "wagmi"
import { formatEther } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, Lock, Unlock, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useChainBalance } from "@/hooks/use-chain-balance"
import { sepolia, flowTestnet, hederaTestnet } from "viem/chains"

// Add these imports at the top
import { useStakingContract } from "@/hooks/use-staking-contract"
import { useContractEvents } from "@/hooks/use-contract-events"

interface StakingPool {
  id: string
  name: string
  token: string
  apy: number
  totalStaked: string
  userStaked: string
  lockPeriod: number
  minStake: string
}

interface StakingCardProps {
  pool: StakingPool
}

// Define supported source chains for cross-chain staking
const sourceChains = [
  { id: sepolia.id, name: "Ethereum", logo: "🔷", fee: "0.001 ETH" },
  { id: flowTestnet.id, name: "Flow", logo: "🌊", fee: "0.002 ETH" },
  { id: hederaTestnet.id, name: "Hedera", logo: "♦️", fee: "0.0015 ETH" },
]

// Update the StakingCard component to use real contract data
export function StakingCard({ pool }: StakingCardProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [selectedSourceChain, setSelectedSourceChain] = useState(sourceChains[0].id)
  const [stakeStep, setStakeStep] = useState<"amount" | "source" | "confirm">("amount")

  const { address } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()

  // Use real contract hooks
  const {
    stake,
    unstake,
    claimRewards,
    totalStaked,
    apy,
    stakedAmount,
    pendingRewards,
    isPending: isStakingPending,
    isConfirming: isStakingConfirming,
  } = useStakingContract()

  // Watch for contract events
  useContractEvents(address)

  const { data: balance } = useBalance({
    address,
  })

  const balances = useChainBalance();
  // Update pool data with real contract data
  const updatedPool = {
    ...pool,
    totalStaked: totalStaked,
    apy: apy,
    userStaked: stakedAmount ? (Number(stakedAmount) / 1e18).toFixed(4) : "0.00",
  }

  const handleStakeAmountNext = () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive",
      })
      return
    }
    setStakeStep("source")
  }

  const handleSourceSelectionBack = () => {
    setStakeStep("amount")
  }

  const handleSourceSelectionNext = () => {
    if (!selectedSourceChain) {
      toast({
        title: "Source Chain Selection Required",
        description: "Please select which chain your ETH is coming from",
        variant: "destructive",
      })
      return
    }
    setStakeStep("confirm")
  }

  const handleConfirmBack = () => {
    setStakeStep("source")
  }

  const handleStake = async () => {
    if (!stakeAmount || !address || !selectedSourceChain) return

    try {
      if (chainId === 1) {
        // Direct staking on Ethereum
        await stake(stakeAmount)
      }
      setStakeAmount("")
      setStakeStep("amount")
    } catch (error) {
      console.error("Staking error:", error)
    }
  }

  const handleUnstake = async () => {
    if (!unstakeAmount || !address) return

    try {
      await unstake(unstakeAmount)
      setUnstakeAmount("")
    } catch (error) {
      console.error("Unstaking error:", error)
    }
  }

  const isStaking = isStakingPending || isStakingConfirming

  const selectedChainInfo = sourceChains.find((chain) => chain.id === selectedSourceChain)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{updatedPool.name}</span>
              <Badge variant="secondary">{updatedPool.token}</Badge>
            </CardTitle>
            <CardDescription>Stake {updatedPool.token} from any chain into our Ethereum staking pool</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-lg font-bold">{updatedPool.apy}%</span>
            </div>
            <p className="text-sm text-muted-foreground">APY</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Staked</p>
            <p className="font-medium">
              {updatedPool.totalStaked} {updatedPool.token}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Your Staked</p>
            <p className="font-medium">
              {updatedPool.userStaked} {updatedPool.token}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Lock Period</p>
            <p className="font-medium">{updatedPool.lockPeriod} days</p>
          </div>
          <div>
            <p className="text-muted-foreground">Min Stake</p>
            <p className="font-medium">
              {updatedPool.minStake} {updatedPool.token}
            </p>
          </div>
        </div>

        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake" className="flex items-center space-x-1">
              <Lock className="h-4 w-4" />
              <span>Stake</span>
            </TabsTrigger>
            <TabsTrigger value="unstake" className="flex items-center space-x-1">
              <Unlock className="h-4 w-4" />
              <span>Unstake</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-4">
            {stakeStep === "amount" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Amount to Stake</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stake-amount"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      type="number"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setStakeAmount(balance ? formatEther(balance.value) : "0")}
                    >
                      Max
                    </Button>
                  </div>
                  {balance && (
                    <p className="text-sm text-muted-foreground">
                      Balance: {formatEther(balance.value)} {balance.symbol}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleStakeAmountNext}
                  disabled={!stakeAmount || Number(stakeAmount) <= 0}
                  className="w-full"
                >
                  Next: Select Source Chain
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {stakeStep === "source" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Select Source Chain</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose which chain your ETH is currently on. We'll aggregate it into our Ethereum staking pool.
                  </p>

                  <RadioGroup value={selectedSourceChain} onValueChange={setSelectedSourceChain} className="space-y-3">
                    {sourceChains.map((chain) => (
                      <div key={chain.id} className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value={chain.id} id={chain.id} />
                        <Label htmlFor={chain.id} className="flex flex-1 items-center justify-between cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{chain.logo}</span>
                            <span>{chain.name}</span>
                            {balances[chain.id] && (
                              <p className="text-sm text-muted-foreground">
                                Balance: {formatEther(balances[chain.id].value)} {balances[chain.id].symbol}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">Bridge Fee: {chain.fee}</Badge>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleSourceSelectionBack} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSourceSelectionNext} className="flex-1">
                    Next: Confirm
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {stakeStep === "confirm" && (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h4 className="font-medium mb-2">Confirm Staking Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {stakeAmount} {updatedPool.token}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source Chain:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{selectedChainInfo?.logo}</span>
                        <span className="font-medium">{selectedChainInfo?.name}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destination:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">🔷</span>
                        <span className="font-medium">Ethereum Staking Pool</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bridge Fee:</span>
                      <span className="font-medium">{selectedChainInfo?.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">APY:</span>
                      <span className="font-medium text-green-600">{updatedPool.apy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lock Period:</span>
                      <span className="font-medium">{updatedPool.lockPeriod} days</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleConfirmBack} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleStake} disabled={isStaking || !address} className="flex-1">
                    {isStaking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Stake"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unstake" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unstake-amount">Amount to Unstake</Label>
              <div className="flex space-x-2">
                <Input
                  id="unstake-amount"
                  placeholder="0.0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  type="number"
                />
                <Button variant="outline" onClick={() => setUnstakeAmount(updatedPool.userStaked)}>
                  Max
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Staked: {updatedPool.userStaked} {updatedPool.token}
              </p>
            </div>

            <Button
              onClick={handleUnstake}
              disabled={!unstakeAmount || isStaking || !address}
              className="w-full"
              variant="outline"
            >
              {isStaking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unstaking...
                </>
              ) : (
                "Unstake Tokens"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
