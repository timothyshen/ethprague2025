"use client"

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useMemo } from 'react'

// Define chain types
export type SupportedChain = 'ethereum' | 'flow' | 'hedera'

// Chain configuration
export const CHAIN_CONFIG = {
    ethereum: { id: 11155111, name: 'Ethereum Sepolia' },
    flow: { id: 545, name: 'Flow Testnet' },
    hedera: { id: 296, name: 'Hedera Testnet' }
} as const

// Pool types
export type Pool = {
    id: string
    name: string
    apy: number
    totalStaked: string
    totalStakedFormatted: string
}

// Chain balance type
export type ChainBalance = {
    chainId: number
    chainName: string
    totalPoolBalance: string
    totalPoolBalanceFormatted: string
    userStakedBalance: string
    userStakedBalanceFormatted: string
    pools: Pool[]
}

// Balance state interface
interface BalanceState {
    // Total balance for ETH pool across all chains
    totalEthPoolBalance: string
    totalEthPoolBalanceFormatted: string

    // Each chain stake balance for each pool
    chainBalances: Record<SupportedChain, ChainBalance>

    // User total balance across all chains
    userTotalBalance: string
    userTotalBalanceFormatted: string

    // Loading states
    isLoading: boolean
    lastUpdated: number

    // Actions
    setChainBalance: (chain: SupportedChain, balance: ChainBalance) => void
    setUserStakedBalance: (chain: SupportedChain, amount: string) => void
    updatePoolBalance: (chain: SupportedChain, poolId: string, balance: string) => void
    refreshBalances: () => Promise<void>
    setLoading: (loading: boolean) => void
}

// Helper function to format ETH amounts
function formatEthAmount(amount: string): string {
    const num = parseFloat(amount)
    if (num === 0) return '0.00'
    if (num < 0.01) return '<0.01'
    return num.toFixed(4)
}

// Helper function to calculate total balance
function calculateTotalBalance(chainBalances: Record<SupportedChain, ChainBalance>): {
    totalEthPool: string
    userTotal: string
} {
    let totalEthPool = 0
    let userTotal = 0

    Object.values(chainBalances).forEach(chain => {
        totalEthPool += parseFloat(chain.totalPoolBalance || '0')
        userTotal += parseFloat(chain.userStakedBalance || '0')
    })

    return {
        totalEthPool: totalEthPool.toString(),
        userTotal: userTotal.toString()
    }
}

// Initial state
const initialChainBalance: ChainBalance = {
    chainId: 0,
    chainName: '',
    totalPoolBalance: '0',
    totalPoolBalanceFormatted: '0.00',
    userStakedBalance: '0',
    userStakedBalanceFormatted: '0.00',
    pools: []
}

const initialState = {
    totalEthPoolBalance: '0',
    totalEthPoolBalanceFormatted: '0.00',
    chainBalances: {
        ethereum: { ...initialChainBalance, chainId: CHAIN_CONFIG.ethereum.id, chainName: CHAIN_CONFIG.ethereum.name },
        flow: { ...initialChainBalance, chainId: CHAIN_CONFIG.flow.id, chainName: CHAIN_CONFIG.flow.name },
        hedera: { ...initialChainBalance, chainId: CHAIN_CONFIG.hedera.id, chainName: CHAIN_CONFIG.hedera.name }
    },
    userTotalBalance: '0',
    userTotalBalanceFormatted: '0.00',
    isLoading: false,
    lastUpdated: Date.now()
}

