"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACTS_NEW } from "@/lib/contracts";
import { AnyStakeAbi } from "@/lib/anyStakeabi";
import { useToast } from "@/hooks/use-toast";
import { ExecutorOptionType, Options } from "@layerzerolabs/lz-v2-utilities";
import { parseEther } from "viem";

export function useAnyStakeContract() {
  const { toast } = useToast();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const options = Options.newOptions()
    .addExecutorLzReceiveOption(20000000, 0)
    .toHex()
    .toString();

  const lockedBalancesData = (chainId: number, address: `0x${string}`) => {
    return useReadContract({
      address: CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]
        .anyStake as `0x${string}`,
      abi: AnyStakeAbi,
      functionName: "lockedBalances",
      args: [address],
    });
  };

  const pendingWithdrawalData = (chainId: number, guid: `0x${string}`) => {
    return useReadContract({
      address: CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]
        .anyStake as `0x${string}`,
      abi: AnyStakeAbi,
      functionName: "getPendingWithdrawal",
      args: [guid],
    });
  };

  const depositQuoteData = (chainId: number, _amount: bigint) => {
    const dstEid =
      CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW].endpointId;
    const contractAddress =
      CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.anyStake;
    const composedAddress =
      CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.stakeAggregator;
    const quote = useReadContract({
      address: contractAddress as `0x${string}`,
      abi: AnyStakeAbi,
      functionName: "getDepositQuote",
      args: [40161, _amount, composedAddress, options],
    });
    return quote;
  };

  const withdrawQuoteData = (chainId: number, _amount: bigint) => {
    const dstEid =
      CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW].endpointId;
    const contractAddress =
      CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.anyStake;
    const composedAddress =
      CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.stakeAggregator;
    const quote = useReadContract({
      address: contractAddress as `0x${string}`,
      abi: AnyStakeAbi,
      functionName: "getWithdrawQuote",
      args: [40161, _amount, composedAddress, options],
    });
    return quote;
  };

  const typeEnum = {
    DEPOSIT: 1,
    WITHDRAW: 2,
    WITHDRAW_SUCCESS: 3,
    WITHDRAW_FAILED: 4,
  };

  const deposit = (chainId: number, _amount: bigint) => {
    try {
      const dstEid =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW].endpointId;
      const contractAddress =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.anyStake;
      const composedAddress =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.stakeAggregator;

      if (!contractAddress) {
        throw new Error(`Contract address not found for chain ID: ${chainId}`);
      }
      console.log("deposit", _amount, dstEid, composedAddress, options);
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: AnyStakeAbi,
        functionName: "deposit",
        value: _amount + parseEther("2"),
        args: [40161, _amount, composedAddress, options],
      });

      toast({
        title: "Deposit transaction submitted",
        description:
          "Your deposit transaction has been submitted to the network",
      });
    } catch (error) {
      console.error("Staking error:", error);
      toast({
        title: "Deposit failed",
        description: "There was an error submitting your Deposit transaction",
        variant: "destructive",
      });
    }
  };

  const withdraw = (chainId: number, _amount: bigint) => {
    try {
      const dstEid =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW].endpointId;
      const contractAddress =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.anyStake;
      const composedAddress =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.stakeAggregator;

      if (!contractAddress) {
        throw new Error(`Contract address not found for chain ID: ${chainId}`);
      }
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: AnyStakeAbi,
        value: parseEther("2"),
        functionName: "withdraw",
        args: [40161, _amount, composedAddress, options],
      });

      toast({
        title: "Withdraw transaction submitted",
        description:
          "Your withdraw transaction has been submitted to the network",
      });
    } catch (error) {
      console.error("Withdraw error:", error);
      toast({
        title: "Withdraw failed",
        description: "There was an error submitting your Withdraw transaction",
        variant: "destructive",
      });
    }
  };

  return {
    // Read data
    lockedBalancesData,
    pendingWithdrawalData,
    depositQuoteData,
    withdrawQuoteData,

    // Write functions
    deposit,
    withdraw,

    // Transaction state
    hash,
    isPending,
    isConfirming,
  };
}
