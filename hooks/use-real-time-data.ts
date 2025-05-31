"use client"

import { useState, useEffect } from "react"
import { useAccount, useBlockNumber } from "wagmi"
import { useStakingContract } from "./use-staking-contract"

export function useRealTimeData() {
  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  const { totalStaked, apy, stakedAmount, pendingRewards } = useStakingContract()

  // Update data when new blocks are mined
  useEffect(() => {
    if (blockNumber) {
      setLastUpdate(Date.now())
    }
  }, [blockNumber])

  // Calculate estimated values
  const estimatedDailyRewards = stakedAmount ? ((Number.parseFloat(stakedAmount) * (apy / 100)) / 365).toFixed(6) : "0"

  const estimatedMonthlyRewards = stakedAmount ? ((Number.parseFloat(stakedAmount) * (apy / 100)) / 12).toFixed(6) : "0"

  const estimatedYearlyRewards = stakedAmount ? (Number.parseFloat(stakedAmount) * (apy / 100)).toFixed(6) : "0"

  return {
    totalStaked,
    apy,
    stakedAmount,
    pendingRewards,
    estimatedDailyRewards,
    estimatedMonthlyRewards,
    estimatedYearlyRewards,
    lastUpdate,
    isConnected: !!address,
  }
}
