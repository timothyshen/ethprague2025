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

interface NotificationContextType {
  permission: NotificationPermission
  isSupported: boolean
  requestPermission: () => Promise<void>
  sendNotification: (title: string, options?: NotificationOptions) => void
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
          description: "You'll receive notifications when bridge transactions change status",
        })
        // Send a test notification
        new Notification("Notifications Enabled", {
          body: "You'll receive updates when your bridge transactions change status",
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

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (isSupported && permission === "granted") {
      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          ...options,
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

  const value = {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
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
          <DialogTitle>Enable Transaction Notifications</DialogTitle>
          <DialogDescription>
            Get real-time updates when your bridge transactions change status. We'll notify you when transactions are
            completed, failed, or require your attention.
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
      <Button variant="ghost" size="icon" title="Notifications enabled">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => setShowPermissionDialog(true)} title="Enable notifications">
      <BellOff className="h-5 w-5" />
    </Button>
  )
}
