import { useBalance } from "wagmi";
import { useAccount } from "wagmi";
import { flowTestnet, hederaTestnet, sepolia, baseSepolia } from "viem/chains";


export function useChainBalance(): Record<number, any> {
  const { address } = useAccount();

  const sepoliaBalance = useBalance({ address, chainId: sepolia.id });
  const baseSepoliaBalance = useBalance({ address, chainId: baseSepolia.id });
  const flowTestnetBalance = useBalance({ address, chainId: flowTestnet.id });
  const hederaTestnetBalance = useBalance({
    address,
    chainId: hederaTestnet.id,
  });

  return {
    [sepolia.id]: sepoliaBalance.data,
    [baseSepolia.id]: baseSepoliaBalance.data,
    [flowTestnet.id]: flowTestnetBalance.data,
    [hederaTestnet.id]: hederaTestnetBalance.data,
  };
}
