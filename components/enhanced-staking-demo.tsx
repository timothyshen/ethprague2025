"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Coins, TrendingUp, Activity } from "lucide-react"
import { useBalance } from "@/components/providers/balance-provider"
import { useTransactions } from "@/components/providers/transaction-provider"
import { useEnhancedStaking } from "@/hooks/use-enhanced-staking"
import { formatEther } from "viem"

const SUPPORTED_CHAINS = [
    { id: 11155111, name: "Ethereum Sepolia", symbol: "ETH", apy: 4.5 },
    { id: 84532, name: "Base Sepolia", symbol: "ETH", apy: 5.2 },
    { id: 545, name: "Flow Testnet", symbol: "FLOW", apy: 6.8 },
    { id: 296, name: "Hedera Testnet", symbol: "HBAR", apy: 7.1 },
]

export function EnhancedStakingDemo() {
    const [selectedChain, setSelectedChain] = useState<string>(SUPPORTED_CHAINS[0].id.toString())
    const [stakeAmount, setStakeAmount] = useState("")
    const [withdrawAmount, setWithdrawAmount] = useState("")

    // Global state hooks
    const {
        totalStakeFormatted,
        chainBalances,
        isLoading: balanceLoading,
        refreshBalances
    } = useBalance()

    const {
        activeTransactions,
        completedTransactions
    } = useTransactions()

    // Enhanced staking functions
    const {
        enhancedDeposit,
        enhancedWithdraw,
        isStaking,
        getDepositQuote,
        getWithdrawQuote
    } = useEnhancedStaking()

    const selectedChainData = SUPPORTED_CHAINS.find(c => c.id.toString() === selectedChain)
    const chainBalance = chainBalances[parseInt(selectedChain)]

    const handleStake = async () => {
        if (!stakeAmount || !selectedChainData) return

        try {
            await enhancedDeposit(selectedChainData.id, stakeAmount)
            setStakeAmount("")
        } catch (error) {
            console.error("Staking error:", error)
        }
    }

    const handleWithdraw = async () => {
        if (!withdrawAmount || !selectedChainData) return

        try {
            await enhancedWithdraw(selectedChainData.id, withdrawAmount)
            setWithdrawAmount("")
        } catch (error) {
            console.error("Withdrawal error:", error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Balance Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        Total Staking Balance
                    </CardTitle>
                    <CardDescription>
                        Your aggregated stake across all supported chains
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {balanceLoading ? "Loading..." : `${totalStakeFormatted} ETH`}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {Object.values(chainBalances).map((balance) => (
                            <Badge key={balance.chainId} variant="outline" className="flex items-center gap-1">
                                <span className="text-xs">{balance.chainName.split(" ")[0]}:</span>
                                <span className="font-mono">{parseFloat(balance.amountFormatted).toFixed(4)} ETH</span>
                            </Badge>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshBalances}
                        className="mt-4"
                    >
                        Refresh Balances
                    </Button>
                </CardContent>
            </Card>

            {/* Staking Interface */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stake */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Stake ETH
                        </CardTitle>
                        <CardDescription>
                            Stake your ETH across different chains to earn rewards
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="chain-select">Source Chain</Label>
                            <Select value={selectedChain} onValueChange={setSelectedChain}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select chain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUPPORTED_CHAINS.map((chain) => (
                                        <SelectItem key={chain.id} value={chain.id.toString()}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{chain.name}</span>
                                                <Badge variant="secondary" className="ml-2">
                                                    {chain.apy}% APY
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stake-amount">Amount to Stake</Label>
                            <Input
                                id="stake-amount"
                                type="number"
                                placeholder="0.0"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                            />
                            {chainBalance && (
                                <p className="text-sm text-muted-foreground">
                                    Available: {chainBalance.amountFormatted} ETH
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleStake}
                            disabled={!stakeAmount || isStaking}
                            className="w-full"
                        >
                            {isStaking ? "Staking..." : "Stake ETH"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Withdraw */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Withdraw ETH
                        </CardTitle>
                        <CardDescription>
                            Withdraw your staked ETH from any supported chain
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-chain-select">From Chain</Label>
                            <Select value={selectedChain} onValueChange={setSelectedChain}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select chain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(chainBalances)
                                        .filter(balance => parseFloat(balance.amountFormatted) > 0)
                                        .map((balance) => (
                                            <SelectItem key={balance.chainId} value={balance.chainId.toString()}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{balance.chainName}</span>
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        {parseFloat(balance.amountFormatted).toFixed(4)} ETH
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="withdraw-amount">Amount to Withdraw</Label>
                            <Input
                                id="withdraw-amount"
                                type="number"
                                placeholder="0.0"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                            {chainBalance && (
                                <p className="text-sm text-muted-foreground">
                                    Staked: {chainBalance.amountFormatted} ETH
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleWithdraw}
                            disabled={!withdrawAmount || isStaking || !chainBalance || parseFloat(chainBalance.amountFormatted) === 0}
                            variant="outline"
                            className="w-full"
                        >
                            {isStaking ? "Processing..." : "Withdraw ETH"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction Status</CardTitle>
                    <CardDescription>
                        Monitor active and recent transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium mb-2">Active Transactions</h4>
                            {activeTransactions.length > 0 ? (
                                <div className="space-y-2">
                                    {activeTransactions.slice(0, 3).map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <p className="text-sm font-medium capitalize">{tx.type}</p>
                                                <p className="text-xs text-muted-foreground">{tx.amountFormatted} ETH</p>
                                            </div>
                                            <Badge variant="outline">{tx.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No active transactions</p>
                            )}
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Recent Completions</h4>
                            {completedTransactions.length > 0 ? (
                                <div className="space-y-2">
                                    {completedTransactions.slice(0, 3).map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <p className="text-sm font-medium capitalize">{tx.type}</p>
                                                <p className="text-xs text-muted-foreground">{tx.amountFormatted} ETH</p>
                                            </div>
                                            <Badge variant={tx.status === "completed" ? "default" : "destructive"}>
                                                {tx.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No completed transactions</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 