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
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { useNotification } from "@/components/notification-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Define the transaction status types
type TransactionStatus = "pending" | "processing" | "completed" | "failed"

// Define the transaction interface
interface BridgeTransaction {
  id: string
  sourceChain: {
    name: string
    logo: string
  }
  destinationChain: {
    name: string
    logo: string
  }
  amount: string
  token: string
  timestamp: string
  status: TransactionStatus
  hash: string
  estimatedCompletionTime?: string
  currentStep?: number
  totalSteps?: number
  error?: string
  lastUpdated?: number // Timestamp for last status update
}

// Mock data for bridge transactions
const initialTransactions: BridgeTransaction[] = [
  {
    id: "tx1",
    sourceChain: { name: "Flow", logo: "🌊" },
    destinationChain: { name: "Ethereum", logo: "🔷" },
    amount: "0.5",
    token: "ETH",
    timestamp: "2024-01-20 14:30",
    status: "processing",
    hash: "0x1234...5678",
    estimatedCompletionTime: "~10 minutes remaining",
    currentStep: 2,
    totalSteps: 4,
    lastUpdated: Date.now(),
  },
  {
    id: "tx2",
    sourceChain: { name: "Hedera", logo: "♦️" },
    destinationChain: { name: "Ethereum", logo: "🔷" },
    amount: "0.75",
    token: "ETH",
    timestamp: "2024-01-20 13:15",
    status: "pending",
    hash: "0x2345...6789",
    estimatedCompletionTime: "Waiting for confirmation",
    lastUpdated: Date.now(),
  },
  {
    id: "tx3",
    sourceChain: { name: "Flow", logo: "🌊" },
    destinationChain: { name: "Ethereum", logo: "🔷" },
    amount: "1.2",
    token: "ETH",
    timestamp: "2024-01-20 10:45",
    status: "completed",
    hash: "0x3456...7890",
    lastUpdated: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: "tx4",
    sourceChain: { name: "Hedera", logo: "♦️" },
    destinationChain: { name: "Ethereum", logo: "🔷" },
    amount: "0.3",
    token: "ETH",
    timestamp: "2024-01-19 16:20",
    status: "failed",
    hash: "0x4567...8901",
    error: "Insufficient gas for transaction",
    lastUpdated: Date.now() - 7200000, // 2 hours ago
  },
]

// Helper function to get status badge variant and text
function getStatusBadge(status: TransactionStatus) {
  switch (status) {
    case "pending":
      return { variant: "outline" as const, icon: <Clock className="h-3 w-3 mr-1" />, text: "Pending" }
    case "processing":
      return {
        variant: "secondary" as const,
        icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
        text: "Processing",
      }
    case "completed":
      return { variant: "default" as const, icon: <CheckCircle2 className="h-3 w-3 mr-1" />, text: "Completed" }
    case "failed":
      return { variant: "destructive" as const, icon: <AlertCircle className="h-3 w-3 mr-1" />, text: "Failed" }
  }
}

