"use client";

import { useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useAnyStakeContract } from "./use-anyStake-contract";
import { useStakingAggregatorContract } from "./use-stakingAggregator-contract";
import { useTransactions } from "@/components/providers/transaction-provider";
import { useBalance } from "@/components/providers/balance-provider";
import { useToast } from "./use-toast";

export function useEnhancedStaking() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();

  // Contract hooks
  const anyStakeContract = useAnyStakeContract();
  const stakingAggregatorContract = useStakingAggregatorContract();

  // State management hooks
  const { addTransaction, updateTransactionStatus } = useTransactions();
  const { markBalanceUpdatePending } = useBalance();

  // Enhanced deposit function with state management
  const enhancedDeposit = useCallback(
    async (sourceChainId: number, amount: string) => {
      if (!address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to stake",
          variant: "destructive",
        });
        return;
      }

      try {
        // Convert amount to BigInt
        const amountBigInt = parseEther(amount);

        // Create transaction record
        const transactionId = addTransaction({
          hash: "pending", // Will be updated when transaction is submitted
          type: "deposit",
          chainId: sourceChainId,
          amount: amountBigInt.toString(),
          amountFormatted: amount,
          status: "pending",
          apy: 4.5, // Default APY, can be made dynamic
        });

        // Mark balance as pending
        markBalanceUpdatePending(sourceChainId);

        // Submit transaction to blockchain
        if (sourceChainId === 11155111) {
          // Direct staking on main chain (Sepolia)
          await stakingAggregatorContract.stake(amountBigInt);
        } else {
          // Cross-chain staking via AnyStake
          anyStakeContract.deposit(sourceChainId, amountBigInt);
        }

        // Listen for transaction confirmation
        if (anyStakeContract.hash) {
          // Update transaction with actual hash
          updateTransactionStatus(transactionId, "pending");

          // TODO: Listen for transaction receipt and update status to "confirmed"
          // This would typically be done with a transaction receipt listener
          // For now, we'll simulate it with a timeout
          setTimeout(() => {
            updateTransactionStatus(transactionId, "confirmed");
          }, 5000); // 5 seconds delay to simulate blockchain confirmation
        }

        return transactionId;
      } catch (error) {
        console.error("Enhanced deposit error:", error);
        toast({
          title: "Deposit failed",
          description: "There was an error processing your deposit",
          variant: "destructive",
        });
        throw error;
      }
    },
    [
      address,
      chainId,
      anyStakeContract,
      stakingAggregatorContract,
      addTransaction,
      updateTransactionStatus,
      markBalanceUpdatePending,
      toast,
    ]
  );

  // Enhanced withdraw function with state management
  const enhancedWithdraw = useCallback(
    async (sourceChainId: number, amount: string) => {
      if (!address) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to withdraw",
          variant: "destructive",
        });
        return;
      }

      try {
        // Convert amount to BigInt
        const amountBigInt = parseEther(amount);

        // Create transaction record
        const transactionId = addTransaction({
          hash: "pending", // Will be updated when transaction is submitted
          type: "withdraw",
          chainId: sourceChainId,
          amount: amountBigInt.toString(),
          amountFormatted: amount,
          status: "pending",
        });

        // Mark balance as pending
        markBalanceUpdatePending(sourceChainId);

        // Submit transaction to blockchain
        if (sourceChainId === 11155111) {
          // Direct withdrawal from main chain (Sepolia)
          await stakingAggregatorContract.withdraw(amountBigInt);
        } else {
          // Cross-chain withdrawal via AnyStake
          anyStakeContract.withdraw(sourceChainId, amountBigInt);
        }

        // Listen for transaction confirmation
        if (anyStakeContract.hash) {
          // Update transaction with actual hash
          updateTransactionStatus(transactionId, "pending");

          // TODO: Listen for transaction receipt and update status to "confirmed"
          // This would typically be done with a transaction receipt listener
          // For now, we'll simulate it with a timeout
          setTimeout(() => {
            updateTransactionStatus(transactionId, "confirmed");
          }, 5000); // 5 seconds delay to simulate blockchain confirmation
        }

        return transactionId;
      } catch (error) {
        console.error("Enhanced withdraw error:", error);
        toast({
          title: "Withdrawal failed",
          description: "There was an error processing your withdrawal",
          variant: "destructive",
        });
        throw error;
      }
    },
    [
      address,
      chainId,
      anyStakeContract,
      stakingAggregatorContract,
      addTransaction,
      updateTransactionStatus,
      markBalanceUpdatePending,
      toast,
    ]
  );

  // Get deposit quote with enhanced error handling
  const getDepositQuote = useCallback(
    async (sourceChainId: number, amount: string) => {
      try {
        const amountBigInt = parseEther(amount);
        const quote = await anyStakeContract.depositQuoteData(
          sourceChainId,
          amountBigInt
        );
        return quote;
      } catch (error) {
        console.error("Error getting deposit quote:", error);
        toast({
          title: "Quote error",
          description: "Unable to get transaction quote",
          variant: "destructive",
        });
        return null;
      }
    },
    [anyStakeContract, toast]
  );

  // Get withdraw quote with enhanced error handling
  const getWithdrawQuote = useCallback(
    async (sourceChainId: number, amount: string) => {
      try {
        const amountBigInt = parseEther(amount);
        const quote = await anyStakeContract.withdrawQuoteData(
          sourceChainId,
          amountBigInt
        );
        return quote;
      } catch (error) {
        console.error("Error getting withdraw quote:", error);
        toast({
          title: "Quote error",
          description: "Unable to get transaction quote",
          variant: "destructive",
        });
        return null;
      }
    },
    [anyStakeContract, toast]
  );

  return {
    // Enhanced functions with state management
    enhancedDeposit,
    enhancedWithdraw,
    getDepositQuote,
    getWithdrawQuote,

    // Original contract states for compatibility
    isStaking: anyStakeContract.isPending || anyStakeContract.isConfirming,
    isConfirming: anyStakeContract.isConfirming,
    isConfirmed: anyStakeContract.isConfirmed,
    transactionHash: anyStakeContract.hash,

    // Contract instances for direct access if needed
    anyStakeContract,
    stakingAggregatorContract,
  };
}
