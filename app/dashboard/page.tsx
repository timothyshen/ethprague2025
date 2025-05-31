"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Wallet, ExternalLink, Gift, BarChart3 } from "lucide-react"
import { ConnectKitButton } from "connectkit"
import { StakingAnalytics } from "@/components/staking-analytics"
import { BridgeTransactionTracker } from "@/components/bridge-transaction-tracker"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useStakingContract } from "@/hooks/use-staking-contract"
import { TransactionMonitor } from "@/components/transaction-monitor"

// Mock data for user's staking positions
// const stakingPositions = [
//   {
//     id: "1",
//     pool: "ETH Staking Pool",
//     sourceChain: "Ethereum",
//     chainLogo: "🔷",
//     amount: "1.5",
//     token: "ETH",
//     value: "$2,550.00",
//     apy: 12.5,
//     rewards: "0.075",
//     lockEnd: "2024-02-15",
//     status: "Active",
//   },
//   {
//     id: "2",
//     pool: "ETH Staking Pool",
//     sourceChain: "Flow",
//     chainLogo: "🌊",
//     amount: "0.5",
//     token: "ETH",
//     value: "$850.00",
//     apy: 12.5,
//     rewards: "0.025",
//     lockEnd: "2024-03-10",
//     status: "Active",
//   },
//   {
//     id: "3",
//     pool: "ETH Staking Pool",
//     sourceChain: "Hedera",
//     chainLogo: "♦️",
//     amount: "0.5",
//     token: "ETH",
//     value: "$850.00",
//     apy: 12.5,
//     rewards: "0.025",
//     lockEnd: "2024-03-15",
//     status: "Active",
//   },
// ]

const transactions = [
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
  const { isConnected, address } = useAccount()
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<(typeof stakingPositions)[0] | null>(null)
  const [destinationChain, setDestinationChain] = useState("ethereum")
  const { toast } = useToast()

  const { totalStaked, apy, stakedAmount, pendingRewards, claimRewards, isPending } = useStakingContract()

  const stakingPositions = [
    {
      id: "1",
      pool: "ETH Staking Pool",
      sourceChain: "Ethereum",
      chainLogo: "🔷",
      amount: stakedAmount || "0.00",
      token: "ETH",
      value: `$${(Number.parseFloat(stakedAmount || "0") * 1700).toFixed(2)}`,
      apy: apy || 12.5,
      rewards: pendingRewards || "0.00",
      lockEnd: "2024-02-15",
      status: "Active",
    },
  ]

  const handleUnstake = () => {
    if (!selectedPosition) return

    toast({
      title: "Unstaking Initiated",
      description: `Unstaking ${selectedPosition.amount} ${selectedPosition.token} to ${destinationChain}`,
    })

    setUnstakeDialogOpen(false)
    setSelectedPosition(null)
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

  const totalValue = stakingPositions.reduce(
    (sum, pos) => sum + Number.parseFloat(pos.value.replace("$", "").replace(",", "")),
    0,
  )

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Staked Value</p>
                  <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+5.2% this month</p>
                </div>
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                  <p className="text-2xl font-bold">${(totalRewards * 1700).toFixed(2)}</p>
                  <p className="text-sm text-green-600">Available to claim</p>
                </div>
                <Gift className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold">{stakingPositions.length}</p>
                  <p className="text-sm text-muted-foreground">From 3 source chains</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Monitor */}
        <div className="mb-8">
          <TransactionMonitor />
        </div>

        {/* Bridge Transaction Tracker */}
        <div className="mb-8">
          <BridgeTransactionTracker />
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
              <Button onClick={claimRewards} disabled={isPending}>
                <Gift className="mr-2 h-4 w-4" />
                {isPending ? "Claiming..." : "Claim All Rewards"}
              </Button>
            </div>

            <div className="grid gap-6">
              {stakingPositions.map((position) => (
                <Card key={position.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{position.chainLogo}</span>
                        <div>
                          <h3 className="font-semibold">{position.pool}</h3>
                          <p className="text-sm text-muted-foreground">Source: {position.sourceChain}</p>
                        </div>
                      </div>
                      <Badge variant={position.status === "Active" ? "default" : "secondary"}>{position.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Staked Amount</p>
                        <p className="font-medium">
                          {position.amount} {position.token}
                        </p>
                        <p className="text-sm text-muted-foreground">{position.value}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">APY</p>
                        <p className="font-medium text-green-600">{position.apy}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rewards</p>
                        <p className="font-medium">
                          {position.rewards} {position.token}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lock Ends</p>
                        <p className="font-medium">{position.lockEnd}</p>
                      </div>
                    </div>


                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center justify-end">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Add More
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPosition(position)
                            setDestinationChain("ethereum")
                            setUnstakeDialogOpen(true)
                          }}
                        >
                          Unstake
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <StakingAnalytics />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <h2 className="text-xl font-semibold">Transaction History</h2>

            <div className="space-y-4">
              {transactions.map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{tx.chainLogo}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{tx.type}</Badge>
                            <span className="font-medium">{tx.amount}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Source: {tx.sourceChain} • {tx.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{tx.status}</Badge>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={unstakeDialogOpen} onOpenChange={setUnstakeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unstake ETH</DialogTitle>
            <DialogDescription>Select which chain you want to receive your unstaked ETH on.</DialogDescription>
          </DialogHeader>

          {selectedPosition && (
            <div className="space-y-4 py-2">
              <div className="flex items-center space-x-2 p-2 border rounded-md">
                <span className="text-lg">{selectedPosition.chainLogo}</span>
                <div>
                  <p className="font-medium">
                    {selectedPosition.amount} {selectedPosition.token}
                  </p>
                  <p className="text-sm text-muted-foreground">Source: {selectedPosition.sourceChain}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Destination Chain</Label>
                <RadioGroup value={destinationChain} onValueChange={setDestinationChain} className="space-y-3">
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="ethereum" id="ethereum" />
                    <Label htmlFor="ethereum" className="flex flex-1 items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">🔷</span>
                        <span>Ethereum</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="flow" id="flow" />
                    <Label htmlFor="flow" className="flex flex-1 items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">🌊</span>
                        <span>Flow</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="hedera" id="hedera" />
                    <Label htmlFor="hedera" className="flex flex-1 items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">♦️</span>
                        <span>Hedera</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUnstakeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnstake}>Confirm Unstake</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
