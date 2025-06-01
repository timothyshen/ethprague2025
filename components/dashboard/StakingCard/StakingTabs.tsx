"use client"

import { useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { formatEther, parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Unlock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAnyStakeContract } from "@/hooks/use-anyStake-contract"
import { StakingPool } from "./types"
import { StakeTab } from "./StakeTab"

interface StakingTabsProps {
    pool: StakingPool
}

export function StakingTabs({ pool }: StakingTabsProps) {
    const [unstakeAmount, setUnstakeAmount] = useState("")
    const { address } = useAccount()
    const { toast } = useToast()
    const { data: balance } = useBalance({ address })
    const { isPending: isStakingPending, isConfirming: isStakingConfirming } = useAnyStakeContract()

    const isStaking = isStakingPending || isStakingConfirming

    const handleUnstake = async () => {
        if (!unstakeAmount || !address) return

        try {
            toast({
                title: "Unstaking Initiated",
                description: `Unstaking ${unstakeAmount} ${pool.token}`,
            })
            setUnstakeAmount("")
        } catch (error) {
            console.error("Unstaking error:", error)
            toast({
                title: "Unstaking Failed",
                description: "An error occurred while unstaking",
                variant: "destructive",
            })
        }
    }

    return (
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
                <StakeTab pool={pool} />
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
                        <Button variant="outline" onClick={() => setUnstakeAmount(pool.userStaked)}>
                            Max
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Staked: {pool.userStaked} {pool.token}
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
    )
} 