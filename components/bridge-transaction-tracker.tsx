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
import { useNotification } from "@/components/notification-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Define the transaction status types
type TransactionStatus = "pending" | "processing" | "staking" | "completed" | "failed" | "unstaking"

// Define the transaction interface
interface StakingTransaction {
  id: string
  network: {
    name: string
    logo: string
  }
  amount: string
  token: string
  apr: string
  timestamp: string
  status: TransactionStatus
  hash: string
  estimatedCompletionTime?: string
  currentStep?: number
  totalSteps?: number
  error?: string
  lastUpdated?: number // Timestamp for last status update
  stakeDuration?: string
  rewards?: string
  unlockDate?: string
}

// Mock data for staking transactions
const initialTransactions: StakingTransaction[] = [
  {
    id: "tx1",
    network: { name: "Ethereum", logo: "🔷" },
    amount: "10",
    token: "ETH",
    apr: "4.5%",
    timestamp: "2024-01-20 14:30",
    status: "staking",
    hash: "0x1234...5678",
    estimatedCompletionTime: "~5 minutes remaining",
    currentStep: 2,
    totalSteps: 3,
    lastUpdated: Date.now(),
    stakeDuration: "30 days",
    rewards: "0.012 ETH earned",
  },
  {
    id: "tx2",
    network: { name: "Polygon", logo: "🟣" },
    amount: "500",
    token: "MATIC",
    apr: "8.2%",
    timestamp: "2024-01-20 13:15",
    status: "pending",
    hash: "0x2345...6789",
    estimatedCompletionTime: "Waiting for confirmation",
    lastUpdated: Date.now(),
    stakeDuration: "90 days",
  },
  {
    id: "tx3",
    network: { name: "Ethereum", logo: "🔷" },
    amount: "5",
    token: "ETH",
    apr: "4.2%",
    timestamp: "2024-01-20 10:45",
    status: "completed",
    hash: "0x3456...7890",
    lastUpdated: Date.now() - 3600000, // 1 hour ago
    stakeDuration: "60 days",
    rewards: "0.035 ETH earned",
    unlockDate: "2024-03-20",
  },
  {
    id: "tx4",
    network: { name: "Solana", logo: "◎" },
    amount: "25",
    token: "SOL",
    apr: "6.8%",
    timestamp: "2024-01-19 16:20",
    status: "failed",
    hash: "0x4567...8901",
    error: "Insufficient balance for staking",
    lastUpdated: Date.now() - 7200000, // 2 hours ago
  },
  {
    id: "tx5",
    network: { name: "Ethereum", logo: "🔷" },
    amount: "15",
    token: "ETH",
    apr: "4.7%",
    timestamp: "2024-01-18 09:30",
    status: "unstaking",
    hash: "0x5678...9012",
    estimatedCompletionTime: "~10 minutes remaining",
    currentStep: 1,
    totalSteps: 2,
    lastUpdated: Date.now() - 1800000, // 30 minutes ago
    stakeDuration: "30 days",
    rewards: "0.058 ETH earned",
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
    case "staking":
      return {
        variant: "default" as const,
        icon: <Lock className="h-3 w-3 mr-1" />,
        text: "Staking"
      }
    case "unstaking":
      return {
        variant: "secondary" as const,
        icon: <Timer className="h-3 w-3 mr-1" />,
        text: "Unstaking"
      }
    case "completed":
      return { variant: "default" as const, icon: <CheckCircle2 className="h-3 w-3 mr-1" />, text: "Completed" }
    case "failed":
      return { variant: "destructive" as const, icon: <AlertCircle className="h-3 w-3 mr-1" />, text: "Failed" }
  }
}

