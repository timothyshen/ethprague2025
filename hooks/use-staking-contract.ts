"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, formatEther } from "viem"
import { CONTRACTS, STAKING_POOL_ABI } from "@/lib/contracts"
import { useToast } from "@/hooks/use-toast"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"

export function useStakingContract() {
  const { toast } = useToast()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const { address } = useAccount()
  const [stakedAmount, setStakedAmount] = useState<string | null>(null)
  const [pendingRewards, setPendingRewards] = useState<string | null>(null)

  // Read contract functions
  const { data: totalStaked } = useReadContract({
    address: CONTRACTS[1].stakingPool as `0x${string}`,
    abi: STAKING_POOL_ABI,
    functionName: "totalStaked",
  })

  const { data: apy } = useReadContract({
    address: CONTRACTS[1].stakingPool as `0x${string}`,
    abi: STAKING_POOL_ABI,
    functionName: "apy",
  })

  const stakedAmountData = useReadContract({
    address: CONTRACTS[1].stakingPool as `0x${string}`,
    abi: STAKING_POOL_ABI,
    functionName: "getStakedAmount",
    args: [address],
    enabled: !!address,
  })

  const pendingRewardsData = useReadContract({
    address: CONTRACTS[1].stakingPool as `0x${string}`,
    abi: STAKING_POOL_ABI,
    functionName: "getPendingRewards",
    args: [address],
    enabled: !!address,
  })

  useEffect(() => {
    if (stakedAmountData.data) {
      setStakedAmount(formatEther(stakedAmountData.data as bigint))
    }
  }, [stakedAmountData.data])

  useEffect(() => {
    if (pendingRewardsData.data) {
      setPendingRewards(formatEther(pendingRewardsData.data as bigint))
    }
  }, [pendingRewardsData.data])

  // Write contract functions
  const stake = async (amount: string) => {
    try {
      await writeContract({
        address: CONTRACTS[1].stakingPool as `0x${string}`,
        abi: STAKING_POOL_ABI,
        functionName: "stake",
        value: parseEther(amount),
      })

      toast({
        title: "Staking transaction submitted",
        description: "Your staking transaction has been submitted to the network",
      })
    } catch (error) {
      console.error("Staking error:", error)
      toast({
        title: "Staking failed",
        description: "There was an error submitting your staking transaction",
        variant: "destructive",
      })
    }
  }

  const unstake = async (amount: string) => {
    try {
      await writeContract({
        address: CONTRACTS[1].stakingPool as `0x${string}`,
        abi: STAKING_POOL_ABI,
        functionName: "unstake",
        args: [parseEther(amount)],
      })

      toast({
        title: "Unstaking transaction submitted",
        description: "Your unstaking transaction has been submitted to the network",
      })
    } catch (error) {
      console.error("Unstaking error:", error)
      toast({
        title: "Unstaking failed",
        description: "There was an error submitting your unstaking transaction",
        variant: "destructive",
      })
    }
  }

  const claimRewards = async () => {
    try {
      await writeContract({
        address: CONTRACTS[1].stakingPool as `0x${string}`,
        abi: STAKING_POOL_ABI,
        functionName: "claimRewards",
      })

      toast({
        title: "Claim rewards transaction submitted",
        description: "Your claim rewards transaction has been submitted to the network",
      })
    } catch (error) {
      console.error("Claim rewards error:", error)
      toast({
        title: "Claim rewards failed",
        description: "There was an error submitting your claim rewards transaction",
        variant: "destructive",
      })
    }
  }

  return {
    // Read data
    totalStaked: totalStaked ? formatEther(totalStaked) : "0",
    apy: apy ? Number(apy) / 100 : 0, // Assuming APY is stored as basis points
    stakedAmount,
    pendingRewards,

    // Write functions
    stake,
    unstake,
    claimRewards,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  }
}
