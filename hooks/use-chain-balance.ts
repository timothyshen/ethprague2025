import { useBalance } from "wagmi";
import { useAccount } from "wagmi";
import { flowTestnet, hederaTestnet, sepolia, baseSepolia } from "viem/chains";

const chains = [flowTestnet, hederaTestnet, sepolia, baseSepolia];

export function useChainBalance(): Record<number, any> {
  const { address } = useAccount();
  const balances: Record<number, any> = {};
  for (const chain of chains) {
    const { data: balance } = useBalance({
      address,
      chainId: chain.id,
    });
    balances[chain.id] = balance;
  }
  return balances;
}
