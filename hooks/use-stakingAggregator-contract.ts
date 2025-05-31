"use client";

import { useReadContract } from "wagmi";
import { sepolia } from "viem/chains";

import { http, createPublicClient } from "viem";

export const contractClient = createPublicClient({
  chain: sepolia,
  transport: http(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  ),
});

import { CONTRACTS_NEW } from "@/lib/contracts";
import { StakingAggregatorAbi } from "@/lib/stakingAggregatorAbi";

const typeEnum = {
  DEPOSIT: 1,
  WITHDRAW: 2,
};

export function useStakingAggregatorContract() {
  const totalStakedData = async () => {
    const totalStaked = await contractClient.readContract({
      address: "0xE53820Cf65947EEF446c628C3600EFfb460Ddc0F" as `0x${string}`,
      abi: StakingAggregatorAbi,
      functionName: "getTotalStakedAmount",
    });
    console.log("totalStaked", totalStaked);
    return totalStaked;
  };

  const stakedAmountData = async (address: `0x${string}`) => {
    const stakedAmount = await contractClient.readContract({
      address: "0xE53820Cf65947EEF446c628C3600EFfb460Ddc0F" as `0x${string}`,
      abi: StakingAggregatorAbi,
      functionName: "stakedAmount",
      args: [address],
    });
    return stakedAmount;
  };

  return {
    totalStakedData,
    stakedAmountData,
  };
}
