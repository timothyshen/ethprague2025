import { useWatchContractEvent } from "wagmi";
import { CONTRACTS_NEW } from "@/lib/contracts";
import { AnyStakeAbi } from "@/lib/anyStakeAbi";
import { StakingAggregatorAbi } from "@/lib/stakingAggregatorAbi";
import { useToast } from "@/hooks/use-toast";
import { useNotification } from "@/components/notification-provider";
import { useState, useCallback, useEffect } from "react";

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

  // Watch bridge events on different chains
  const watchAnyStakeChainEvents = useCallback(
    (chainId: number) => {
      const contractAddress =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.anyStake;

      if (contractAddress) {
        useWatchContractEvent({
          address: contractAddress as `0x${string}`,
          abi: AnyStakeAbi,
          eventName: "Deposited",
          onLogs(logs) {
            console.log(logs);
          },
        });

        useWatchContractEvent({
          address: contractAddress as `0x${string}`,
          abi: AnyStakeAbi,
          eventName: "WithdrawalInitiated",
          onLogs(logs) {
            console.log(logs);
          },
        });

        useWatchContractEvent({
          address: contractAddress as `0x${string}`,
          abi: AnyStakeAbi,
          eventName: "WithdrawalConfirmed",
          onLogs(logs) {
            console.log(logs);
          },
        });

        useWatchContractEvent({
          address: contractAddress as `0x${string}`,
          abi: AnyStakeAbi,
          eventName: "Withdrawn",
          onLogs(logs) {
            console.log(logs);
          },
        });

        useWatchContractEvent({
          address: contractAddress as `0x${string}`,
          abi: AnyStakeAbi,
          eventName: "ComposedMessageSent",
          onLogs(logs) {
            console.log(logs);
          },
        });
      }
    },
    [userAddress, memoizedSendNotification, memoizedToast]
  );

  const watchAnyStakeEvents = (chainId: number) => {
    setAnyStakeEventsChainIds((prev) => {
      if (!prev.includes(chainId)) {
        return [...prev, chainId];
      }
      return prev;
    });
  };

  useEffect(() => {
    anyStakeEventsChainIds.forEach((chainId) => {
      watchAnyStakeChainEvents(chainId);
    });
  }, [anyStakeEventsChainIds, watchAnyStakeEvents]);

  return {
    watchAnyStakeEvents,
  };
}
