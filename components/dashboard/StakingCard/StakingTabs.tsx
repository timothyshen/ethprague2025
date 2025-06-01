"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance, useChainId } from "wagmi"
import { parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Unlock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAnyStakeContract } from "@/hooks/use-anyStake-contract"
import { StakingPool } from "./types"
import { StakeTab } from "./StakeTab"
import { useNotification, ChainInfo } from "@/components/providers/notification-provider"
import { useTransactions } from "@/components/providers/transaction-provider"
import { useBalance as useBalanceProvider } from "@/components/providers/balance-provider"
import { sepolia } from "viem/chains"

// Destination chain for unstaking is always Ethereum
const destinationChain: ChainInfo = {
    id: sepolia.id,
    name: "Ethereum",
    logo: "🔷"
}

// Source chain for unstaking is always the staking pool
const sourceChain: ChainInfo = {
    id: sepolia.id,
    name: "Ethereum Staking Pool",
    logo: "🔷"
}

interface StakingTabsProps {
    pool: StakingPool
}

export function StakingTabs({ pool }: StakingTabsProps) {
    const [unstakeAmount, setUnstakeAmount] = useState("")
    const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null)

    const { address } = useAccount()
    const chainId = useChainId()

    const { toast } = useToast()
    const { withdraw, hash, isPending: isStakingPending, isConfirming: isStakingConfirming } = useAnyStakeContract()
    const { permission, sendStakingNotification } = useNotification()
    const { addTransaction, updateTransactionHash, updateTransactionStatus } = useTransactions()
    const { setUserStakedBalance } = useBalanceProvider()

    const isStaking = isStakingPending || isStakingConfirming

    // Update transaction hash when it becomes available
    useEffect(() => {
        if (hash && currentTransactionId) {
            updateTransactionHash(currentTransactionId, hash)
            setCurrentTransactionId(null) // Clear the ID after updating
        }
    }, [hash, currentTransactionId, updateTransactionHash])

    const handleUnstake = async () => {
        if (!unstakeAmount || !address) return

        try {
            // Create transaction in the transaction provider
            const transactionId = addTransaction({
                hash: `0x${Math.random().toString(16).substr(2, 64)}`, // Temporary hash, will be updated
                type: "withdraw",
                chainId: sepolia.id,
                chainName: "Ethereum",
                amount: unstakeAmount,
                amountFormatted: `${unstakeAmount}`,
                apy: pool.apy,
                status: "pending"
            })

            // Store transaction ID to update hash later
            setCurrentTransactionId(transactionId)

            // Send notification for unstaking initiated
            if (permission === "granted") {
                sendStakingNotification(
                    "unstake-initiated",
                    unstakeAmount,
                    pool.token,
                    sourceChain,
                    destinationChain
                )
            }

            // Call the withdraw function
            await withdraw(sepolia.id, parseEther(unstakeAmount))

            toast({
                title: "Unstaking Initiated",
                description: `Unstaking ${unstakeAmount} ${pool.token}`,
            })

            // Set up the unstaking progression flow
            // After 2 seconds: unstake-confirmed notification
            setTimeout(() => {
                if (permission === "granted") {
                    sendStakingNotification(
                        "unstake-confirmed",
                        unstakeAmount,
                        pool.token,
                        sourceChain,
                        destinationChain
                    )
                }
            }, 2000)

            // After 2 minutes 25 seconds: unstake-completed notification and balance update
            setTimeout(() => {
                // Update balance provider - reduce user staked amount
                const currentUserStaked = parseFloat(pool.userStaked)
                const unstakeAmountNum = parseFloat(unstakeAmount)
                const newUserStaked = Math.max(0, currentUserStaked - unstakeAmountNum).toString()

                // Update the appropriate staking chain balance, not Ethereum directly
                // Since users can only stake on Flow or Hedera, we need to determine which chain this pool is from
                // Map chainId to SupportedChain
                const getChainFromId = (id: number): 'flow' | 'hedera' => {
                    if (id === 545) return 'flow'
                    if (id === 296) return 'hedera'
                    return 'flow' // Default fallback
                }

                setUserStakedBalance(stakingChain, newUserStaked)

                // Send completion notification
                if (permission === "granted") {
                    sendStakingNotification(
                        "unstake-completed",
                        unstakeAmount,
                        pool.token,
                        sourceChain,
                        destinationChain
                    )
                }

                toast({
                    title: "Unstaking Completed",
                    description: `Successfully unstaked ${unstakeAmount} ${pool.token}`,
                })
            }, 145000) // 2 minutes 25 seconds

            // Reset form
            setUnstakeAmount("")

        } catch (error: any) {
            console.error('Unstaking error:', error)

            toast({
                title: "Unstaking Failed",
                description: error?.message || "Failed to initiate unstaking transaction",
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

                {permission === "granted" && (
                    <div className="p-2 bg-primary/10 rounded text-sm mb-2">
                        <p className="text-primary font-medium">Notifications enabled</p>
                        <p className="text-muted-foreground">You'll receive notifications when your unstaking status changes</p>
                    </div>
                )}

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