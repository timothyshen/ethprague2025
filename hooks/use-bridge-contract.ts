"use client"

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseEther } from "viem"
import { CONTRACTS, BRIDGE_SENDER_ABI } from "@/lib/contracts"
import { useToast } from "@/hooks/use-toast"
import { useMemo } from "react"

export function useBridgeContract(chainId: number) {
  const { toast } = useToast()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.bridgeSender

  const bridgeToEthereum = async (amount: string, recipient: `0x${string}`) => {
    if (!contractAddress) {
      toast({
        title: "Bridge not supported",
        description: "Bridging is not supported on this network",
        variant: "destructive",
      })
      return
    }

    try {
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: BRIDGE_SENDER_ABI,
        functionName: "bridgeToEthereum",
        args: [recipient],
        value: parseEther(amount),
      })

      toast({
        title: "Bridge transaction submitted",
        description: "Your bridge transaction has been submitted to the network",
      })
    } catch (error) {
      console.error("Bridge error:", error)
      toast({
        title: "Bridge failed",
        description: "There was an error submitting your bridge transaction",
        variant: "destructive",
      })
    }
  }

  const getBridgeStatus = (txHash: `0x${string}`) => {
    const readContractConfig = useMemo(() => {
      if (!contractAddress) return null

      return {
        address: contractAddress as `0x${string}`,
        abi: BRIDGE_SENDER_ABI,
        functionName: "getBridgeStatus",
        args: [txHash],
      }
    }, [contractAddress, txHash])

    return useReadContract(readContractConfig ? readContractConfig : { enabled: false })
  }

  return {
    bridgeToEthereum,
    getBridgeStatus,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  }
}
