"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for charts
const stakingHistoryData = [
  { date: "Jan 1", value: 1000 },
  { date: "Jan 8", value: 1500 },
  { date: "Jan 15", value: 2200 },
  { date: "Jan 22", value: 3000 },
  { date: "Jan 29", value: 3500 },
  { date: "Feb 5", value: 4200 },
  { date: "Feb 12", value: 4800 },
  { date: "Feb 19", value: 5700 },
]

const rewardsHistoryData = [
  { date: "Jan 1", value: 0 },
  { date: "Jan 8", value: 12 },
  { date: "Jan 15", value: 25 },
  { date: "Jan 22", value: 38 },
  { date: "Jan 29", value: 52 },
  { date: "Feb 5", value: 68 },
  { date: "Feb 12", value: 85 },
  { date: "Feb 19", value: 105 },
]

const sourceChainDistributionData = [
  { name: "Ethereum", value: 2550, color: "#627EEA" },
  { name: "Flow", value: 850, color: "#00EF8B" },
  { name: "Hedera", value: 850, color: "#222222" },
]

const bridgeFeeComparisonData = [
  { name: "Ethereum", fee: 0.001 },
  { name: "Flow", fee: 0.002 },
  { name: "Hedera", fee: 0.0015 },
]

export function StakingAnalytics() {
  const [timeframe, setTimeframe] = useState("1m")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Staking Analytics</h2>
        <Select defaultValue={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1w">1 Week</SelectItem>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Value Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Total Staking Value</CardTitle>
            <CardDescription>Your staking value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Value (USD)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stakingHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Rewards Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards Earned</CardTitle>
            <CardDescription>Your accumulated rewards over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Rewards (USD)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rewardsHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    fillOpacity={1}
                    fill="url(#colorRewards)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Source Chain Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Source Chain Distribution</CardTitle>
            <CardDescription>Your staking allocation by source chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceChainDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourceChainDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bridge Fee Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Bridge Fee Comparison</CardTitle>
            <CardDescription>Compare bridge fees across different source chains</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                fee: {
                  label: "Fee (ETH)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bridgeFeeComparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value} ETH`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="fee" fill="var(--color-fee)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
