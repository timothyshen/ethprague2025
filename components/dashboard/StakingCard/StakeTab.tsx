"use client"

import { useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { formatEther, parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useChainBalance } from "@/hooks/use-chain-balance"
import { sepolia, flowTestnet, hederaTestnet } from "viem/chains"
import { useAnyStakeContract } from "@/hooks/use-anyStake-contract"
import { StakingPool } from "./types"

// Define supported source chains for cross-chain staking
const sourceChains = [
    { id: sepolia.id, name: "Ethereum", logo: "🔷", fee: "0.001 ETH" },
    { id: flowTestnet.id, name: "Flow", logo: "🌊", fee: "0.002 ETH" },
    { id: hederaTestnet.id, name: "Hedera", logo: "♦️", fee: "0.0015 ETH" },
]

interface StakeTabProps {
    pool: StakingPool
}

export function StakeTab({ pool }: StakeTabProps) {
    const [stakeAmount, setStakeAmount] = useState("")
    const [selectedSourceChain, setSelectedSourceChain] = useState<number>(sourceChains[0].id)
    const [stakeStep, setStakeStep] = useState<"source" | "amount" | "confirm">("source")

    const { address } = useAccount()
    const { toast } = useToast()
    const { data: balance } = useBalance({ address })
    const balances = useChainBalance()
    const { deposit, isPending: isStakingPending, isConfirming: isStakingConfirming } = useAnyStakeContract()

    const isStaking = isStakingPending || isStakingConfirming
    const selectedChainInfo = sourceChains.find((chain) => chain.id === selectedSourceChain)

    const handleSourceSelectionNext = async () => {
        if (!selectedSourceChain) {
            toast({
                title: "Source Chain Selection Required",
                description: "Please select which chain your ETH is coming from",
                variant: "destructive",
            })
            return
        }

        setStakeStep("amount")
    }

    const handleAmountBack = () => {
        setStakeStep("source")
    }

    const handleAmountNext = () => {
        if (!stakeAmount || Number(stakeAmount) <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid staking amount",
                variant: "destructive",
            })
            return
        }
        setStakeStep("confirm")
    }

    const handleConfirmBack = () => {
        setStakeStep("amount")
    }

    const handleStake = async () => {
        if (!stakeAmount || !address || !selectedSourceChain) return

        try {
            deposit(selectedSourceChain, parseEther(stakeAmount || "0"))

            toast({
                title: "Staking Initiated",
                description: `Staking ${stakeAmount} ${pool.token} from ${selectedChainInfo?.name}`,
            })

            setStakeAmount("")
            setStakeStep("source")
        } catch (error) {
            console.error("Staking error:", error)
            toast({
                title: "Staking Failed",
                description: "An error occurred while staking",
                variant: "destructive",
            })
        }
    }

    if (stakeStep === "source") {
        return (
            <div className="space-y-4">
                <div>
                    <Label className="text-base font-medium">Select Source Chain</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                        Choose which chain your ETH is currently on. We'll aggregate it into our Ethereum staking pool.
                    </p>

                    <RadioGroup value={selectedSourceChain.toString()} onValueChange={(v) => setSelectedSourceChain(Number(v))} className="space-y-3">
                        {sourceChains.map((chain) => (
                            <div key={chain.id} className="flex items-center space-x-2 rounded-md border p-3">
                                <RadioGroupItem value={chain.id.toString()} id={chain.id.toString()} />
                                <Label htmlFor={chain.id.toString()} className="flex flex-1 items-center justify-between cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl">{chain.logo}</span>
                                        <span>{chain.name}</span>
                                        {balances[chain.id] && (
                                            <p className="text-sm text-muted-foreground">
                                                Balance: {formatEther(balances[chain.id].value)} {balances[chain.id].symbol}
                                            </p>
                                        )}
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <Button onClick={handleSourceSelectionNext} className="w-full">
                    Next: Enter Amount
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        )
    }

    if (stakeStep === "amount") {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="stake-amount">Amount to Stake</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="stake-amount"
                            placeholder="0.0"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            type="number"
                        />
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Use the balance from the selected chain if available
                                if (balances[selectedSourceChain]) {
                                    setStakeAmount(formatEther(balances[selectedSourceChain].value))
                                } else if (balance) {
                                    setStakeAmount(formatEther(balance.value))
                                } else {
                                    setStakeAmount("0")
                                }
                            }}
                        >
                            Max
                        </Button>
                    </div>
                    {selectedChainInfo && balances[selectedSourceChain] && (
                        <p className="text-sm text-muted-foreground">
                            Balance on {selectedChainInfo.name}: {formatEther(balances[selectedSourceChain].value)} {balances[selectedSourceChain].symbol}
                        </p>
                    )}
                </div>

                <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleAmountBack} className="flex-1">
                        Back
                    </Button>
                    <Button
                        onClick={handleAmountNext}
                        disabled={!stakeAmount || Number(stakeAmount) <= 0}
                        className="flex-1"
                    >
                        Next: Confirm
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    if (stakeStep === "confirm") {
        return (
            <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">Confirm Staking Details</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-medium">
                                {stakeAmount} {pool.token}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Source Chain:</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-lg">{selectedChainInfo?.logo}</span>
                                <span className="font-medium">{selectedChainInfo?.name}</span>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Destination:</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-lg">🔷</span>
                                <span className="font-medium">Ethereum Staking Pool</span>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Bridge Fee:</span>
                            <span className="font-medium">{selectedChainInfo?.fee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">APY:</span>
                            <span className="font-medium text-green-600">10%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Lock Period:</span>
                            <span className="font-medium">{pool.lockPeriod} days</span>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleConfirmBack} className="flex-1">
                        Back
                    </Button>
                    <Button onClick={handleStake} disabled={isStaking || !address} className="flex-1">
                        {isStaking ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Confirm Stake"
                        )}
                    </Button>
                </div>
            </div>
        )
    }

    return null
} 