"use client"

import { useWatchContractEvent } from "wagmi"
import { CONTRACTS, STAKING_POOL_ABI, BRIDGE_SENDER_ABI } from "@/lib/contracts"
import { useToast } from "@/hooks/use-toast"
import { useNotification } from "@/components/notification-provider"
import { useEffect } from "react"
import { useState, useCallback } from "react"

export function useContractEvents(userAddress?: `0x${string}`) {
  const { toast } = useToast()
  const { sendNotification } = useNotification()
  const [bridgeEventsChainIds, setBridgeEventsChainIds] = useState<number[]>([])

  const memoizedSendNotification = useCallback(sendNotification, [sendNotification])
  const memoizedToast = useCallback(toast, [toast])

  // Watch staking events
  useWatchContractEvent({
    address: CONTRACTS[1].stakingPool as `0x${string}`,
    abi: STAKING_POOL_ABI,
    eventName: "Staked",
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.user === userAddress) {
          const amount = log.args.amount ? Number(log.args.amount) / 1e18 : 0
          memoizedToast({
            title: "Staking Confirmed",
            description: `Successfully staked ${amount.toFixed(4)} ETH`,
          })
          memoizedSendNotification("Staking Confirmed", {
            body: `Successfully staked ${amount.toFixed(4)} ETH`,
          })
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACTS[1].stakingPool as `0x${string}`,
    abi: STAKING_POOL_ABI,
    eventName: "Unstaked",
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.user === userAddress) {
          const amount = log.args.amount ? Number(log.args.amount) / 1e18 : 0
          memoizedToast({
            title: "Unstaking Confirmed",
            description: `Successfully unstaked ${amount.toFixed(4)} ETH`,
          })
          memoizedSendNotification("Unstaking Confirmed", {
            body: `Successfully unstaked ${amount.toFixed(4)} ETH`,
          })
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACTS[1].stakingPool as `0x${string}`,
    abi: STAKING_POOL_ABI,
    eventName: "RewardsClaimed",
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.user === userAddress) {
          const amount = log.args.amount ? Number(log.args.amount) / 1e18 : 0
          memoizedToast({
            title: "Rewards Claimed",
            description: `Successfully claimed ${amount.toFixed(4)} ETH in rewards`,
          })
          memoizedSendNotification("Rewards Claimed", {
            body: `Successfully claimed ${amount.toFixed(4)} ETH in rewards`,
          })
        }
      })
    },
  })

  // Watch bridge events on different chains
  const watchBridgeEventsForChain = useCallback(
    (chainId: number) => {
      const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.bridgeSender

      if (contractAddress) {
        useWatchContractEvent({
          address: contractAddress as `0x${string}`,
          abi: BRIDGE_SENDER_ABI,
          eventName: "BridgeInitiated",
          onLogs(logs) {
            logs.forEach((log) => {
              if (log.args.sender === userAddress) {
                const amount = log.args.amount ? Number(log.args.amount) / 1e18 : 0
                memoizedToast({
                  title: "Bridge Initiated",
                  description: `Bridge transaction started for ${amount.toFixed(4)} ETH`,
                })
                memoizedSendNotification("Bridge Initiated", {
                  body: `Bridge transaction started for ${amount.toFixed(4)} ETH`,
                })
              }
            })
          },
        })
      }
    },
    [userAddress, memoizedSendNotification, memoizedToast],
  )

  const watchBridgeEvents = (chainId: number) => {
    setBridgeEventsChainIds((prev) => {
      if (!prev.includes(chainId)) {
        return [...prev, chainId]
      }
      return prev
    })
  }

  useEffect(() => {
    bridgeEventsChainIds.forEach((chainId) => {
      watchBridgeEventsForChain(chainId)
    })
  }, [bridgeEventsChainIds, watchBridgeEventsForChain])

  return {
    watchBridgeEvents,
  }
}
