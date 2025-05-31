import { sepolia, flowTestnet, hederaTestnet } from "viem/chains";
import { parseEther, formatEther } from "viem";
import { UserPosition, AggregatedBalance } from "./use-aggregate-all-balance";
import { useAccount } from "wagmi";
import { useMemo } from "react";

// Mock scenarios for testing
export const MOCK_SCENARIOS = {
  // No balances
  EMPTY: [] as UserPosition[],

  // Single chain with balance
  SINGLE_CHAIN: [
    {
      chainId: sepolia.id,
      chainName: "Sepolia",
      chainSymbol: "🔷",
      balance: "5.25",
      balanceRaw: parseEther("5.25"),
      isLoading: false,
      error: null,
    },
    {
      chainId: flowTestnet.id,
      chainName: "Flow Testnet",
      chainSymbol: "🌊",
      balance: "0",
      balanceRaw: parseEther("0"),
      isLoading: false,
      error: null,
    },
    {
      chainId: hederaTestnet.id,
      chainName: "Hedera Testnet",
      chainSymbol: "♦️",
      balance: "0",
      balanceRaw: parseEther("0"),
      isLoading: false,
      error: null,
    },
  ] as UserPosition[],

  // Multiple chains with balances
  MULTI_CHAIN: [
    {
      chainId: sepolia.id,
      chainName: "Sepolia",
      chainSymbol: "🔷",
      balance: "2.5",
      balanceRaw: parseEther("2.5"),
      isLoading: false,
      error: null,
    },
    {
      chainId: flowTestnet.id,
      chainName: "Flow Testnet",
      chainSymbol: "🌊",
      balance: "1.75",
      balanceRaw: parseEther("1.75"),
      isLoading: false,
      error: null,
    },
    {
      chainId: hederaTestnet.id,
      chainName: "Hedera Testnet",
      chainSymbol: "♦️",
      balance: "0.8",
      balanceRaw: parseEther("0.8"),
      isLoading: false,
      error: null,
    },
  ] as UserPosition[],

  // High balances for UI stress testing
  HIGH_BALANCES: [
    {
      chainId: sepolia.id,
      chainName: "Sepolia",
      chainSymbol: "🔷",
      balance: "125.5",
      balanceRaw: parseEther("125.5"),
      isLoading: false,
      error: null,
    },
    {
      chainId: flowTestnet.id,
      chainName: "Flow Testnet",
      chainSymbol: "🌊",
      balance: "89.25",
      balanceRaw: parseEther("89.25"),
      isLoading: false,
      error: null,
    },
    {
      chainId: hederaTestnet.id,
      chainName: "Hedera Testnet",
      chainSymbol: "♦️",
      balance: "47.8",
      balanceRaw: parseEther("47.8"),
      isLoading: false,
      error: null,
    },
  ] as UserPosition[],

  // Loading states
  LOADING: [
    {
      chainId: sepolia.id,
      chainName: "Sepolia",
      chainSymbol: "🔷",
      balance: "0",
      balanceRaw: parseEther("0"),
      isLoading: true,
      error: null,
    },
    {
      chainId: flowTestnet.id,
      chainName: "Flow Testnet",
      chainSymbol: "🌊",
      balance: "1.75",
      balanceRaw: parseEther("1.75"),
      isLoading: false,
      error: null,
    },
    {
      chainId: hederaTestnet.id,
      chainName: "Hedera Testnet",
      chainSymbol: "♦️",
      balance: "0",
      balanceRaw: parseEther("0"),
      isLoading: true,
      error: null,
    },
  ] as UserPosition[],

  // Error states
  WITH_ERRORS: [
    {
      chainId: sepolia.id,
      chainName: "Sepolia",
      chainSymbol: "🔷",
      balance: "2.5",
      balanceRaw: parseEther("2.5"),
      isLoading: false,
      error: null,
    },
    {
      chainId: flowTestnet.id,
      chainName: "Flow Testnet",
      chainSymbol: "🌊",
      balance: "0",
      balanceRaw: parseEther("0"),
      isLoading: false,
      error: "Network connection failed",
    },
    {
      chainId: hederaTestnet.id,
      chainName: "Hedera Testnet",
      chainSymbol: "♦️",
      balance: "0",
      balanceRaw: parseEther("0"),
      isLoading: false,
      error: "Contract not deployed",
    },
  ] as UserPosition[],
};

// Change this to test different scenarios
const CURRENT_SCENARIO: keyof typeof MOCK_SCENARIOS = "MULTI_CHAIN";

const SUPPORTED_CHAINS = [
  { id: sepolia.id, name: "Sepolia", symbol: "🔷" },
  { id: flowTestnet.id, name: "Flow Testnet", symbol: "🌊" },
  { id: hederaTestnet.id, name: "Hedera Testnet", symbol: "♦️" },
] as const;

/**
 * Mock version of useAggregateAllBalance for testing UI
 * Import this instead of the real hook to test with mock data
 */
export function useAggregateAllBalanceMock(): AggregatedBalance {
  const { address } = useAccount();

  return useMemo(() => {
    if (!address) {
      return {
        totalBalance: "0",
        totalBalanceRaw: parseEther("0"),
        positions: [],
        isLoading: false,
        hasError: false,
        totalChains: 0,
        chainsWithBalance: 0,
      };
    }

    const positions = MOCK_SCENARIOS[CURRENT_SCENARIO];
    const isLoading = positions.some((p) => p.isLoading);
    const hasError = positions.some((p) => p.error !== null);

    const totalBalanceRaw = positions.reduce(
      (sum, position) => sum + position.balanceRaw,
      parseEther("0")
    );

    const chainsWithBalance = positions.filter(
      (p) => p.balanceRaw > parseEther("0")
    ).length;

    return {
      totalBalance: formatEther(totalBalanceRaw),
      totalBalanceRaw,
      positions,
      isLoading,
      hasError,
      totalChains: SUPPORTED_CHAINS.length,
      chainsWithBalance,
    };
  }, [address]);
}

/**
 * Mock version of useChainPosition for testing
 */
export function useChainPositionMock(chainId: number): UserPosition | null {
  const { positions } = useAggregateAllBalanceMock();

  return useMemo(() => {
    return positions.find((position) => position.chainId === chainId) || null;
  }, [positions, chainId]);
}

/**
 * Mock version of useActivePositions for testing
 */
export function useActivePositionsMock(): UserPosition[] {
  const { positions } = useAggregateAllBalanceMock();

  return useMemo(() => {
    return positions.filter(
      (position) => position.balanceRaw > parseEther("0")
    );
  }, [positions]);
}

/**
 * Helper to switch between scenarios programmatically
 */
export function setMockScenario(scenario: keyof typeof MOCK_SCENARIOS) {
  // This would need to be implemented with state management in a real app
  console.log(`Mock scenario: ${scenario}`);
  console.log("To use this scenario, change CURRENT_SCENARIO in the file");
}
