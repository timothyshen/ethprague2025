"use client"

import { useState, useMemo } from "react"
import { useAccount, useBalance } from "wagmi"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift } from "lucide-react"
import { ConnectKitButton } from "connectkit"
import { StakingAnalytics } from "@/components/DataAnalytics/staking-analytics"
import { useToast } from "@/hooks/use-toast"
import { TransactionMonitor } from "@/components/DataAnalytics/transaction-monitor"
import { useAnyStakeContract } from "@/hooks/use-anyStake-contract"
import { flowTestnet, hederaTestnet, sepolia } from "viem/chains"
import {
  StakingPositionCard,
  StakingPosition,
  UnstakeDialog,
  StakingOverviewCards,
} from "@/components/dashboard"
import { useTotalBalances, useBalance as useBalanceProvider } from "@/components/providers/balance-provider"
import { useTransactions } from "@/components/providers/transaction-provider"
import { useNotification, ChainInfo } from "@/components/providers/notification-provider"
import { StakingTransactionTracker } from "@/components/DataAnalytics/stake-transaction-tracker"


// Chain info for notifications
const getChainInfo = (chainId: number): ChainInfo => {
  switch (chainId) {
    case flowTestnet.id:
      return { id: chainId, name: "Flow Testnet", logo: "🌊" }
    case hederaTestnet.id:
      return { id: chainId, name: "Hedera Testnet", logo: "♦️" }
    case sepolia.id:
      return { id: chainId, name: "Ethereum Sepolia", logo: "🔷" }
    default:
      return { id: chainId, name: "Unknown Chain", logo: "🔗" }
  }
}

