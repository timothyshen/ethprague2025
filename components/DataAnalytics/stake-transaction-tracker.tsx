"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Bell,
  Wallet,
  Timer,
  Lock,
  Coins,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { useNotification } from "@/components/providers/notification-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTransactions, getEstimatedCompletionTime, type Transaction, type TransactionStatus } from "@/components/providers/transaction-provider"
import { useBalance } from "@/components/providers/balance-provider"

// Helper function to get status badge variant and text
function getStatusBadge(status: TransactionStatus) {
  switch (status) {
    case "pending":
      return { variant: "outline" as const, icon: <Clock className="h-3 w-3 mr-1" />, text: "Pending" }
    case "confirmed":
      return {
        variant: "secondary" as const,
        icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
        text: "Confirmed",
      }
    case "waiting_compose":
      return {
        variant: "secondary" as const,
        icon: <Timer className="h-3 w-3 mr-1" />,
        text: "Composing"
      }
    case "compose_complete":
      return {
        variant: "default" as const,
        icon: <Lock className="h-3 w-3 mr-1" />,
        text: "Processing"
      }
    case "completed":
      return { variant: "default" as const, icon: <CheckCircle2 className="h-3 w-3 mr-1" />, text: "Completed" }
    case "failed":
      return { variant: "destructive" as const, icon: <AlertCircle className="h-3 w-3 mr-1" />, text: "Failed" }
  }
}

