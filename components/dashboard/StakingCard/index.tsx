"use client"

import { useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { formatEther, parseEther } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStakingAggregatorContract } from "@/hooks/use-stakingAggregator-contract"
import { StakingTabs } from "./StakingTabs"
import { StakingPool } from "./types"

interface StakingCardProps {
    pool: StakingPool
}

export function StakingCard({ pool }: StakingCardProps) {
    const { address } = useAccount()
    const { totalStakedData, stakedAmountData } = useStakingAggregatorContract()
    const { data: balance } = useBalance({ address })

    // Update pool data with real contract data
    const updatedPool = {
        ...pool,
        totalStaked: (Number(totalStakedData.data) / 1e18).toFixed(4),
        apy: 10,
        userStaked: stakedAmountData(address as `0x${string}`).data
            ? (Number(stakedAmountData(address as `0x${string}`).data) / 1e18).toFixed(4)
            : "5.00",
    }

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

                <StakingTabs pool={updatedPool} />
            </CardContent>
        </Card>
    )
} 