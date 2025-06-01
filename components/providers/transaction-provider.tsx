"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { formatEther, parseEther } from "viem"
import { useBalance } from "./balance-provider"
import { useToast } from "@/hooks/use-toast"
import { useNotification } from "@/components/providers/notification-provider"

// Transaction status types with the 2min 25s delay logic
export type TransactionStatus =
    | "pending"
    | "confirmed"
    | "waiting_compose"
    | "compose_complete"
    | "completed"
    | "failed"

export type TransactionType = "deposit" | "withdraw"

export interface Transaction {
    id: string
    hash: string
    type: TransactionType
    chainId: number
    chainName: string
    amount: string
    amountFormatted: string
    status: TransactionStatus
    timestamp: number
    confirmationTime?: number
    composeCompletionTime?: number
    completionTime?: number
    error?: string
    apy?: number
}

export interface TransactionContextType {
    transactions: Transaction[]
    activeTransactions: Transaction[]
    completedTransactions: Transaction[]
    addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => string
    updateTransactionStatus: (id: string, status: TransactionStatus, error?: string) => void
    getTransaction: (id: string) => Transaction | undefined
    clearCompletedTransactions: () => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

// Simulate the compose completion delay (2min 25s = 145 seconds)
const COMPOSE_DELAY_MS = 145 * 1000

// Supported chains for display names
const CHAIN_NAMES: Record<number, string> = {
    11155111: "Ethereum Sepolia",
    84532: "Base Sepolia",
    545: "Flow Testnet",
    296: "Hedera Testnet",
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const { address } = useAccount()
    const { toast } = useToast()
    const { sendStakingNotification, permission } = useNotification()
    const {
        addToChainBalance,
        subtractFromChainBalance,
        refreshBalances,
        markBalanceUpdatePending
    } = useBalance()

    const [transactions, setTransactions] = useState<Transaction[]>([])

    // Add a new transaction
    const addTransaction = useCallback((tx: Omit<Transaction, "id" | "timestamp">) => {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newTransaction: Transaction = {
            ...tx,
            id,
            timestamp: Date.now(),
            chainName: CHAIN_NAMES[tx.chainId] || `Chain ${tx.chainId}`,
        }

        setTransactions(prev => [newTransaction, ...prev])

        // Send initial notification
        if (permission === "granted") {
            sendStakingNotification(
                tx.type === "deposit" ? "stake-initiated" : "unstake-initiated",
                tx.amountFormatted,
                "ETH",
                { id: tx.chainId, name: newTransaction.chainName, logo: "🔷" },
                { id: 11155111, name: "Ethereum Mainnet", logo: "🔷" }
            )
        }

        toast({
            title: `${tx.type === "deposit" ? "Deposit" : "Withdrawal"} Initiated`,
            description: `Your ${tx.amountFormatted} ETH ${tx.type === "deposit" ? "deposit" : "withdrawal"} has been submitted`,
        })

        return id
    }, [permission, sendStakingNotification, toast])

    // Update transaction status
    const updateTransactionStatus = useCallback((
        id: string,
        status: TransactionStatus,
        error?: string
    ) => {
        setTransactions(prev => prev.map(tx => {
            if (tx.id !== id) return tx

            const updatedTx = { ...tx, status, error }

            // Set timestamps based on status
            if (status === "confirmed" && !tx.confirmationTime) {
                updatedTx.confirmationTime = Date.now()
            } else if (status === "compose_complete" && !tx.composeCompletionTime) {
                updatedTx.composeCompletionTime = Date.now()
            } else if (status === "completed" && !tx.completionTime) {
                updatedTx.completionTime = Date.now()
            }

            return updatedTx
        }))

        // Handle status-specific logic
        const transaction = transactions.find(tx => tx.id === id)
        if (!transaction) return

        switch (status) {
            case "confirmed":
                // Mark balance as pending update
                markBalanceUpdatePending(transaction.chainId)

                toast({
                    title: "Transaction Confirmed",
                    description: `Your ${transaction.type} transaction has been confirmed on the blockchain`,
                })

                if (permission === "granted") {
                    sendStakingNotification(
                        transaction.type === "deposit" ? "stake-confirmed" : "unstake-confirmed",
                        transaction.amountFormatted,
                        "ETH",
                        { id: transaction.chainId, name: transaction.chainName, logo: "🔷" },
                        { id: 11155111, name: "Ethereum Mainnet", logo: "🔷" }
                    )
                }
                break

            case "compose_complete":
                // Update balances after compose completion
                if (transaction.type === "deposit") {
                    addToChainBalance(transaction.chainId, parseEther(transaction.amountFormatted).toString())
                } else {
                    subtractFromChainBalance(transaction.chainId, parseEther(transaction.amountFormatted).toString())
                }

                toast({
                    title: "Cross-Chain Composition Complete",
                    description: `Your ${transaction.amountFormatted} ETH has been successfully processed`,
                })

                if (permission === "granted") {
                    sendStakingNotification(
                        transaction.type === "deposit" ? "stake-completed" : "unstake-completed",
                        transaction.amountFormatted,
                        "ETH",
                        { id: transaction.chainId, name: transaction.chainName, logo: "🔷" },
                        { id: 11155111, name: "Ethereum Mainnet", logo: "🔷" }
                    )
                }

                // Refresh balances to get the latest data
                refreshBalances()
                break

            case "failed":
                toast({
                    title: "Transaction Failed",
                    description: error || `Your ${transaction.type} transaction has failed`,
                    variant: "destructive",
                })
                break

            case "completed":
                toast({
                    title: "Transaction Completed",
                    description: `Your ${transaction.amountFormatted} ETH ${transaction.type} has been completed successfully`,
                })
                break
        }
    }, [
        transactions,
        markBalanceUpdatePending,
        addToChainBalance,
        subtractFromChainBalance,
        refreshBalances,
        toast,
        permission,
        sendStakingNotification
    ])

    // Get a specific transaction
    const getTransaction = useCallback((id: string) => {
        return transactions.find(tx => tx.id === id)
    }, [transactions])

    // Clear completed transactions
    const clearCompletedTransactions = useCallback(() => {
        setTransactions(prev => prev.filter(tx =>
            tx.status !== "completed" && tx.status !== "failed"
        ))
    }, [])

    // Automatic transaction progression logic
    useEffect(() => {
        const intervals: NodeJS.Timeout[] = []

        transactions.forEach(tx => {
            // Auto-progress from confirmed to waiting_compose after a short delay
            if (tx.status === "confirmed" && tx.confirmationTime) {
                const timeouts = setTimeout(() => {
                    updateTransactionStatus(tx.id, "waiting_compose")
                }, 2000) // 2 second delay for demonstration
                intervals.push(timeouts)
            }

            // Auto-progress from waiting_compose to compose_complete after 2min 25s
            if (tx.status === "waiting_compose" && tx.confirmationTime) {
                const elapsedTime = Date.now() - tx.confirmationTime
                const remainingTime = COMPOSE_DELAY_MS - elapsedTime

                if (remainingTime > 0) {
                    const timeout = setTimeout(() => {
                        updateTransactionStatus(tx.id, "compose_complete")
                    }, remainingTime)
                    intervals.push(timeout)
                } else {
                    // If somehow the time has already passed, complete immediately
                    updateTransactionStatus(tx.id, "compose_complete")
                }
            }

            // Auto-progress from compose_complete to completed after a short delay
            if (tx.status === "compose_complete" && tx.composeCompletionTime) {
                const timeout = setTimeout(() => {
                    updateTransactionStatus(tx.id, "completed")
                }, 3000) // 3 second delay for demonstration
                intervals.push(timeout)
            }
        })

        return () => {
            intervals.forEach(clearTimeout)
        }
    }, [transactions, updateTransactionStatus])

    // Filter transactions by status
    const activeTransactions = transactions.filter(tx =>
        !["completed", "failed"].includes(tx.status)
    )

    const completedTransactions = transactions.filter(tx =>
        ["completed", "failed"].includes(tx.status)
    )

    const contextValue: TransactionContextType = {
        transactions,
        activeTransactions,
        completedTransactions,
        addTransaction,
        updateTransactionStatus,
        getTransaction,
        clearCompletedTransactions,
    }

    return (
        <TransactionContext.Provider value={contextValue}>
            {children}
        </TransactionContext.Provider>
    )
}

export function useTransactions() {
    const context = useContext(TransactionContext)
    if (context === undefined) {
        throw new Error("useTransactions must be used within a TransactionProvider")
    }
    return context
}

// Helper function to get estimated completion time for a transaction
export function getEstimatedCompletionTime(transaction: Transaction): string {
    switch (transaction.status) {
        case "pending":
            return "Waiting for confirmation..."
        case "confirmed":
            return "Preparing for cross-chain composition..."
        case "waiting_compose":
            if (transaction.confirmationTime) {
                const elapsedTime = Date.now() - transaction.confirmationTime
                const remainingTime = Math.max(0, COMPOSE_DELAY_MS - elapsedTime)
                const remainingMinutes = Math.ceil(remainingTime / 60000)
                return `~${remainingMinutes} minute(s) remaining`
            }
            return "~2 minutes 25 seconds remaining"
        case "compose_complete":
            return "Finalizing transaction..."
        case "completed":
            return "Completed"
        case "failed":
            return "Failed"
        default:
            return "Processing..."
    }
} 