// Map chainId to SupportedChain for balance updates
const getChainFromId = (id: number): 'flow' | 'hedera' | 'ethereum' => {
  if (id === 545) return 'flow'
  if (id === 296) return 'hedera'
  if (id === 11155111) return 'ethereum'
  return 'flow' // Default fallback
}

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<{ position: StakingPosition, chainId: number } | null>(null)
  const [destinationChain, setDestinationChain] = useState("ethereum")
  const { toast } = useToast()

  const isPending = false
  const { withdraw, isPending: isWithdrawPending, isConfirming: isWithdrawConfirming } = useAnyStakeContract()
  const { totalEthPool: totalEthPoolBalanceFormatted, userTotal: totalBalance } = useTotalBalances()
  const { setUserStakedBalance, chainBalances } = useBalanceProvider()
  const { addTransaction, updateTransactionHash } = useTransactions()
  const { permission, sendStakingNotification } = useNotification()

  // Calculate active chains based on user staked balances
  const activeChains = useMemo(() => {
    return Object.values(chainBalances).filter(chain =>
      parseFloat(chain.userStakedBalance) > 0
    ).length
  }, [chainBalances])

  // Generate staking positions from balance provider data
  const stakingPositions: StakingPosition[] = useMemo(() => {
    const positions: StakingPosition[] = []

    // Create aggregated position from all staking chains
    const totalUserStaked = parseFloat(totalBalance || "0")
    const totalPoolValue = parseFloat(totalEthPoolBalanceFormatted || "0")

    if (totalUserStaked > 0 || totalPoolValue > 0) {
      positions.push({
        id: "aggregated-eth-pool",
        pool: "ETH Staking Pool",
        sourceChain: "Cross-Chain",
        chainLogo: "🔷",
        token: "ETH",
        amount: totalBalance,
        value: `$${(totalUserStaked * 2500).toFixed(2)}`, // Assuming $2500 per ETH
        apy: 12.5, // Average APY across chains
        rewards: (totalUserStaked * 0.1).toFixed(4), // 10% rewards estimation
        lockEnd: "2024-12-31",
        status: totalUserStaked > 0 ? "Active" : "Available",
      })
    }

    // If no positions, create a default one
    if (positions.length === 0) {
      positions.push({
        id: "default-eth-pool",
        pool: "ETH Staking Pool",
        sourceChain: "Cross-Chain",
        chainLogo: "🔷",
        token: "ETH",
        amount: "0.00",
        value: "$0.00",
        apy: 12.5,
        rewards: "0.00",
        lockEnd: "2024-12-31",
        status: "Available",
      })
    }

    return positions
  }, [totalBalance, totalEthPoolBalanceFormatted])

  // Calculate total rewards from all positions
  const totalRewards = useMemo(() => {
    return stakingPositions.reduce((sum, pos) => sum + parseFloat(pos.rewards), 0)
  }, [stakingPositions])

  const handleUnstake = async () => {
    if (!selectedPosition) return

    const unstakeAmount = "20" // This should come from the actual unstake amount
    const sourceChainInfo = getChainInfo(selectedPosition.chainId)
    const destinationChainInfo = getChainInfo(sepolia.id)

    try {
      // Create transaction in the transaction provider
      const transactionId = addTransaction({
        hash: `0x${Math.random().toString(16).substr(2, 64)}`, // Temporary hash, will be updated
        type: "withdraw",
        chainId: selectedPosition.chainId,
        chainName: sourceChainInfo.name,
        amount: unstakeAmount,
        amountFormatted: `${unstakeAmount}`,
        apy: selectedPosition.position.apy,
        status: "pending"
      })

      // Send notification for unstaking initiated
      if (permission === "granted") {
        sendStakingNotification(
          "unstake-initiated",
          unstakeAmount,
          selectedPosition.position.token,
          sourceChainInfo,
          destinationChainInfo
        )
      }

      // Call the withdraw function
      await withdraw(selectedPosition.chainId, BigInt(20))

      toast({
        title: "Unstaking Initiated",
        description: `Unstaking ${unstakeAmount} ${selectedPosition.position.token} to ${destinationChain}`,
      })

      // Set up the unstaking progression flow
      // After 2 seconds: unstake-confirmed notification
      setTimeout(() => {
        if (permission === "granted") {
          sendStakingNotification(
            "unstake-confirmed",
            unstakeAmount,
            selectedPosition.position.token,
            sourceChainInfo,
            destinationChainInfo
          )
        }
      }, 2000)

      // After 2 minutes 25 seconds: unstake-completed notification and balance update
      setTimeout(() => {
        // Update balance provider - reduce user staked amount
        const stakingChain = getChainFromId(selectedPosition.chainId)
        const currentUserStaked = parseFloat(totalBalance || "0")
        const unstakeAmountNum = parseFloat(unstakeAmount)
        const newUserStaked = Math.max(0, currentUserStaked - unstakeAmountNum).toString()

        setUserStakedBalance(stakingChain, newUserStaked)

        // Send completion notification
        if (permission === "granted") {
          sendStakingNotification(
            "unstake-completed",
            unstakeAmount,
            selectedPosition.position.token,
            sourceChainInfo,
            destinationChainInfo
          )
        }

        toast({
          title: "Unstaking Completed",
          description: `Successfully unstaked ${unstakeAmount} ${selectedPosition.position.token}`,
        })
      }, 145000) // 2 minutes 25 seconds

    } catch (error: any) {
      console.error('Unstaking error:', error)

      toast({
        title: "Unstaking Failed",
        description: error?.message || "Failed to initiate unstaking transaction",
        variant: "destructive",
      })
    }

    setUnstakeDialogOpen(false)
    setSelectedPosition(null)
  }

  const handlePositionUnstake = (position: StakingPosition, chainId: number) => {
    setSelectedPosition({ position, chainId })
    setDestinationChain(
      chainId === flowTestnet.id
        ? "flow"
        : chainId === hederaTestnet.id
          ? "hedera"
          : "ethereum"
    )
    setUnstakeDialogOpen(true)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>Connect your wallet to view your staking dashboard</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ConnectKitButton />
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Staking Dashboard</h1>
          <p className="text-muted-foreground">Track your staking positions and rewards in the Ethereum staking pool</p>
        </div>

        {/* Overview Cards */}
        <StakingOverviewCards
          totalBalance={totalEthPoolBalanceFormatted}
          totalRewards={totalRewards}
          totalPositions={stakingPositions.length}
          totalChains={activeChains}
        />

        {/* Transaction Monitor */}
        <div className="mb-8">
          <TransactionMonitor />
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="rewards">
              <Gift className="mr-2 h-4 w-4" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="positions">Staking Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <StakingAnalytics />
            <StakingTransactionTracker />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Claim Rewards</CardTitle>
                <CardDescription>
                  Claim your accumulated rewards from the Ethereum staking pool
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold text-green-600">10.00 ETH</p>
                    <p className="text-muted-foreground">Available Rewards</p>
                  </div>
                  <Button className="w-full" disabled={isPending}>
                    {isPending ? "Claiming..." : "Claim Rewards"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stakingPositions.map((position) => (
                <StakingPositionCard
                  key={position.id}
                  position={position}
                  totalBalance={totalEthPoolBalanceFormatted}
                  totalChains={activeChains}
                  onUnstake={() => handlePositionUnstake(position, flowTestnet.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <UnstakeDialog
          open={unstakeDialogOpen}
          onOpenChange={setUnstakeDialogOpen}
          selectedPosition={selectedPosition || null}
          destinationChain={destinationChain}
          setDestinationChain={setDestinationChain}
          onUnstake={handleUnstake}
          isLoading={isWithdrawPending || isWithdrawConfirming}
          totalBalance={undefined}
        />
      </main>
    </div>
  )
}
