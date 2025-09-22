# FundLoom Smart Contract Deployment Guide

This guide explains how to deploy the FundLoom contract to Sepolia testnet with USDC support.

## Prerequisites

1. Install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Get an RPC URL (Infura, Alchemy, etc.)
3. Get an Etherscan API key for verification
4. Get test ETH for Sepolia from a faucet

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your_private_key_without_0x
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ALLOWED_TOKENS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238  # USDC on Sepolia
   ```

## Deployment

1. Build the project:
   ```bash
   forge build
   ```

2. Deploy to Sepolia:
   ```bash
   source .env
   forge script script/FundLoom.s.sol:FundLoomDeploy \
     --rpc-url $SEPOLIA_RPC_URL \
     --private-key $PRIVATE_KEY \
     --broadcast \
     --verify \
     --etherscan-api-key $ETHERSCAN_API_KEY \
     -vvvv
   ```

## Verifying the Contract

After deployment, the contract will be automatically verified if you included the `--verify` flag and `ETHERSCAN_API_KEY`.

## Interacting with the Contract

1. **Create a Campaign**
   - Call `createCampaign` with:
     - `name`: Campaign name
     - `charity`: Recipient address
     - `targetAmount`: Funding goal in wei
     - `deadline`: Unix timestamp

2. **Donate with USDC**
   - First, approve the FundLoom contract to spend USDC
   - Call `donateWithToken` with:
     - `campaignId`: The campaign ID
     - `token`: USDC contract address
     - `amount`: Amount in token decimals (6 for USDC)

## Testing

Run tests with:
```bash
forge test -vvv
```

## Security

- Never commit your `.env` file
- Use a dedicated wallet for testing
- Verify all contract interactions on testnet before mainnet