// Component to display the steps of a staking transaction
function StakingTransactionSteps({ transaction }: { transaction: StakingTransaction }) {
  let steps = [
    { name: "Transaction Initiated", description: "Your staking transaction has been submitted" },
    { name: "Blockchain Confirmation", description: "Transaction confirmed on the blockchain" },
    { name: "Staking Active", description: "Your assets are now staking and earning rewards" },
  ]

  if (transaction.status === "unstaking") {
    steps = [
      { name: "Unstaking Initiated", description: "Your unstaking request has been submitted" },
      { name: "Assets Released", description: "Your assets have been released from staking" },
    ]
  }

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
function TransactionCard({ transaction }: { transaction: StakingTransaction }) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const statusBadge = getStatusBadge(transaction.status)

  const handleRetry = () => {
    toast({
      title: "Retrying transaction",
      description: `Retrying staking transaction for ${transaction.amount} ${transaction.token}`,
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
              <span className="text-lg">{transaction.network.logo}</span>
              <span className="ml-2">{transaction.network.name}</span>
            </div>
            <div>
              <div className="font-medium">
                {transaction.amount} {transaction.token}
              </div>
              <div className="text-xs text-muted-foreground">
                APR: {transaction.apr}
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
              <div>
                <p className="text-muted-foreground">Stake Duration</p>
                <p>{transaction.stakeDuration || "N/A"}</p>
              </div>
              {transaction.rewards && (
                <div>
                  <p className="text-muted-foreground">Rewards</p>
                  <p>{transaction.rewards}</p>
                </div>
              )}
              {transaction.unlockDate && (
                <div>
                  <p className="text-muted-foreground">Unlock Date</p>
                  <p>{transaction.unlockDate}</p>
                </div>
              )}
            </div>

            {(transaction.status === "processing" || transaction.status === "staking" || transaction.status === "unstaking") &&
              transaction.currentStep !== undefined &&
              transaction.totalSteps !== undefined && (
                <StakingTransactionSteps transaction={transaction} />
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

export function StakingTransactionTracker() {
  const [transactions, setTransactions] = useState<StakingTransaction[]>(initialTransactions)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false)
  const { toast } = useToast()
  const { permission, isSupported, sendNotification, setShowPermissionDialog } = useNotification()

  const activeTransactions = transactions.filter(
    (tx) => tx.status === "pending" || tx.status === "processing" || tx.status === "staking" || tx.status === "unstaking"
  )
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
          .map((tx, index) =>
            (tx.status === "pending" || tx.status === "processing" ||
              tx.status === "staking" || tx.status === "unstaking") ? index : -1
          )
          .filter((index) => index !== -1)

        if (activeIndices.length === 0) return currentTransactions

        const randomIndex = activeIndices[Math.floor(Math.random() * activeIndices.length)]
        const transaction = { ...updatedTransactions[randomIndex] }

        // Update the transaction status
        if (transaction.status === "pending") {
          transaction.status = "processing"
          transaction.currentStep = 1
          transaction.totalSteps = 3
          transaction.estimatedCompletionTime = "~5 minutes remaining"

          // Send notification if enabled
          if (notificationsEnabled && permission === "granted") {
            sendNotification("Staking Transaction Processing", {
              body: `Your ${transaction.amount} ${transaction.token} staking transaction is now processing`,
              icon: "/favicon.ico",
            })
          }

          toast({
            title: "Staking Transaction Processing",
            description: `Your ${transaction.amount} ${transaction.token} staking transaction is now processing`,
          })
        } else if (transaction.status === "processing") {
          if (transaction.currentStep && transaction.currentStep < 3) {
            transaction.currentStep += 1

            if (transaction.currentStep === 3) {
              transaction.status = "staking"

              // Send notification if enabled
              if (notificationsEnabled && permission === "granted") {
                sendNotification("Staking Active", {
                  body: `Your ${transaction.amount} ${transaction.token} is now staking and earning rewards`,
                  icon: "/favicon.ico",
                })
              }

              toast({
                title: "Staking Active",
                description: `Your ${transaction.amount} ${transaction.token} is now staking and earning rewards`,
              })
            } else {
              // Send notification for step progress if enabled
              if (notificationsEnabled && permission === "granted") {
                sendNotification("Staking Update", {
                  body: `Your staking transaction is at step ${transaction.currentStep} of ${transaction.totalSteps}`,
                  icon: "/favicon.ico",
                })
              }
            }
          }
        } else if (transaction.status === "unstaking") {
          if (transaction.currentStep && transaction.currentStep < 2) {
            transaction.currentStep += 1

            if (transaction.currentStep === 2) {
              transaction.status = "completed"

              // Send notification if enabled
              if (notificationsEnabled && permission === "granted") {
                sendNotification("Unstaking Completed", {
                  body: `Your ${transaction.amount} ${transaction.token} has been successfully unstaked`,
                  icon: "/favicon.ico",
                })
              }

              toast({
                title: "Unstaking Completed",
                description: `Your ${transaction.amount} ${transaction.token} has been successfully unstaked`,
              })
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Staking Transaction Tracker</CardTitle>
          <CardDescription>Monitor the status of your staking transactions and rewards</CardDescription>
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
              Active Stakes
              {activeTransactions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Staking History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeTransactions.length > 0 ? (
              activeTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active staking transactions</p>
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
                <p>No staking history found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
