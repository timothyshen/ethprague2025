import { formatEther, parseEther, type Address } from "viem";

// Utility functions for Web3 operations
export function formatTokenAmount(
  amount: bigint | string,
  decimals = 18
): string {
  if (typeof amount === "string") {
    return amount;
  }
  return formatEther(amount);
}

export function parseTokenAmount(amount: string, decimals = 18): bigint {
  return parseEther(amount);
}

export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateAPY(
  principal: number,
  rate: number,
  time: number
): number {
  return principal * Math.pow(1 + rate / 100, time) - principal;
}

export function getTransactionUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    11155111: "https://sepolia.etherscan.io/tx/",
    84532: "https://sepolia.basescan.org/tx/",
    296: "https://hashscan.io/testnet/transaction/",
    545: "https://evm-testnet.flowscan.io/tx/",
  };

  return `${explorers[chainId] || explorers[11155111]}${txHash}`;
}

export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount: string): boolean {
  try {
    const parsed = Number.parseFloat(amount);
    return parsed > 0 && !isNaN(parsed);
  } catch {
    return false;
  }
}
