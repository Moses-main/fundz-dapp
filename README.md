# Fundloom - Decentralized Crowdfunding Platform

![Fundloom Logo](/public/light_charichain_logo.png)

## 🌟 Introduction

Fundloom is a revolutionary decentralized crowdfunding platform that empowers creators, artists, athletes, and individuals to raise funds for their projects, causes, and dreams. Built on blockchain technology, Fundloom provides a transparent, secure, and borderless way to receive support from a global community.

## 🚀 Key Features

- **Decentralized Campaigns**: Create and manage fundraising campaigns on the blockchain
- **Multi-Currency Support**: Contribute using various cryptocurrencies or fiat currencies
- **Flexible Payouts**: Receive funds in stablecoins (USDC), ETH, or local fiat currencies
- **On/Off Ramp Integration**: Seamless conversion between crypto and fiat (NGN and other currencies coming soon)
- **Transparent Transactions**: All contributions are recorded on the blockchain for full transparency
- **Smart Contract Security**: Built with security-first principles using Starknet's zk-rollup technology

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, TailwindCSS
- **Blockchain**: 
  - Ethereum (Solidity) - Sepolia Testnet
  - Starknet (zk-rollups for Ethereum scaling) - Testnet
- **Smart Contracts**: 
  - Solidity (Ethereum)
  - Cairo (Starknet's native language)
- **Wallet Integration**: 
  - Ethereum: MetaMask, WalletConnect
  - Starknet: Argent, Braavos
- **Fiat Integration**: On-ramp/off-ramp services for fiat transactions

## 📦 Project Structure

```
fundloom-dapp/
├── public/             # Static files
├── scripts/            # Utility scripts
├── src/                # Source code
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   └── lib/            # Core application logic
└── starknet/           # Starknet smart contracts
    ├── src/            # Cairo smart contract source
    └── tests/          # Smart contract tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A Starknet-compatible wallet (Argent/Braavos)

### Installation

1. Clone the repository:
   ```bash
   git clonehttps://github.com/Moses-main/fundz-dapp.git
   cd fundz-dapp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Ethereum
   REACT_APP_ETHEREUM_NETWORK=sepolia
   REACT_APP_INFURA_ID=your_infura_id
   
   # Starknet
   REACT_APP_STARKNET_NETWORK=testnet
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 🔒 Smart Contracts

Our platform features a multi-chain architecture with smart contracts deployed on both Ethereum and Starknet networks:

### Ethereum (Solidity - Sepolia Testnet)
- `FundLoom.sol`: Main contract that includes:
  - Campaign creation and management
  - Donation handling (ETH and ERC-20 tokens)
  - Fund withdrawal mechanisms
  - Campaign state management
  - Token whitelisting for donations
  - Emergency withdrawal functionality

- `main_contract.sol`: (Deprecated) Previous version of the main contract

Contracts are deployed using Foundry and Hardhat, with deployment scripts available in the `scripts/` directory.

### Starknet (Cairo - Testnet)
- `FundLoom.cairo`: Main contract that handles:
  - Campaign creation and management
  - Native token and ERC-20 donations
  - Fund withdrawals and transfers
  - Campaign activation/deactivation
  - Token whitelisting for donations
  - Campaign state management

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Connect With Us

- [Website](https://fundloom.xyz)
- [Twitter](https://twitter.com/fundloom)
- [Discord](https://discord.gg/fundloom)
- [GitHub Issues](https://github.com/your-username/fundloom-dapp/issues)

## 🙏 Acknowledgments

- Starknet community for the amazing zk-rollup technology
- All our early backers and contributors
- The open-source community for their invaluable tools and libraries
