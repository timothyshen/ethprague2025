"use client"

import { Navbar } from "@/components/layout/navbar"
import { RewardsCalculator } from "@/components/DataAnalytics/rewards-calculator"

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Staking Rewards Calculator</h1>
          <p className="text-muted-foreground">
            Plan your staking strategy and estimate future rewards with our comprehensive calculator
          </p>
        </div>

        <RewardsCalculator />
      </main>
    </div>
  )
}
