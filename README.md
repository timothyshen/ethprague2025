<p align="center">
  <img src="public/logo.png" alt="AnyStake Logo" width="128"/>
</p>

# AnyStake

**The Future of DeFi is Cross-Chain — Powered by Flow, Ethereum, and More**

AnyStake is a next-generation cross-chain staking protocol that aggregates liquidity and staking opportunities across Flow, Ethereum, Hedera and other leading blockchains. Built for seamless user experience and global liquidity, AnyStake enables users to stake, bridge, and earn yield across multiple chains from a single interface.

## 🚀 Key Features
- **Cross-Chain Staking Aggregator:** Stake assets from Flow, Ethereum, Hedera and more into unified high-yield pools.
- **Flow Integration:** Directly bridge and stake assets from Flow, unlocking new DeFi opportunities.
- **Unified Dashboard:** Track balances, rewards, and positions across all supported chains in real time.
- **Seamless UX:** Effortless wallet connection, chain switching, and transaction monitoring.
- **LayerZero Messaging:** Secure, reliable cross-chain communication and asset transfer.

## 🌉 Why Cross-Chain & Why LayerZero?
- **Breaks DeFi Silos:** Bridges liquidity between Flow and EVM chains but not using bridge.
- **Composable Primitives:** Enables new DeFi strategies and products that rely on multi-chain flows of assets and data.
- **Global Liquidity:** Connects Flow to the global DeFi ecosystem, maximizing yield and opportunity.

## 🛠️ Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/timothyshen/ethprague2025
cd ethprague2025
pnpm install # or yarn install or npm install
```

Start the development server:

```bash
pnpm dev # or yarn dev or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## ⚙️ Environment Variables

Create a `.env` file using  `env-example` and set the following:

```
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

## 📝 Project Structure
- `app/` — Next.js app directory
- `components/` — UI and logic components
- `hooks/` — Custom React hooks (Web3, staking, etc.)
- `contract/` — Solidity smart contracts, LayerZero config, deployment scripts
- `public/` — Static assets (including logo)

## 🤝 Credits
- Built with [Next.js](https://nextjs.org/), [wagmi](https://wagmi.sh/), [ConnectKit](https://connectkit.dev/), [LayerZero](https://layerzero.network/), and [Flow](https://www.flow.com/).
- Inspired by the vision of a truly cross-chain DeFi future.

---

<p align="center">
  <b>Build the next generation of DeFi that breaks silos and brings Flow into the global liquidity network.</b>
</p>