// Component to display the steps of a staking transaction
function StakingTransactionSteps({ transaction }: { transaction: Transaction }) {
  const steps = [
    {
      name: "Transaction Initiated",
      description: `Your ${transaction.type} transaction has been submitted`,
      status: "pending"
    },
    {
      name: "Blockchain Confirmation",
      description: "Transaction confirmed on the blockchain",
      status: "confirmed"
    },
    {
      name: "Cross-Chain Composition",
      description: "Waiting for cross-chain message completion (2min 25s)",
      status: "waiting_compose"
    },
    {
      name: "Staking Complete",
      description: `Your assets are now ${transaction.type === "deposit" ? "staking and earning rewards" : "unstaked"}`,
      status: "completed"
    },
  ]

  // Determine current step based on transaction status
  let currentStep = 0
  switch (transaction.status) {
    case "pending":
      currentStep = 0
      break
    case "confirmed":
      currentStep = 1
      break
    case "waiting_compose":
      currentStep = 2
      break
    case "compose_complete":
    case "completed":
      currentStep = 3
      break
    case "failed":
      currentStep = -1 // Special case for failed
      break
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Progress value={currentStep >= 0 ? ((currentStep + 1) / steps.length) * 100 : 0} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Initiated</span>
          <span>{getEstimatedCompletionTime(transaction)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="mr-3 mt-0.5">
              {index < currentStep || (currentStep >= 3 && index === 3) ? (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                </div>
              ) : index === currentStep ? (
                <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted"></div>
              )}
            </div>
            <div>
              <p className={`font-medium text-sm ${index <= currentStep || (currentStep >= 3 && index === 3) ? "" : "text-muted-foreground"
                }`}>
                {step.name}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Transaction card component
function TransactionCard({ transaction }: { transaction: Transaction }) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { updateTransactionStatus } = useTransactions()
  const statusBadge = getStatusBadge(transaction.status)

  const handleRetry = () => {
    // In a real app, this would retry the transaction
    updateTransactionStatus(transaction.id, "pending")
    toast({
      title: "Retrying transaction",
      description: `Retrying ${transaction.type} transaction for ${transaction.amountFormatted} ETH`,
    })
  }

  const handleViewExplorer = () => {
    // In a real app, this would open the relevant block explorer
    const explorerUrls: Record<number, string> = {
      11155111: "https://sepolia.etherscan.io/tx/",
      84532: "https://sepolia.basescan.org/tx/",
      545: "https://testnet.flowdiver.io/tx/",
      296: "https://hashscan.io/testnet/transaction/",
    }

    const baseUrl = explorerUrls[transaction.chainId] || "https://etherscan.io/tx/"
    window.open(`${baseUrl}${transaction.hash}`, "_blank")
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <span className="text-lg">🔷</span>
              <span className="ml-2">{transaction.chainName}</span>
            </div>
            <div>
              <div className="font-medium">
                {transaction.amountFormatted} ETH
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {transaction.type} {transaction.apy && `• APR: ${transaction.apy}%`}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={statusBadge.variant} className="flex items-center">
              {statusBadge.icon}
              {statusBadge.text}
            </Badge>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      <CollapsibleContent>
        <div className="px-4 pb-4 pt-0 border-t">
          <div className="py-3 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Transaction Hash</p>
                <p className="font-mono text-xs">{transaction.hash}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Initiated</p>
                <p>{formatTimestamp(transaction.timestamp)}</p>
              </div>
              {transaction.confirmationTime && (
                <div>
                  <p className="text-muted-foreground">Confirmed</p>
                  <p>{formatTimestamp(transaction.confirmationTime)}</p>
                </div>
              )}
              {transaction.composeCompletionTime && (
                <div>
                  <p className="text-muted-foreground">Compose Complete</p>
                  <p>{formatTimestamp(transaction.composeCompletionTime)}</p>
                </div>
              )}
            </div>

            {!["completed", "failed"].includes(transaction.status) && (
              <StakingTransactionSteps transaction={transaction} />
            )}

            {transaction.status === "failed" && transaction.error && (
              <div className="bg-destructive/10 p-3 rounded-md text-sm text-destructive">
                <p className="font-medium">Error:</p>
                <p>{transaction.error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              {transaction.status === "failed" && (
                <Button size="sm" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleViewExplorer}>
                <ExternalLink className="h-4 w-4 mr-1" />
                View on Explorer
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function StakingTransactionTracker() {
  const {
    transactions,
    activeTransactions,
    completedTransactions,
    clearCompletedTransactions
  } = useTransactions()
  const { chainBalances, totalStakeFormatted, refreshBalances } = useBalance()
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false)
  const { toast } = useToast()
  const { permission, isSupported, setShowPermissionDialog } = useNotification()

  // Effect to check notification permission
  useEffect(() => {
    if (permission === "granted") {
      setNotificationsEnabled(true)
    }
  }, [permission])

  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      if (permission !== "granted") {
        setShowPermissionDialog(true)
      } else {
        setNotificationsEnabled(true)
        toast({
          title: "Staking notifications enabled",
          description: "You'll receive notifications when your staking transactions change status",
        })
      }
    } else {
      setNotificationsEnabled(false)
      toast({
        title: "Staking notifications disabled",
        description: "You won't receive notifications for staking updates",
      })
    }
  }



  const handleRefreshBalances = () => {
    refreshBalances()
    toast({
      title: "Balances refreshed",
      description: "Latest balance data has been fetched from all chains",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Staking Transaction Tracker</CardTitle>
          <CardDescription>
            Monitor your staking transactions and total stake: {totalStakeFormatted} ETH across {Object.keys(chainBalances).length} chains
          </CardDescription>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleRefreshBalances}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          {isSupported && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="notifications" className="text-sm cursor-pointer">
                <Bell className="h-4 w-4 inline-block mr-1" />
                Notifications
              </Label>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
                disabled={permission === "denied"}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Active Transactions
              {activeTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">
              Transaction History
              {completedTransactions.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {completedTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeTransactions.length > 0 ? (
              activeTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No active transactions</p>
                <p className="text-sm">Your staking transactions will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {completedTransactions.length} completed transaction(s)
              </p>
            </div>
            {completedTransactions.length > 0 ? (
              completedTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No transaction history</p>
                <p className="text-sm">Completed transactions will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
