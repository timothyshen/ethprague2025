"use client"

import { useAccount, useChainId } from "wagmi"
import { Navbar } from "@/components/navbar"
import { ChainSelector } from "@/components/chain-selector"
import { StakingCard } from "@/components/staking-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConnectKitButton } from "connectkit"
import { TrendingUp, Users, DollarSign, Zap } from "lucide-react"
import { useStakingContract } from "@/hooks/use-staking-contract"
import { useState, useEffect } from "react"
import Footer from "@/components/footer"

export default function HomePage() {
  const { isConnected } = useAccount()
  const [stakingData, setStakingData] = useState({
    totalStaked: "0.00",
    apy: 12.5,
    stakedAmount: null as string | null,
    pendingRewards: null as string | null,
  })

  const { totalStaked, apy, stakedAmount, pendingRewards } = useStakingContract()

  useEffect(() => {
    const fetchData = async () => {
      setStakingData({ totalStaked, apy, stakedAmount, pendingRewards })
    }

    fetchData()
  }, [totalStaked, apy, stakedAmount, pendingRewards])

  // Update the stakingPools to use real data:
  const stakingPools = [
    {
      id: "1",
      name: "ETH Staking Pool",
      token: "ETH",
      apy: stakingData.apy || 12.5,
      totalStaked: stakingData.totalStaked || "0.00",
      userStaked: stakingData.stakedAmount || "0.00",
      lockPeriod: 30,
      minStake: "0.01",
    },
  ]

  // Helper function to get dynamic grid classes based on pool count
  const getGridClasses = (poolCount: number): string => {
    if (poolCount === 1) {
      return "grid grid-cols-1 mx-auto gap-6"
    } else if (poolCount === 2) {
      return "grid grid-cols-1 lg:grid-cols-2 max-w-4xl mx-auto gap-6"
    } else if (poolCount === 3) {
      return "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    } else if (poolCount === 4) {
      return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
    } else {
      // For 5+ pools, use a responsive grid that shows up to 3 per row
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    }
  }

  const stats = [
    {
      title: "Total Value Locked",
      value: "$12.5M",
      icon: DollarSign,
      change: "+12.3%",
    },
    {
      title: "Active Stakers",
      value: "2,847",
      icon: Users,
      change: "+5.2%",
    },
    {
      title: "Average APY",
      value: "12.5%",
      icon: TrendingUp,
      change: "+0.8%",
    },
    {
      title: "Supported Chains",
      value: "3",
      icon: Zap,
      change: "New!",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
            Cross-Chain ETH Staking
            <span className="text-primary"> Aggregator</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Stake your ETH from Flow, Hedera, or Ethereum into a single high-yield Ethereum staking pool.
          </p>
          {!isConnected && (
            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => (
                <Button size="lg" onClick={show} className="text-lg px-8 py-3">
                  {isConnected ? (ensName ?? truncatedAddress) : "Connect Wallet to Start"}
                </Button>
              )}
            </ConnectKitButton.Custom>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {isConnected ? (
          <div className="space-y-8">
            {/* Chain Selector */}
            <div className="max-w-xs">
              <ChainSelector />
            </div>

            {/* How It Works Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🌊 ♦️ 🔷</div>
                    <h3 className="text-lg font-medium mb-2">1. Select Source Chain</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose which chain your ETH is
                      <br />
                      Currently on - <span className="font-bold">Flow, Hedera, or Ethereum.</span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🔄</div>
                    <h3 className="text-lg font-medium mb-2">2. Bridge & Aggregate</h3>
                    <p className="text-sm text-muted-foreground">
                      We securely bridge your ETH from any chain to our Ethereum staking pool.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">💰</div>
                    <h3 className="text-lg font-medium mb-2">3. Earn Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Your aggregated ETH earns consistent staking rewards in our Ethereum pool.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Staking Pools */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Available Staking Pools</h2>
              {/* Option 1: Tailwind classes approach */}
              <div className={getGridClasses(stakingPools.length)}>
                {stakingPools.map((pool) => (
                  <StakingCard key={pool.id} pool={pool} />
                ))}
              </div>
            </div>


          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                Connect your wallet to start staking ETH from any chain into our Ethereum staking pool
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ConnectKitButton />
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}