export const useBalanceStore = create<BalanceState>()(
    immer((set, get) => ({
        ...initialState,

        setChainBalance: (chain: SupportedChain, balance: ChainBalance) => {
            set((state) => {
                state.chainBalances[chain] = {
                    ...balance,
                    totalPoolBalanceFormatted: formatEthAmount(balance.totalPoolBalance),
                    userStakedBalanceFormatted: formatEthAmount(balance.userStakedBalance)
                }

                // Recalculate totals
                const totals = calculateTotalBalance(state.chainBalances)
                state.totalEthPoolBalance = totals.totalEthPool
                state.totalEthPoolBalanceFormatted = formatEthAmount(totals.totalEthPool)
                state.userTotalBalance = totals.userTotal
                state.userTotalBalanceFormatted = formatEthAmount(totals.userTotal)
                state.lastUpdated = Date.now()
            })
        },

        setUserStakedBalance: (chain: SupportedChain, amount: string) => {
            set((state) => {
                state.chainBalances[chain].userStakedBalance = amount
                state.chainBalances[chain].userStakedBalanceFormatted = formatEthAmount(amount)

                // Recalculate user total
                const totals = calculateTotalBalance(state.chainBalances)
                state.userTotalBalance = totals.userTotal
                state.userTotalBalanceFormatted = formatEthAmount(totals.userTotal)
                state.lastUpdated = Date.now()
            })
        },

        updatePoolBalance: (chain: SupportedChain, poolId: string, balance: string) => {
            set((state) => {
                const chainBalance = state.chainBalances[chain]
                const poolIndex = chainBalance.pools.findIndex(pool => pool.id === poolId)

                if (poolIndex !== -1) {
                    chainBalance.pools[poolIndex].totalStaked = balance
                    chainBalance.pools[poolIndex].totalStakedFormatted = formatEthAmount(balance)
                }

                // Recalculate chain total pool balance
                const chainTotalPool = chainBalance.pools.reduce((sum, pool) =>
                    sum + parseFloat(pool.totalStaked || '0'), 0
                )

                chainBalance.totalPoolBalance = chainTotalPool.toString()
                chainBalance.totalPoolBalanceFormatted = formatEthAmount(chainTotalPool.toString())

                // Recalculate global totals
                const totals = calculateTotalBalance(state.chainBalances)
                state.totalEthPoolBalance = totals.totalEthPool
                state.totalEthPoolBalanceFormatted = formatEthAmount(totals.totalEthPool)
                state.lastUpdated = Date.now()
            })
        },

        refreshBalances: async () => {
            set((state) => {
                state.isLoading = true
            })

            try {
                // Simulate API calls to fetch balances from different chains
                // In a real implementation, you would call your actual APIs here

                // Mock data for demonstration
                const mockBalances: Record<SupportedChain, Partial<ChainBalance>> = {
                    ethereum: {
                        totalPoolBalance: '30',
                        userStakedBalance: '20',
                        pools: [
                            { id: 'flow-staking', name: 'Flow Staking Pool', apy: 6.1, totalStaked: '10', totalStakedFormatted: '10' },
                            { id: 'hedera-staking', name: 'Hedera Staking Pool', apy: 7.3, totalStaked: '20', totalStakedFormatted: '20' },
                        ]
                    },
                    flow: {
                        totalPoolBalance: '567.8901',
                        userStakedBalance: '8.9012',
                        pools: [
                            { id: 'flow-staking', name: 'Flow Staking Pool', apy: 6.1, totalStaked: '567.8901', totalStakedFormatted: '567.8901' }
                        ]
                    },
                    hedera: {
                        totalPoolBalance: '234.5678',
                        userStakedBalance: '4.5678',
                        pools: [
                            { id: 'hedera-staking', name: 'Hedera Staking Pool', apy: 7.3, totalStaked: '234.5678', totalStakedFormatted: '234.5678' }
                        ]
                    }
                }

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Update balances
                Object.entries(mockBalances).forEach(([chain, balance]) => {
                    const currentChain = get().chainBalances[chain as SupportedChain]
                    get().setChainBalance(chain as SupportedChain, {
                        ...currentChain,
                        ...balance
                    } as ChainBalance)
                })

            } catch (error) {
                console.error('Error refreshing balances:', error)
            } finally {
                set((state) => {
                    state.isLoading = false
                })
            }
        },

        setLoading: (loading: boolean) => {
            set((state) => {
                state.isLoading = loading
            })
        }
    }))
)

// Hook for using balance state
export const useBalance = () => {
    const store = useBalanceStore()

    // Memoize the returned object to prevent unnecessary re-renders
    return useMemo(() => ({
        // State
        totalEthPoolBalance: store.totalEthPoolBalance,
        totalEthPoolBalanceFormatted: store.totalEthPoolBalanceFormatted,
        chainBalances: store.chainBalances,
        userTotalBalance: store.userTotalBalance,
        userTotalBalanceFormatted: store.userTotalBalanceFormatted,
        isLoading: store.isLoading,
        lastUpdated: store.lastUpdated,

        // Computed values
        totalStakeFormatted: store.userTotalBalanceFormatted,

        // Actions
        setChainBalance: store.setChainBalance,
        setUserStakedBalance: store.setUserStakedBalance,
        updatePoolBalance: store.updatePoolBalance,
        refreshBalances: store.refreshBalances,
        setLoading: store.setLoading
    }), [
        store.totalEthPoolBalance,
        store.totalEthPoolBalanceFormatted,
        store.chainBalances,
        store.userTotalBalance,
        store.userTotalBalanceFormatted,
        store.isLoading,
        store.lastUpdated,
        store.setChainBalance,
        store.setUserStakedBalance,
        store.updatePoolBalance,
        store.refreshBalances,
        store.setLoading
    ])
}

// Selector hooks for specific data
export const useChainBalance = (chain: SupportedChain) => {
    return useBalanceStore(state => state.chainBalances[chain])
}

export const useTotalBalances = () => {
    const totalEthPool = useBalanceStore(state => state.totalEthPoolBalanceFormatted)
    const userTotal = useBalanceStore(state => state.userTotalBalanceFormatted)

    // Memoize the returned object to prevent unnecessary re-renders
    return useMemo(() => ({
        totalEthPool,
        userTotal
    }), [totalEthPool, userTotal])
}

// Additional optimized selectors for better performance
export const useTotalEthPool = () => {
    return useBalanceStore(state => state.totalEthPoolBalanceFormatted)
}

export const useUserTotal = () => {
    return useBalanceStore(state => state.userTotalBalanceFormatted)
} 