"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, DollarSign, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface StakingPool {
  id: string
  name: string
  token: string
  apy: number
  minStake: number
  lockPeriod: number
  compounding: boolean
}

const stakingPools: StakingPool[] = [
  {
    id: "eth",
    name: "ETH Staking Pool",
    token: "ETH",
    apy: 12.5,
    minStake: 0.01,
    lockPeriod: 30,
    compounding: true,
  },
]

export function RewardsCalculator() {
  const [selectedPool, setSelectedPool] = useState<StakingPool>(stakingPools[0])
  const [stakeAmount, setStakeAmount] = useState("100")
  const [stakingPeriod, setStakingPeriod] = useState([365]) // days
  const [customAPY, setCustomAPY] = useState(selectedPool.apy.toString())
  const [useCustomAPY, setUseCustomAPY] = useState(false)
  const [compoundFrequency, setCompoundFrequency] = useState("daily")

  const [results, setResults] = useState({
    totalRewards: 0,
    finalAmount: 0,
    dailyRewards: 0,
    monthlyRewards: 0,
    yearlyRewards: 0,
    chartData: [] as Array<{ day: number; amount: number; rewards: number }>,
  })

  // Calculate rewards whenever inputs change
  useEffect(() => {
    calculateRewards()
  }, [stakeAmount, stakingPeriod, selectedPool, customAPY, useCustomAPY, compoundFrequency])

  const calculateRewards = () => {
    const principal = Number.parseFloat(stakeAmount) || 0
    const days = stakingPeriod[0]
    const apy = useCustomAPY ? Number.parseFloat(customAPY) || 0 : selectedPool.apy
    const isCompounding = selectedPool.compounding

    if (principal <= 0 || days <= 0 || apy <= 0) {
      setResults({
        totalRewards: 0,
        finalAmount: 0,
        dailyRewards: 0,
        monthlyRewards: 0,
        yearlyRewards: 0,
        chartData: [],
      })
      return
    }

    const chartData = []
    let currentAmount = principal
    let totalRewards = 0

    // Calculate compound frequency
    let compoundsPerYear = 365 // daily by default
    switch (compoundFrequency) {
      case "weekly":
        compoundsPerYear = 52
        break
      case "monthly":
        compoundsPerYear = 12
        break
      case "quarterly":
        compoundsPerYear = 4
        break
      case "yearly":
        compoundsPerYear = 1
        break
    }

    const dailyRate = apy / 100 / 365
    const compoundRate = apy / 100 / compoundsPerYear

    for (let day = 0; day <= days; day++) {
      if (isCompounding) {
        // Compound interest calculation
        const periodsElapsed = (day / 365) * compoundsPerYear
        currentAmount = principal * Math.pow(1 + compoundRate, periodsElapsed)
      } else {
        // Simple interest calculation
        currentAmount = principal + principal * dailyRate * day
      }

      const dayRewards = currentAmount - principal

      if (day % Math.max(1, Math.floor(days / 50)) === 0 || day === days) {
        chartData.push({
          day,
          amount: currentAmount,
          rewards: dayRewards,
        })
      }
    }

    totalRewards = currentAmount - principal
    const dailyRewards = totalRewards / days
    const monthlyRewards = dailyRewards * 30
    const yearlyRewards = dailyRewards * 365

    setResults({
      totalRewards,
      finalAmount: currentAmount,
      dailyRewards,
      monthlyRewards,
      yearlyRewards,
      chartData,
    })
  }

  const formatCurrency = (amount: number, token: string) => {
    return `${amount.toFixed(6)} ${token}`
  }

  const formatUSD = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Mock token prices for USD conversion
  const tokenPrices: Record<string, number> = {
    ETH: 1700,
    USDC: 1,
    MATIC: 0.9,
    OP: 1.5,
  }

  const getUSDValue = (amount: number, token: string) => {
    return amount * (tokenPrices[token] || 1)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Rewards Calculator</span>
          </CardTitle>
          <CardDescription>
            Estimate your future staking rewards based on different scenarios and time periods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pool-select">Staking Pool</Label>
                <Select
                  value={selectedPool.id}
                  onValueChange={(value) => {
                    const pool = stakingPools.find((p) => p.id === value)
                    if (pool) {
                      setSelectedPool(pool)
                      setCustomAPY(pool.apy.toString())
                    }
                  }}
                >
                  <SelectTrigger id="pool-select">
                    <SelectValue placeholder="Select a staking pool" />
                  </SelectTrigger>
                  <SelectContent>
                    {stakingPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{pool.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {pool.apy}% APY
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stake-amount">Stake Amount ({selectedPool.token})</Label>
                <Input
                  id="stake-amount"
                  type="number"
                  placeholder="Enter amount to stake"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min={selectedPool.minStake}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum stake: {selectedPool.minStake} {selectedPool.token}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label>Staking Period: {stakingPeriod[0]} days</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Minimum lock period for this pool: {selectedPool.lockPeriod} days</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={stakingPeriod}
                  onValueChange={setStakingPeriod}
                  max={1095} // 3 years
                  min={selectedPool.lockPeriod}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{selectedPool.lockPeriod} days</span>
                  <span>3 years</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="custom-apy"
                    checked={useCustomAPY}
                    onChange={(e) => setUseCustomAPY(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="custom-apy">Use Custom APY</Label>
                </div>
                {useCustomAPY && (
                  <Input
                    type="number"
                    placeholder="Enter custom APY"
                    value={customAPY}
                    onChange={(e) => setCustomAPY(e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                )}
              </div>

              {selectedPool.compounding && (
                <div className="space-y-2">
                  <Label htmlFor="compound-frequency">Compound Frequency</Label>
                  <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                    <SelectTrigger id="compound-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Total Rewards</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(results.totalRewards, selectedPool.token)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatUSD(getUSDValue(results.totalRewards, selectedPool.token))}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Final Amount</span>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(results.finalAmount, selectedPool.token)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatUSD(getUSDValue(results.finalAmount, selectedPool.token))}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Reward Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily:</span>
                    <span>{formatCurrency(results.dailyRewards, selectedPool.token)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly:</span>
                    <span>{formatCurrency(results.monthlyRewards, selectedPool.token)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yearly:</span>
                    <span>{formatCurrency(results.yearlyRewards, selectedPool.token)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Pool Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">APY:</span>
                    <span>{useCustomAPY ? customAPY : selectedPool.apy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compounding:</span>
                    <span>{selectedPool.compounding ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lock Period:</span>
                    <span>{selectedPool.lockPeriod} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Growth Over Time</CardTitle>
          <CardDescription>Visualize how your rewards accumulate over the staking period</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="amount" className="space-y-4">
            <TabsList>
              <TabsTrigger value="amount">Total Amount</TabsTrigger>
              <TabsTrigger value="rewards">Rewards Only</TabsTrigger>
            </TabsList>

            <TabsContent value="amount">
              <ChartContainer
                config={{
                  amount: {
                    label: `Total Amount (${selectedPool.token})`,
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tickFormatter={(value) => `Day ${value}`} />
                    <YAxis tickFormatter={(value) => `${value.toFixed(2)}`} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-2 shadow-lg">
                              <p className="font-medium">Day {label}</p>
                              <p className="text-sm">
                                Total: {formatCurrency(payload[0].value as number, selectedPool.token)}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--color-amount)"
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="rewards">
              <ChartContainer
                config={{
                  rewards: {
                    label: `Rewards (${selectedPool.token})`,
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-rewards)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-rewards)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tickFormatter={(value) => `Day ${value}`} />
                    <YAxis tickFormatter={(value) => `${value.toFixed(2)}`} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-2 shadow-lg">
                              <p className="font-medium">Day {label}</p>
                              <p className="text-sm">
                                Rewards: {formatCurrency(payload[0].value as number, selectedPool.token)}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rewards"
                      stroke="var(--color-rewards)"
                      fillOpacity={1}
                      fill="url(#colorRewards)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Comparison</CardTitle>
          <CardDescription>Compare potential rewards across different staking pools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Pool</th>
                  <th className="text-left p-2">APY</th>
                  <th className="text-left p-2">Lock Period</th>
                  <th className="text-left p-2">Estimated Rewards*</th>
                  <th className="text-left p-2">Final Amount*</th>
                </tr>
              </thead>
              <tbody>
                {stakingPools.map((pool) => {
                  const principal = Number.parseFloat(stakeAmount) || 0
                  const days = stakingPeriod[0]
                  const dailyRate = pool.apy / 100 / 365
                  let finalAmount = principal

                  if (principal > 0 && days > 0) {
                    if (pool.compounding) {
                      finalAmount = principal * Math.pow(1 + pool.apy / 100 / 365, days)
                    } else {
                      finalAmount = principal + principal * dailyRate * days
                    }
                  }

                  const rewards = finalAmount - principal

                  return (
                    <tr key={pool.id} className="border-b">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{pool.name}</p>
                          <p className="text-xs text-muted-foreground">{pool.token}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{pool.apy}%</Badge>
                      </td>
                      <td className="p-2">{pool.lockPeriod} days</td>
                      <td className="p-2 text-green-600">{formatCurrency(rewards, pool.token)}</td>
                      <td className="p-2 font-medium">{formatCurrency(finalAmount, pool.token)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-2">
              * Based on current stake amount ({stakeAmount} tokens) and period ({stakingPeriod[0]} days)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
