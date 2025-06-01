"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type NotificationPermission = "default" | "granted" | "denied"

// Define notification types for different staking events
export type StakingEventType =
  | "stake-initiated"
  | "stake-confirmed"
  | "stake-completed"
  | "unstake-initiated"
  | "unstake-confirmed"
  | "unstake-completed"
  | "rewards-available"

// Define interface for chain information in notifications
export interface ChainInfo {
  id: number
  name: string
  logo: string
}

// Extended notification options to include chain information
interface StakingNotificationOptions extends NotificationOptions {
  sourceChain?: ChainInfo
  destinationChain?: ChainInfo
  amount?: string
  token?: string
  eventType?: StakingEventType
}

interface NotificationContextType {
  permission: NotificationPermission
  isSupported: boolean
  requestPermission: () => Promise<void>
  sendNotification: (title: string, options?: StakingNotificationOptions) => void
  sendStakingNotification: (
    eventType: StakingEventType,
    amount: string,
    token: string,
    sourceChain: ChainInfo,
    destinationChain: ChainInfo
  ) => void
  showPermissionDialog: boolean
  setShowPermissionDialog: (show: boolean) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if notifications are supported
    const supported = "Notification" in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        toast({
          title: "Notifications enabled",
          description: "You'll receive notifications when your staking transactions change status",
        })
        // Send a test notification
        new Notification("Staking Notifications Enabled", {
          body: "You'll receive updates when your staking transactions change status",
          icon: "/favicon.ico",
        })
      } else if (result === "denied") {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings to receive updates",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      toast({
        title: "Error enabling notifications",
        description: "There was a problem enabling notifications",
        variant: "destructive",
      })
    }

    setShowPermissionDialog(false)
  }

  const sendNotification = (title: string, options?: StakingNotificationOptions) => {
    if (isSupported && permission === "granted") {
      try {
        // Format the body text based on chain information if provided
        let body = options?.body || "";

        if (options?.sourceChain && options?.destinationChain && options?.amount && options?.token) {
          body = `${options.amount} ${options.token} from ${options.sourceChain.name} to ${options.destinationChain.name}. ${body}`;
        }

        const notification = new Notification(title, {
          icon: "/favicon.ico",
          ...options,
          body
        })

        // Handle notification click
        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        return notification
      } catch (error) {
        console.error("Error sending notification:", error)
      }
    }
  }

  // Helper function to create consistent staking notifications
  const sendStakingNotification = (
    eventType: StakingEventType,
    amount: string,
    token: string,
    sourceChain: ChainInfo,
    destinationChain: ChainInfo
  ) => {
    let title = "";
    let body = "";

    switch (eventType) {
      case "stake-initiated":
        title = "Staking Initiated";
        body = "Your staking transaction has been initiated and is being processed.";
        break;
      case "stake-confirmed":
        title = "Staking Confirmed";
        body = "Your staking transaction has been confirmed on the source chain.";
        break;
      case "stake-completed":
        title = "Staking Completed";
        body = "Your tokens have been successfully staked.";
        break;
      case "unstake-initiated":
        title = "Unstaking Initiated";
        body = "Your unstaking transaction has been initiated.";
        break;
      case "unstake-confirmed":
        title = "Unstaking Confirmed";
        body = "Your unstaking transaction has been confirmed.";
        break;
      case "unstake-completed":
        title = "Unstaking Completed";
        body = "Your tokens have been successfully unstaked.";
        break;
      case "rewards-available":
        title = "Rewards Available";
        body = "You have staking rewards available to claim.";
        break;
    }

    sendNotification(title, {
      body,
      sourceChain,
      destinationChain,
      amount,
      token,
      eventType
    });
  };

  const value = {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    sendStakingNotification,
    showPermissionDialog,
    setShowPermissionDialog,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationPermissionDialog />
    </NotificationContext.Provider>
  )
}

function NotificationPermissionDialog() {
  const notification = useNotification()

  if (!notification.showPermissionDialog) {
    return null
  }

  return (
    <Dialog open={notification.showPermissionDialog} onOpenChange={notification.setShowPermissionDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Staking Notifications</DialogTitle>
          <DialogDescription>
            Get real-time updates when your staking transactions change status. We'll notify you when:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Your staking is initiated or completed</li>
              <li>Cross-chain staking status changes</li>
              <li>Unstaking is processed</li>
              <li>Rewards are available to claim</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <Bell className="h-16 w-16 text-primary" />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={() => notification.setShowPermissionDialog(false)}>
            Not Now
          </Button>
          <Button onClick={notification.requestPermission}>Enable Notifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

export function NotificationToggle() {
  const { permission, isSupported, requestPermission, setShowPermissionDialog } = useNotification()

  if (!isSupported) {
    return null
  }

  if (permission === "granted") {
    return (
      <Button variant="ghost" size="icon" title="Staking notifications enabled">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => setShowPermissionDialog(true)} title="Enable staking notifications">
      <BellOff className="h-5 w-5" />
    </Button>
  )
}
