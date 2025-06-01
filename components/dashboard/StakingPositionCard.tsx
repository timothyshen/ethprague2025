import { TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChainPosition, StakingPosition } from "./types"
import { flowTestnet, hederaTestnet } from "viem/chains"


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
    return (
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
                            {totalBalance} {position.token}
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
                        <p className="text-sm text-muted-foreground">Total Chains</p>
                        <p className="font-medium">{totalChains}</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-medium mb-3">Chain Positions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chainPositions.map((chainPosition) => (
                            <Card key={chainPosition.chainId} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
                                            {chainPosition.sourceChain === "Ethereum" ? "🔷" :
                                                chainPosition.sourceChain === "Flow" ? "🌊" :
                                                    chainPosition.sourceChain === "Hedera" ? "♦️" : "🔗"}
                                        </div>
                                        <div>
                                            <p className="font-medium">{chainPosition.sourceChain}</p>
                                            <p className="text-sm font-bold">{chainPosition.amount} ETH</p>
                                        </div>
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