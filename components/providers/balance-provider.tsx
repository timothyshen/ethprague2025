"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAccount, useChainId } from "wagmi"
import { formatEther } from "viem"
import { useStakingAggregatorContract } from "@/hooks/use-stakingAggregator-contract"
import { useAnyStakeContract } from "@/hooks/use-anyStake-contract"
import { sepolia, flowTestnet, hederaTestnet, baseSepolia } from "viem/chains"

// Types for balance management
export interface ChainBalance {
    chainId: number
    chainName: string
    amount: string
    amountFormatted: string
    apy: number
    lastUpdated: number
}

export interface BalanceState {
    totalStakeInETH: string
    totalStakeFormatted: string
    chainBalances: Record<number, ChainBalance>
    isLoading: boolean
    lastRefresh: number
}

export interface BalanceContextType extends BalanceState {
    refreshBalances: () => Promise<void>
    updateChainBalance: (chainId: number, amount: string) => void
    addToChainBalance: (chainId: number, amount: string) => void
    subtractFromChainBalance: (chainId: number, amount: string) => void
    markBalanceUpdatePending: (chainId: number) => void
    getTotalStakeAcrossChains: () => string
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

// Supported chains configuration
const SUPPORTED_CHAINS = [
    { id: sepolia.id, name: "Ethereum Sepolia", symbol: "ETH", apy: 4.5 },
    { id: baseSepolia.id, name: "Base Sepolia", symbol: "ETH", apy: 5.2 },
    { id: flowTestnet.id, name: "Flow Testnet", symbol: "FLOW", apy: 6.8 },
    { id: hederaTestnet.id, name: "Hedera Testnet", symbol: "HBAR", apy: 7.1 },
]

export function BalanceProvider({ children }: { children: React.ReactNode }) {
    const { address } = useAccount()
    const chainId = useChainId()

    // Contract hooks
    const { stakedAmountData } = useStakingAggregatorContract()
    const { lockedBalancesData } = useAnyStakeContract()

    // State management
    const [balanceState, setBalanceState] = useState<BalanceState>({
        totalStakeInETH: "0",
        totalStakeFormatted: "0",
        chainBalances: {},
        isLoading: true,
        lastRefresh: 0,
    })

    // Refresh balances from all chains
    const refreshBalances = useCallback(async () => {
        if (!address) {
            setBalanceState(prev => ({ ...prev, isLoading: false }))
            return
        }

        setBalanceState(prev => ({ ...prev, isLoading: true }))

        try {
            const chainBalances: Record<number, ChainBalance> = {}
            let totalBalanceBigInt = BigInt(0)

            // Fetch main chain (Sepolia) balance from StakingAggregator
            try {
                const mainChainAmount = await stakedAmountData(address as `0x${string}`)
                if (mainChainAmount) {
                    const amountBigInt = BigInt(mainChainAmount.toString() || "0")
                    totalBalanceBigInt += amountBigInt

                    const sepoliaChain = SUPPORTED_CHAINS.find(c => c.id === sepolia.id)!
                    chainBalances[sepolia.id] = {
                        chainId: sepolia.id,
                        chainName: `${sepoliaChain.name} (Main Pool)`,
                        amount: amountBigInt.toString(),
                        amountFormatted: formatEther(amountBigInt),
                        apy: sepoliaChain.apy,
                        lastUpdated: Date.now(),
                    }
                }
            } catch (error) {
                console.error("Error fetching main chain balance:", error)
            }

            // Fetch other chain balances from AnyStake contracts
            for (const chain of SUPPORTED_CHAINS) {
                if (chain.id === sepolia.id) continue // Skip main chain, already processed

                try {
                    const chainAmount = await lockedBalancesData(chain.id, address as `0x${string}`)
                    if (chainAmount?.data) {
                        const amountBigInt = BigInt(chainAmount.data.toString() || "0")
                        totalBalanceBigInt += amountBigInt

                        chainBalances[chain.id] = {
                            chainId: chain.id,
                            chainName: chain.name,
                            amount: amountBigInt.toString(),
                            amountFormatted: formatEther(amountBigInt),
                            apy: chain.apy,
                            lastUpdated: Date.now(),
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching balance for ${chain.name}:`, error)
                }
            }

            setBalanceState({
                totalStakeInETH: totalBalanceBigInt.toString(),
                totalStakeFormatted: formatEther(totalBalanceBigInt),
                chainBalances,
                isLoading: false,
                lastRefresh: Date.now(),
            })
        } catch (error) {
            console.error("Error refreshing balances:", error)
            setBalanceState(prev => ({ ...prev, isLoading: false }))
        }
    }, [address, stakedAmountData, lockedBalancesData])

    // Update a specific chain balance
    const updateChainBalance = useCallback((chainId: number, amount: string) => {
        setBalanceState(prev => {
            const newChainBalances = { ...prev.chainBalances }
            const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)

            if (chain) {
                const amountBigInt = BigInt(amount)
                newChainBalances[chainId] = {
                    chainId,
                    chainName: chainId === sepolia.id ? `${chain.name} (Main Pool)` : chain.name,
                    amount: amountBigInt.toString(),
                    amountFormatted: formatEther(amountBigInt),
                    apy: chain.apy,
                    lastUpdated: Date.now(),
                }
            }

            // Recalculate total
            const totalBalanceBigInt = Object.values(newChainBalances)
                .reduce((sum, balance) => sum + BigInt(balance.amount), BigInt(0))

            return {
                ...prev,
                totalStakeInETH: totalBalanceBigInt.toString(),
                totalStakeFormatted: formatEther(totalBalanceBigInt),
                chainBalances: newChainBalances,
                lastRefresh: Date.now(),
            }
        })
    }, [])

    // Add to chain balance (for deposits)
    const addToChainBalance = useCallback((chainId: number, amount: string) => {
        setBalanceState(prev => {
            const currentBalance = prev.chainBalances[chainId]
            const currentAmount = currentBalance ? BigInt(currentBalance.amount) : BigInt(0)
            const addAmount = BigInt(amount)
            const newAmount = currentAmount + addAmount

            return updateChainBalance(chainId, newAmount.toString())
        })
    }, [updateChainBalance])

    // Subtract from chain balance (for withdrawals)
    const subtractFromChainBalance = useCallback((chainId: number, amount: string) => {
        setBalanceState(prev => {
            const currentBalance = prev.chainBalances[chainId]
            const currentAmount = currentBalance ? BigInt(currentBalance.amount) : BigInt(0)
            const subtractAmount = BigInt(amount)
            const newAmount = currentAmount >= subtractAmount ? currentAmount - subtractAmount : BigInt(0)

            return updateChainBalance(chainId, newAmount.toString())
        })
    }, [updateChainBalance])

    // Mark balance update as pending (for loading states during transactions)
    const markBalanceUpdatePending = useCallback((chainId: number) => {
        setBalanceState(prev => ({
            ...prev,
            chainBalances: {
                ...prev.chainBalances,
                [chainId]: prev.chainBalances[chainId] ? {
                    ...prev.chainBalances[chainId],
                    lastUpdated: Date.now(),
                } : prev.chainBalances[chainId]
            }
        }))
    }, [])

    // Get total stake across all chains
    const getTotalStakeAcrossChains = useCallback(() => {
        return balanceState.totalStakeFormatted
    }, [balanceState.totalStakeFormatted])

    // Initial load and refresh on account/chain change
    useEffect(() => {
        refreshBalances()
    }, [address, chainId, refreshBalances])

    // Auto-refresh every 30 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            refreshBalances()
        }, 30000) // 30 seconds

        return () => clearInterval(interval)
    }, [refreshBalances])

    const contextValue: BalanceContextType = {
        ...balanceState,
        refreshBalances,
        updateChainBalance,
        addToChainBalance,
        subtractFromChainBalance,
        markBalanceUpdatePending,
        getTotalStakeAcrossChains,
    }

    return (
        <BalanceContext.Provider value={contextValue}>
            {children}
        </BalanceContext.Provider>
    )
}

export function useBalance() {
    const context = useContext(BalanceContext)
    if (context === undefined) {
        throw new Error("useBalance must be used within a BalanceProvider")
    }
    return context
} 