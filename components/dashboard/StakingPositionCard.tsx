import { TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChainPosition, StakingPosition } from "./types"
import { useBalance, SupportedChain, CHAIN_CONFIG } from "@/components/providers/balance-provider"
import { useMemo } from "react"

interface StakingPositionCardProps {
    position: StakingPosition
    totalBalance: string | undefined
    totalChains: number
    onUnstake: (position: StakingPosition, chainId: number) => void
}

export function StakingPositionCard({
    position,
    totalBalance,
    totalChains,
    onUnstake,
}: StakingPositionCardProps) {
    const { chainBalances } = useBalance()

    // Generate chain positions from balance provider data
    const chainPositions: ChainPosition[] = useMemo(() => {
        const positions: ChainPosition[] = []

        // Only include Flow and Hedera (where users can stake)
        const stakingChains: SupportedChain[] = ['flow', 'hedera']

        stakingChains.forEach((chainKey) => {
            const chainData = chainBalances[chainKey]
            if (chainData && (parseFloat(chainData.userStakedBalance) > 0 || parseFloat(chainData.totalPoolBalance) > 0)) {
                positions.push({
                    chainId: chainData.chainId,
                    amount: chainData.userStakedBalanceFormatted,
                    token: "ETH",
                    rewards: (parseFloat(chainData.userStakedBalance) * 0.1).toFixed(2), // 10% rewards estimation
                    apy: chainData.pools.length > 0 ? chainData.pools[0].apy : (chainKey === 'flow' ? 6.1 : 7.3),
                    status: parseFloat(chainData.userStakedBalance) > 0 ? "Active" : "Available",
                    sourceChain: chainData.chainName
                })
            }
        })

        // If no positions with user stakes, show available staking chains
        if (positions.length === 0) {
            stakingChains.forEach((chainKey) => {
                const chainData = chainBalances[chainKey]
                positions.push({
                    chainId: chainData.chainId,
                    amount: "0.00",
                    token: "ETH",
                    rewards: "0.00",
                    apy: chainKey === 'flow' ? 6.1 : 7.3,
                    status: "Available",
                    sourceChain: chainData.chainName
                })
            })
        }

        return positions
    }, [chainBalances])

    return (
        <Card key={position.id}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{position.chainLogo}</span>
                        <div>
                            <h3 className="font-semibold">{position.pool}</h3>
                            <p className="text-sm text-muted-foreground">Aggregated Cross-Chain Position</p>
                        </div>
                    </div>
                    <Badge variant={position.status === "Active" ? "default" : "secondary"}>{position.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Staked</p>
                        <p className="font-medium">
                            {totalBalance} {position.token}
                        </p>
                        <p className="text-sm text-muted-foreground">{position.value}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Average APY</p>
                        <p className="font-medium text-green-600">{position.apy}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Rewards</p>
                        <p className="font-medium">
                            {position.rewards} {position.token}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Active Chains</p>
                        <p className="font-medium">{chainPositions.filter(cp => cp.status === "Active").length}</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-medium mb-3">Chain Breakdown</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {chainPositions.map((chainPosition) => (
                            <Card key={chainPosition.chainId} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
                                            {chainPosition.sourceChain.toLowerCase().includes("flow") ? "🌊" :
                                                chainPosition.sourceChain.toLowerCase().includes("hedera") ? "♦️" : "🔗"}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-light text-sm">{chainPosition.sourceChain}</p>
                                            <p className="text-sm font-bold">{chainPosition.amount} ETH</p>
                                            <p className="text-xs text-muted-foreground">APY: {chainPosition.apy}%</p>
                                        </div>
                                        <Badge variant={chainPosition.status === "Active" ? "default" : "outline"} className="text-xs">
                                            {chainPosition.status}
                                        </Badge>
                                    </div>
                                    <div className="flex space-x-2 mt-3">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            <TrendingUp className="mr-1 h-3 w-3" />
                                            Stake
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => onUnstake(position, chainPosition.chainId)}
                                            disabled={chainPosition.status !== "Active"}
                                        >
                                            Unstake
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 