export interface ChainPosition {
  chainId: number;
  amount: string;
  token: string;
  rewards: string;
  apy: number;
  status: string;
  sourceChain: string;
}

export interface StakingPosition {
  id: string;
  pool: string;
  sourceChain: string;
  chainLogo: string;
  token: string;
  amount: string | undefined;
  value: string;
  apy: number;
  rewards: string;
  lockEnd: string;
  status: string;
}
