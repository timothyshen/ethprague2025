# Smart Contract Deployment Guide

## Prerequisites
- Node.js and npm installed
- Hardhat or Foundry for deployment
- Private key with ETH for gas fees
- Alchemy API key (already configured)

## Deployment Steps

### 1. Install Dependencies
\`\`\`bash
npm install --save-dev hardhat @openzeppelin/contracts
\`\`\`

### 2. Deploy StakingPool Contract
\`\`\`bash
# Deploy to Sepolia testnet first
npx hardhat run scripts/deploy-staking-pool.js --network sepolia

# Deploy to mainnet (when ready)
npx hardhat run scripts/deploy-staking-pool.js --network mainnet
\`\`\`

### 3. Deploy Bridge Contracts
\`\`\`bash
# Deploy to each L2 network
npx hardhat run scripts/deploy-bridge-sender.js --network base
npx hardhat run scripts/deploy-bridge-sender.js --network optimism
npx hardhat run scripts/deploy-bridge-sender.js --network polygon
\`\`\`

### 4. Update Contract Addresses
After deployment, update the contract addresses in `lib/contracts.ts`:

\`\`\`typescript
export const CONTRACTS = {
  1: {
    stakingPool: "0xYOUR_DEPLOYED_STAKING_POOL_ADDRESS",
    bridgeReceiver: "0xYOUR_DEPLOYED_BRIDGE_RECEIVER_ADDRESS",
  },
  // ... other networks
}
\`\`\`

### 5. Verify Contracts
\`\`\`bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
\`\`\`

## Testing
1. Test on Sepolia testnet first
2. Use small amounts for initial testing
3. Verify all functions work correctly
4. Test cross-chain bridging functionality

## Security Considerations
- Audit smart contracts before mainnet deployment
- Use multi-sig wallets for contract ownership
- Implement proper access controls
- Test emergency functions
