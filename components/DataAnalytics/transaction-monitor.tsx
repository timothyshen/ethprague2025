"use client"

import { useEffect, useState } from "react"
import { useAccount, useWatchPendingTransactions } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock } from "lucide-react"
import { getTransactionUrl } from "@/lib/web3-utils"
import { useChainId } from "wagmi"

interface PendingTransaction {
  hash: string
  timestamp: number
  type: "stake" | "unstake" | "claim" | "bridge"
  amount?: string
}

export function TransactionMonitor() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([])

  useWatchPendingTransactions({
    onTransactions(transactions) {
      // Filter transactions from the connected address
      const userTxs = transactions.filter((tx) => tx.from === address)

      userTxs.forEach((tx) => {
        const pendingTx: PendingTransaction = {
          hash: tx.hash,
          timestamp: Date.now(),
          type: "stake", // You can determine this based on the transaction data
        }

        setPendingTxs((prev) => {
          const exists = prev.find((ptx) => ptx.hash === tx.hash)
          if (!exists) {
            return [...prev, pendingTx]
          }
          return prev
        })
      })
    },
  })

  // Remove confirmed transactions after some time
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingTxs(
        (prev) => prev.filter((tx) => Date.now() - tx.timestamp < 300000), // 5 minutes
      )
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (!address || pendingTxs.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Pending Transactions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingTxs.map((tx) => (
            <div key={tx.hash} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
                <div>
                  <p className="font-medium capitalize">{tx.type} Transaction</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Pending</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(getTransactionUrl(chainId, tx.hash), "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
