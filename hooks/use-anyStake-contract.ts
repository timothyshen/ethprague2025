"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACTS_NEW } from "@/lib/contracts";
import { AnyStakeAbi } from "@/lib/anyStakeAbi";
import { useToast } from "@/hooks/use-toast";

export function useAnyStakeContract() {
  const { toast } = useToast();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const lockedBalancesData = (chainId: number, address: `0x${string}`) => {
    return useReadContract({
      address: CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]
        .anyStake as `0x${string}`,
      abi: AnyStakeAbi,
      functionName: "lockedBalances",
      args: [address],
    });
  };

  const pendingWithdrawalData = (chainId: number, guid: "bytes32") =>
    useReadContract({
      address: CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]
        .anyStake as `0x${string}`,
      abi: AnyStakeAbi,
      functionName: "getPendingWithdrawal",
      args: [guid],
    });

  const depositQuoteData = (
    chainId: number,
    _dstEid: number,
    _amount: bigint,
    _composedAddress: `0x${string}`,
    _options: `0x${string}`
  ) =>
    useReadContract({
      address: CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]
        .anyStake as `0x${string}`,
      abi: AnyStakeAbi,
      functionName: "getDepositQuote",
      args: [_dstEid, _amount, _composedAddress],
    });

  const withdrawQuoteData = (
    chainId: number,
    _dstEid: number,
    _amount: bigint,
    _composedAddress: `0x${string}`,
    _options: `0x${string}`
  ) =>
    useReadContract({
      address: CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]
        .anyStake as `0x${string}`,
      abi: AnyStakeAbi,
      functionName: "getWithdrawQuote",
      args: [_dstEid, _amount, _composedAddress],
    });

  const typeEnum = {
    DEPOSIT: 1,
    WITHDRAW: 2,
    WITHDRAW_SUCCESS: 3,
    WITHDRAW_FAILED: 4,
  };

  const deposit = (
    chainId: number,
    _dstEid: number,
    _amount: bigint,
    _composedAddress: `0x${string}`,
    _options: `0x${string}`
  ) => {
    try {
      const contractAddress =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.anyStake;

      if (!contractAddress) {
        throw new Error(`Contract address not found for chain ID: ${chainId}`);
      }
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: AnyStakeAbi,
        functionName: "deposit",
        args: [_dstEid, _amount, _composedAddress, _options],
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

  const withdraw = (
    chainId: number,
    _dstEid: number,
    _amount: bigint,
    _composedAddress: `0x${string}`,
    _options: `0x${string}`
  ) => {
    try {
      const contractAddress =
        CONTRACTS_NEW[chainId as keyof typeof CONTRACTS_NEW]?.anyStake;

      if (!contractAddress) {
        throw new Error(`Contract address not found for chain ID: ${chainId}`);
      }
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: AnyStakeAbi,
        functionName: "withdraw",
        args: [_dstEid, _amount, _composedAddress, _options],
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
