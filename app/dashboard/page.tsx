"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift } from "lucide-react"
import { ConnectKitButton } from "connectkit"
import { StakingAnalytics } from "@/components/staking-analytics"
import { StakingTransactionTracker } from "@/components/stake-transaction-tracker"
import { useToast } from "@/hooks/use-toast"
import { TransactionMonitor } from "@/components/transaction-monitor"
import { useAggregateAllBalance } from "@/hooks/use-aggregate-all-balance"
import { useStakingAggregatorContract } from "@/hooks/use-stakingAggregator-contract"
import { useAnyStakeContract } from "@/hooks/use-anyStake-contract"
import { flowTestnet, hederaTestnet } from "viem/chains"
import {
  StakingPositionCard,
  ChainPosition,
  StakingPosition,
  UnstakeDialog,
  StakingOverviewCards,
  TransactionHistoryList,
  Transaction
} from "@/components/dashboard"

const transactions: Transaction[] = [
  {
    id: "1",
    type: "Stake",
    amount: "1.5 ETH",
    sourceChain: "Ethereum",
    chainLogo: "🔷",
    hash: "0x1234...5678",
    timestamp: "2024-01-15 14:30",
    status: "Confirmed",
  },
  {
    id: "2",
    type: "Stake",
    amount: "0.5 ETH",
    sourceChain: "Flow",
    chainLogo: "🌊",
    hash: "0x3456...7890",
    timestamp: "2024-01-16 10:15",
    status: "Confirmed",
  },
  {
    id: "3",
    type: "Stake",
    amount: "0.5 ETH",
    sourceChain: "Hedera",
    chainLogo: "♦️",
    hash: "0x5678...9012",
    timestamp: "2024-01-17 09:45",
    status: "Confirmed",
  },
  {
    id: "4",
    type: "Claim",
    amount: "0.05 ETH",
    sourceChain: "Ethereum",
    chainLogo: "🔷",
    hash: "0x2345...6789",
    timestamp: "2024-01-14 09:15",
    status: "Confirmed",
  },
]

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<{ position: StakingPosition, chainId: number } | null>(null)
  const [destinationChain, setDestinationChain] = useState("ethereum")
  const { toast } = useToast()

  const isPending = false
  const { totalBalance, positions, totalChains, isLoading: isBalanceLoading } = useAggregateAllBalance()
  const { totalStakedData } = useStakingAggregatorContract()
  const { withdraw, isPending: isWithdrawPending, isConfirming: isWithdrawConfirming } = useAnyStakeContract()

  useEffect(() => {
    const getTotalStaked = async () => {
      const totalStaked = await totalStakedData()
      console.log("totalStaked", totalStaked)
    }
    getTotalStaked().then((totalStaked) => {
      console.log("totalStaked", totalStaked)
    })
  }, [totalStakedData])

  const stakingPositions: StakingPosition[] = [
    {
      id: "1",
      pool: "ETH Staking Pool",
      sourceChain: "Ethereum",
      chainLogo: "🔷",
      token: "ETH",
      amount: totalBalance,
      value: `$${(Number.parseFloat(totalBalance || "0") * 1700).toFixed(2)}`,
      apy: 12.5,
      rewards: "10.00",
      lockEnd: "2024-02-15",
      status: "Active",
    },
  ]

  const chainPositions: ChainPosition[] = [
    {
      chainId: flowTestnet.id,
      amount: "100",
      token: "ETH",
      rewards: "10",
      apy: 12.5,
      status: "Active",
      sourceChain: "Flow",
    },
    {
      chainId: hederaTestnet.id,
      amount: "100",
      token: "ETH",
      rewards: "10",
      apy: 12.5,
      status: "Active",
      sourceChain: "Hedera",
    }
  ]

  const handleUnstake = () => {
    if (!selectedPosition) return

    withdraw(selectedPosition.chainId, BigInt(20))

    toast({
      title: "Unstaking Initiated",
      description: `Unstaking ${totalBalance} ${selectedPosition.position.token} to ${destinationChain}`,
    })

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

  const totalRewards = stakingPositions.reduce((sum, pos) => sum + Number.parseFloat(pos.rewards), 0)

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
          totalBalance={totalBalance}
          totalRewards={totalRewards}
          totalPositions={stakingPositions.length}
          totalChains={totalChains}
        />

        {/* Transaction Monitor */}
        <div className="mb-8">
          <TransactionMonitor />
        </div>

        {/* Staking Transaction Tracker */}
        <div className="mb-8">
          <StakingTransactionTracker />
        </div>

        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="positions">Staking Positions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Staking Positions</h2>
              <Button disabled={isPending}>
                <Gift className="mr-2 h-4 w-4" />
                {isPending ? "Claiming..." : "Claim All Rewards"}
              </Button>
            </div>

            <div className="grid gap-6">
              {stakingPositions.map((position) => (
                <StakingPositionCard
                  key={position.id}
                  position={position}
                  chainPositions={chainPositions}
                  totalBalance={totalBalance}
                  totalChains={totalChains}
                  onUnstake={handlePositionUnstake}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <StakingAnalytics />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <TransactionHistoryList transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>

      <UnstakeDialog
        open={unstakeDialogOpen}
        onOpenChange={setUnstakeDialogOpen}
        selectedPosition={selectedPosition}
        destinationChain={destinationChain}
        setDestinationChain={setDestinationChain}
        totalBalance={totalBalance}
        onUnstake={handleUnstake}
      />
    </div>
  )
}
