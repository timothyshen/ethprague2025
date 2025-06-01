"use client"

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// Transaction status types
export type TransactionStatus =
    | "pending"
    | "confirmed"
    | "waiting_compose"
    | "compose_complete"
    | "completed"
    | "failed"

// Transaction type
export type TransactionType = "deposit" | "withdraw"

// Transaction interface
export interface Transaction {
    id: string
    hash: string
    type: TransactionType
    chainId: number
    chainName: string
    amount: string
    amountFormatted: string
    apy?: number
    status: TransactionStatus
    timestamp: number
    confirmationTime?: number
    composeCompletionTime?: number
    completionTime?: number
    error?: string
}

// Transaction state interface
interface TransactionState {
    transactions: Transaction[]
    isLoading: boolean

    // Actions
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => string
    updateTransactionStatus: (id: string, status: TransactionStatus, error?: string) => void
    updateTransactionHash: (id: string, hash: string) => void
    clearCompletedTransactions: () => void
    getTransaction: (id: string) => Transaction | undefined
}

// Helper function to generate transaction ID
function generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to get estimated completion time
export function getEstimatedCompletionTime(transaction: Transaction): string {
    const now = Date.now()
    const elapsed = now - transaction.timestamp

    switch (transaction.status) {
        case "pending":
            return "~30 seconds remaining"
        case "confirmed":
            return "~2 minutes 25 seconds remaining"
        case "waiting_compose":
            // Cross-chain composition usually takes about 2:25
            const remaining = Math.max(0, 145000 - elapsed) // 2:25 in milliseconds
            const remainingSeconds = Math.ceil(remaining / 1000)
            const minutes = Math.floor(remainingSeconds / 60)
            const seconds = remainingSeconds % 60
            return remaining > 0 ? `~${minutes}:${seconds.toString().padStart(2, '0')} remaining` : "Completing soon..."
        case "compose_complete":
            return "Completing..."
        case "completed":
            return "Complete"
        case "failed":
            return "Failed"
        default:
            return "Processing..."
    }
}

// Initial state
const initialState = {
    transactions: [],
    isLoading: false
}

export const useTransactionStore = create<TransactionState>()(
    immer((set, get) => ({
        ...initialState,

        addTransaction: (transactionData) => {
            const id = generateTransactionId()
            const transaction: Transaction = {
                ...transactionData,
                id,
                timestamp: Date.now(),
                status: transactionData.status || "pending"
            }

            set((state) => {
                state.transactions.unshift(transaction)
            })

            // Simulate transaction progression for demo purposes
            setTimeout(() => {
                get().updateTransactionStatus(id, "confirmed")
                setTimeout(() => {
                    get().updateTransactionStatus(id, "waiting_compose")
                    setTimeout(() => {
                        get().updateTransactionStatus(id, "compose_complete")
                        setTimeout(() => {
                            get().updateTransactionStatus(id, "completed")
                        }, 5000) // 5 seconds to complete after compose
                    }, 145000) // 2:25 for cross-chain composition
                }, 30000) // 30 seconds for confirmation
            }, 5000) // 5 seconds for initial confirmation

            return id
        },

        updateTransactionStatus: (id, status, error) => {
            set((state) => {
                const transaction = state.transactions.find(tx => tx.id === id)
                if (transaction) {
                    transaction.status = status

                    const now = Date.now()
                    if (status === "confirmed" && !transaction.confirmationTime) {
                        transaction.confirmationTime = now
                    }
                    if (status === "compose_complete" && !transaction.composeCompletionTime) {
                        transaction.composeCompletionTime = now
                    }
                    if (status === "completed" && !transaction.completionTime) {
                        transaction.completionTime = now
                    }
                    if (status === "failed" && error) {
                        transaction.error = error
                    }
                }
            })
        },

        updateTransactionHash: (id, hash) => {
            set((state) => {
                const transaction = state.transactions.find(tx => tx.id === id)
                if (transaction) {
                    transaction.hash = hash
                }
            })
        },

        clearCompletedTransactions: () => {
            set((state) => {
                state.transactions = state.transactions.filter(
                    tx => !["completed", "failed"].includes(tx.status)
                )
            })
        },

        getTransaction: (id) => {
            return get().transactions.find(tx => tx.id === id)
        }
    }))
)

// Hook for using transaction state
export const useTransactions = () => {
    const store = useTransactionStore()

    const activeTransactions = store.transactions.filter(
        tx => !["completed", "failed"].includes(tx.status)
    )

    const completedTransactions = store.transactions.filter(
        tx => ["completed", "failed"].includes(tx.status)
    )

    return {
        // State
        transactions: store.transactions,
        activeTransactions,
        completedTransactions,
        isLoading: store.isLoading,

        // Actions
        addTransaction: store.addTransaction,
        updateTransactionStatus: store.updateTransactionStatus,
        updateTransactionHash: store.updateTransactionHash,
        clearCompletedTransactions: store.clearCompletedTransactions,
        getTransaction: store.getTransaction
    }
}

// Individual transaction hooks
export const useTransaction = (id: string) => {
    return useTransactionStore(state =>
        state.transactions.find(tx => tx.id === id)
    )
}

export const useActiveTransactions = () => {
    return useTransactionStore(state =>
        state.transactions.filter(tx => !["completed", "failed"].includes(tx.status))
    )
}

export const useCompletedTransactions = () => {
    return useTransactionStore(state =>
        state.transactions.filter(tx => ["completed", "failed"].includes(tx.status))
    )
} 