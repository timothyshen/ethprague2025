"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { formatEther } from "viem";
import { useStakingAggregatorContract } from "@/hooks/use-stakingAggregator-contract";
import { useAnyStakeContract } from "@/hooks/use-anyStake-contract";
import { sepolia, flowTestnet, hederaTestnet } from "viem/chains";

// Define position interface
export interface StakingPosition {
  chainId: number;
  chainName: string;
  amount: string;
  amountFormatted: string;
  apy: number;
}

export function useAggregateAllBalance() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState("0");
  const [positions, setPositions] = useState<StakingPosition[]>([]);

  // Get staking data from main chain (StakingAggregator)
  const { stakedAmountData } = useStakingAggregatorContract();

  // Get AnyStake data
  const { lockedBalancesData } = useAnyStakeContract();

  // Supported chains
  const supportedChains = [
    { id: sepolia.id, name: "Sepolia", symbol: "🔷" },
    { id: flowTestnet.id, name: "Flow Testnet", symbol: "🌊" },
    { id: hederaTestnet.id, name: "Hedera Testnet", symbol: "♦️" },
    // Add other chains as needed
  ];

  useEffect(() => {
    const fetchAllBalances = async () => {
      if (!address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Process fetched balances
        const positionsData: StakingPosition[] = [];
        let totalBalanceBigInt = BigInt(0);

        // Fetch and add main chain position
        try {
          const mainChainAmount = await stakedAmountData(
            address as `0x${string}`
          );
          if (mainChainAmount) {
            const amountBigInt = BigInt(mainChainAmount.toString() || "0");
            totalBalanceBigInt += amountBigInt;

            positionsData.push({
              chainId: sepolia.id,
              chainName: "Ethereum Sepolia (Main)",
              amount: amountBigInt.toString(),
              amountFormatted: formatEther(amountBigInt),
              apy: 10, // Hardcoded APY for now
            });
          }
        } catch (error) {
          console.error("Error fetching main chain data:", error);
        }

        // Fetch balances from other chains sequentially
        for (const chain of supportedChains) {
          // Skip main chain as we already processed it
          if (chain.id === sepolia.id) continue;

          try {
            const chainAmount = await lockedBalancesData(
              chain.id,
              address as `0x${string}`
            );
            if (chainAmount) {
              const amountBigInt = BigInt(chainAmount.toString() || "0");
              totalBalanceBigInt += amountBigInt;

              positionsData.push({
                chainId: chain.id,
                chainName: chain.name,
                amount: amountBigInt.toString(),
                amountFormatted: formatEther(amountBigInt),
                apy: 10, // Hardcoded APY for now
              });
            }
          } catch (error) {
            console.error(
              `Error fetching data for chain ${chain.name}:`,
              error
            );
          }
        }

        // Update state
        setTotalBalance(formatEther(totalBalanceBigInt));
        setPositions(positionsData);
      } catch (error) {
        console.error("Error fetching aggregate balance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBalances();
  }, [address, chainId]);

  return {
    totalBalance,
    positions,
    totalChains: positions.length,
    isLoading,
  };
}
