export interface StakingPool {
  id: string;
  name: string;
  token: string;
  apy: number;
  totalStaked: string;
  userStaked: string;
  lockPeriod: number;
  minStake: string;
}

export interface SourceChain {
  id: number;
  name: string;
  logo: string;
  fee: string;
}