// Component to display the steps of a bridge transaction
function BridgeTransactionSteps({ transaction }: { transaction: BridgeTransaction }) {
  const steps = [
    { name: "Transaction Initiated", description: "Your transaction has been submitted to the source chain" },
    { name: "Source Chain Confirmation", description: "Transaction confirmed on the source chain" },
    { name: "Bridge Processing", description: "Assets are being transferred across chains" },
    { name: "Destination Chain Confirmation", description: "Assets received on Ethereum" },
  ]

  const currentStep = transaction.currentStep || 0

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Initiated</span>
          <span>Completed</span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="mr-3 mt-0.5">
              {index < currentStep ? (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                </div>
              ) : index === currentStep ? (
                <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted"></div>
              )}
            </div>
            <div>
              <p className={`font-medium text-sm ${index <= currentStep ? "" : "text-muted-foreground"}`}>
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
function TransactionCard({ transaction }: { transaction: BridgeTransaction }) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const statusBadge = getStatusBadge(transaction.status)

  const handleRetry = () => {
    toast({
      title: "Retrying transaction",
      description: `Retrying bridge transaction for ${transaction.amount} ${transaction.token}`,
    })
  }

  const handleViewExplorer = () => {
    // In a real app, this would open the relevant block explorer
    window.open(`https://etherscan.io/tx/${transaction.hash}`, "_blank")
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <span className="text-lg">{transaction.sourceChain.logo}</span>
              <ArrowRight className="h-4 w-4 mx-1" />
              <span className="text-lg">{transaction.destinationChain.logo}</span>
            </div>
            <div>
              <div className="font-medium">
                {transaction.amount} {transaction.token}
              </div>
              <div className="text-xs text-muted-foreground">
                {transaction.sourceChain.name} to {transaction.destinationChain.name}
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
                <p className="font-mono">{transaction.hash}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Timestamp</p>
                <p>{transaction.timestamp}</p>
              </div>
            </div>

            {transaction.status === "processing" && transaction.currentStep && transaction.totalSteps && (
              <BridgeTransactionSteps transaction={transaction} />
            )}

            {transaction.status === "pending" && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{transaction.estimatedCompletionTime}</span>
              </div>
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

export function BridgeTransactionTracker() {
  const [transactions, setTransactions] = useState<BridgeTransaction[]>(initialTransactions)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false)
  const { toast } = useToast()
  const { permission, isSupported, sendNotification, setShowPermissionDialog } = useNotification()

  const activeTransactions = transactions.filter((tx) => tx.status === "pending" || tx.status === "processing")
  const completedTransactions = transactions.filter((tx) => tx.status === "completed" || tx.status === "failed")

  // Effect to simulate transaction status updates
  useEffect(() => {
    // Only run the simulation if we have active transactions
    if (activeTransactions.length === 0) return

    const simulateStatusUpdates = () => {
      setTransactions((currentTransactions) => {
        const updatedTransactions = [...currentTransactions]

        // Find a random active transaction to update
        const activeIndices = updatedTransactions
          .map((tx, index) => (tx.status === "pending" || tx.status === "processing" ? index : -1))
          .filter((index) => index !== -1)

        if (activeIndices.length === 0) return currentTransactions

        const randomIndex = activeIndices[Math.floor(Math.random() * activeIndices.length)]
        const transaction = { ...updatedTransactions[randomIndex] }

        // Update the transaction status
        if (transaction.status === "pending") {
          transaction.status = "processing"
          transaction.currentStep = 1
          transaction.totalSteps = 4
          transaction.estimatedCompletionTime = "~15 minutes remaining"

          // Send notification if enabled
          if (notificationsEnabled && permission === "granted") {
            sendNotification("Transaction Processing", {
              body: `Your ${transaction.amount} ${transaction.token} transaction from ${transaction.sourceChain.name} is now processing`,
              icon: "/favicon.ico",
            })
          }

          toast({
            title: "Transaction Processing",
            description: `Your ${transaction.amount} ${transaction.token} transaction from ${transaction.sourceChain.name} is now processing`,
          })
        } else if (transaction.status === "processing") {
          if (transaction.currentStep && transaction.currentStep < 4) {
            transaction.currentStep += 1

            if (transaction.currentStep === 4) {
              transaction.status = "completed"

              // Send notification if enabled
              if (notificationsEnabled && permission === "granted") {
                sendNotification("Transaction Completed", {
                  body: `Your ${transaction.amount} ${transaction.token} has been successfully bridged to Ethereum`,
                  icon: "/favicon.ico",
                })
              }

              toast({
                title: "Transaction Completed",
                description: `Your ${transaction.amount} ${transaction.token} has been successfully bridged to Ethereum`,
              })
            } else {
              // Send notification for step progress if enabled
              if (notificationsEnabled && permission === "granted") {
                sendNotification("Transaction Update", {
                  body: `Your bridge transaction is at step ${transaction.currentStep} of ${transaction.totalSteps}`,
                  icon: "/favicon.ico",
                })
              }
            }
          }
        }

        transaction.lastUpdated = Date.now()
        updatedTransactions[randomIndex] = transaction

        return updatedTransactions
      })
    }

    // Simulate updates every 15-30 seconds
    const interval = setInterval(
      () => {
        simulateStatusUpdates()
      },
      Math.random() * 15000 + 15000,
    )

    return () => clearInterval(interval)
  }, [activeTransactions.length, notificationsEnabled, permission, sendNotification, toast])

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
          title: "Transaction notifications enabled",
          description: "You'll receive notifications when your transactions change status",
        })
      }
    } else {
      setNotificationsEnabled(false)
      toast({
        title: "Transaction notifications disabled",
        description: "You won't receive notifications for transaction updates",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Bridge Transaction Tracker</CardTitle>
          <CardDescription>Monitor the status of your cross-chain bridge transactions</CardDescription>
        </div>
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
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeTransactions.length > 0 ? (
              activeTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active bridge transactions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {completedTransactions.length > 0 ? (
              completedTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transaction history found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
