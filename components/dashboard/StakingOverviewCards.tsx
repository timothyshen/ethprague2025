import { BarChart3, Gift, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StakingOverviewCardsProps {
    totalBalance: string | undefined
    totalRewards: number
    totalPositions: number
    totalChains: number
}

export function StakingOverviewCards({
    totalBalance,
    totalRewards,
    totalPositions,
    totalChains,
}: StakingOverviewCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Staked Value</p>
                            <p className="text-2xl font-bold">${(Number(totalBalance || "0") * 1700).toFixed(2)}</p>
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
                            <p className="text-2xl font-bold">{totalPositions}</p>
                            <p className="text-sm text-muted-foreground">From {totalChains} source chains</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 