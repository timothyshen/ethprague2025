"use client";

import { useWatchContractEvent } from "wagmi";
import { CONTRACTS_NEW } from "@/lib/contracts";
import { AnyStakeAbi } from "@/lib/anyStakeabi";
import { StakingAggregatorAbi } from "@/lib/stakingAggregatorAbi";
import { useToast } from "@/hooks/use-toast";
import { useNotification } from "@/components/notification-provider";
import { useState, useCallback } from "react";

export function useContractEvents(userAddress?: `0x${string}`) {
  const { toast } = useToast();
  const { sendNotification } = useNotification();
  const [anyStakeEventsChainIds, setAnyStakeEventsChainIds] = useState<
    number[]
  >([]);

  const memoizedSendNotification = useCallback(sendNotification, [
    sendNotification,
  ]);
  const memoizedToast = useCallback(toast, [toast]);

  // Watch staking events on the aggregator
  useWatchContractEvent({
    address: CONTRACTS_NEW[11_155_111].stakingAggregator as `0x${string}`,
    abi: StakingAggregatorAbi,
    eventName: "Deposited",
    onLogs(logs) {
      console.log(logs);
    },
  });

  useWatchContractEvent({
    address: CONTRACTS_NEW[11_155_111].stakingAggregator as `0x${string}`,
    abi: StakingAggregatorAbi,
    eventName: "Withdrawn",
    onLogs(logs) {
      console.log(logs);
    },
  });

  useWatchContractEvent({
    address: CONTRACTS_NEW[11_155_111].stakingAggregator as `0x${string}`,
    abi: StakingAggregatorAbi,
    eventName: "ComposedMessageReceived",
    onLogs(logs) {
      console.log(logs);
    },
  });

  useWatchContractEvent({
    address: CONTRACTS_NEW[11_155_111].stakingAggregator as `0x${string}`,
    abi: StakingAggregatorAbi,
    eventName: "ConfirmationSent",
    onLogs(logs) {
      console.log(logs);
    },
  });

  // For Ethereum Sepolia
  const sepoliaEnabled = anyStakeEventsChainIds.includes(11_155_111);
  const sepoliaAddress = CONTRACTS_NEW[11_155_111]?.anyStake as `0x${string}`;

  useWatchContractEvent({
    address: sepoliaAddress,
    abi: AnyStakeAbi,
    eventName: "Deposited",
    onLogs(logs) {
      console.log(logs);
    },
    enabled: sepoliaEnabled,
  });

  useWatchContractEvent({
    address: sepoliaAddress,
    abi: AnyStakeAbi,
    eventName: "WithdrawalInitiated",
    onLogs(logs) {
      console.log(logs);
    },
    enabled: sepoliaEnabled,
  });

  useWatchContractEvent({
    address: sepoliaAddress,
    abi: AnyStakeAbi,
    eventName: "WithdrawalConfirmed",
    onLogs(logs) {
      console.log(logs);
    },
    enabled: sepoliaEnabled,
  });

  useWatchContractEvent({
    address: sepoliaAddress,
    abi: AnyStakeAbi,
    eventName: "Withdrawn",
    onLogs(logs) {
      console.log(logs);
    },
    enabled: sepoliaEnabled,
  });

  useWatchContractEvent({
    address: sepoliaAddress,
    abi: AnyStakeAbi,
    eventName: "ComposedMessageSent",
    onLogs(logs) {
      console.log(logs);
    },
    enabled: sepoliaEnabled,
  });

  // Add additional chains here with similar pattern
  // For example, Base Sepolia
  const baseEnabled = anyStakeEventsChainIds.includes(84532);
  const baseAddress = CONTRACTS_NEW[84532]?.anyStake as `0x${string}`;

  useWatchContractEvent({
    address: baseAddress,
    abi: AnyStakeAbi,
    eventName: "Deposited",
    onLogs(logs) {
      console.log(logs);
    },
    enabled: baseEnabled,
  });

  // Add other event watchers for Base chain...

  const watchAnyStakeEvents = useCallback((chainId: number) => {
    setAnyStakeEventsChainIds((prev) => {
      if (!prev.includes(chainId)) {
        return [...prev, chainId];
      }
      return prev;
    });
  }, []);

  return {
    watchAnyStakeEvents,
  };
}
