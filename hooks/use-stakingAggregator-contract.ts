"use client";

import { useReadContract, useWaitForTransactionReceipt } from "wagmi";

import { CONTRACTS_NEW } from "@/lib/contracts";
import { StakingAggregatorAbi } from "@/lib/stakingAggregatorAbi";

const typeEnum = {
  DEPOSIT: 1,
  WITHDRAW: 2,
};

export function useStakingAggregatorContract() {
  const totalStakedData = useReadContract({
    address: CONTRACTS_NEW[11_155_111].stakingAggregator as `0x${string}`,
    abi: StakingAggregatorAbi,
    functionName: "getTotalStakedAmount",
  });

  const stakedAmountData = (address: `0x${string}`) =>
    useReadContract({
      address: CONTRACTS_NEW[11_155_111].stakingAggregator as `0x${string}`,
      abi: StakingAggregatorAbi,
      functionName: "stakedAmount",
      args: [address],
    });

  return {
    totalStakedData,
    stakedAmountData,
  };
}
