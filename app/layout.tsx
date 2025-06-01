import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Web3Provider } from "@/components/providers/web3-provider"
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/components/providers/notification-provider"
import { BalanceProvider } from "@/components/providers/balance-provider"
import { TransactionProvider } from "@/components/providers/transaction-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AnyStake - Cross-Chain Staking Protocol",
  description: "Stake your tokens across multiple chains with ease",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Web3Provider>
            <NotificationProvider>
              <BalanceProvider>
                <TransactionProvider>
                  {children}
                  <Toaster />
                </TransactionProvider>
              </BalanceProvider>
            </NotificationProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
