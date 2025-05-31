import { sepolia, flowTestnet, hederaTestnet } from "viem/chains";
import { useAnyStakeContract } from "./use-anyStake-contract";
import { useAccount } from "wagmi";
import { useMemo, useState, useEffect } from "react";
import { formatEther } from "viem";

// Supported chains for cross-chain staking
const SUPPORTED_CHAINS = [
  { id: sepolia.id, name: "Sepolia", symbol: "🔷" },
  { id: flowTestnet.id, name: "Flow Testnet", symbol: "🌊" },
  { id: hederaTestnet.id, name: "Hedera Testnet", symbol: "♦️" },
] as const;

export interface UserPosition {
  chainId: number;
  chainName: string;
  chainSymbol: string;
  balance: string; // formatted balance
  balanceRaw: bigint; // raw balance
  isLoading: boolean;
  error: string | null;
}

export interface AggregatedBalance {
  totalBalance: string; // formatted total across all chains
  totalBalanceRaw: bigint; // raw total balance
  positions: UserPosition[];
  isLoading: boolean;
  hasError: boolean;
  totalChains: number;
  chainsWithBalance: number;
}

export function useAggregateAllBalance(): AggregatedBalance {
  const { address } = useAccount();
  const { lockedBalancesData } = useAnyStakeContract();
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize positions for all supported chains
  useEffect(() => {
    const initialPositions: UserPosition[] = SUPPORTED_CHAINS.map((chain) => ({
      chainId: chain.id,
      chainName: chain.name,
      chainSymbol: chain.symbol,
      balance: "0",
      balanceRaw: BigInt(0),
      isLoading: true,
      error: null,
    }));

    setPositions(initialPositions);
    setIsLoading(true);
  }, [address]);

  // Fetch balances for each chain
  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    const fetchBalances = async () => {
      const updatedPositions = SUPPORTED_CHAINS.map((chain) => {
        try {
          const balanceData = lockedBalancesData(chain.id, address);
          const balanceRaw = balanceData.data
            ? (balanceData.data as bigint)
            : BigInt(0);
          const balance = formatEther(balanceRaw);

          return {
            chainId: chain.id,
            chainName: chain.name,
            chainSymbol: chain.symbol,
            balance,
            balanceRaw,
            isLoading: balanceData.isLoading || false,
            error: balanceData.error ? balanceData.error.message : null,
          };
        } catch (error) {
          console.error(`Error fetching balance for ${chain.name}:`, error);

          return {
            chainId: chain.id,
            chainName: chain.name,
            chainSymbol: chain.symbol,
            balance: "0",
            balanceRaw: BigInt(0),
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch balance",
          };
        }
      });

      setPositions(updatedPositions);
      setIsLoading(updatedPositions.some((p) => p.isLoading));
    };

    fetchBalances();
  }, [address, lockedBalancesData]);

  // Compute aggregated data
  const aggregatedData = useMemo(() => {
    if (!positions.length) {
      return {
        totalBalance: "0",
        totalBalanceRaw: BigInt(0),
        positions: [],
        isLoading: true,
        hasError: false,
        totalChains: 0,
        chainsWithBalance: 0,
      };
    }

    const totalBalanceRaw = positions.reduce(
      (sum, position) => sum + position.balanceRaw,
      BigInt(0)
    );

    const totalBalance = formatEther(totalBalanceRaw);
    const hasError = positions.some((position) => position.error !== null);
    const chainsWithBalance = positions.filter(
      (position) => position.balanceRaw > BigInt(0)
    ).length;

    return {
      totalBalance,
      totalBalanceRaw,
      positions,
      isLoading,
      hasError,
      totalChains: SUPPORTED_CHAINS.length,
      chainsWithBalance,
    };
  }, [positions, isLoading]);

  return aggregatedData;
}

// Helper hook for getting positions by specific chain
export function useChainPosition(chainId: number): UserPosition | null {
  const { positions } = useAggregateAllBalance();

  return useMemo(() => {
    return positions.find((position) => position.chainId === chainId) || null;
  }, [positions, chainId]);
}

// Helper hook for getting non-zero positions only
export function useActivePositions(): UserPosition[] {
  const { positions } = useAggregateAllBalance();

  return useMemo(() => {
    return positions.filter((position) => position.balanceRaw > BigInt(0));
  }, [positions]);
}
