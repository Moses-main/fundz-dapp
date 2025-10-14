# Fundloom Starknet Smart Contracts

This directory contains the Starknet smart contracts for the Fundloom project, built using Scarb and Cairo.

## Prerequisites

1. Install Scarb (Starknet package manager):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
   ```

2. Install Starknet Foundry (for testing and deployment):
   ```bash
   curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
   ```
   Add to your shell config:
   ```bash
   export PATH="$HOME/.foundry/bin:$PATH"
   ```

## Project Structure

```
starknet/
├── Scarb.toml           # Project configuration and dependencies
├── src/
│   └── lib.cairo        # Main contract code
└── tests/               # Test files
```

## Compiling the Contract

1. Navigate to the project directory:
   ```bash
   cd /path/to/fundloom-dapp/starknet
   ```

2. Build the project:
   ```bash
   scarb build
   ```
   This will compile your contracts and generate the necessary artifacts in the `target` directory.

## Testing

1. Write your tests in the `tests/` directory with `_test.cairo` suffix.

2. Run tests using:
   ```bash
   scarb test
   ```

## Deploying the Contract

### Prerequisites
1. Install Starknet CLI:
   ```bash
   pip install starknet-devnet
   ```

2. Start a local devnet (in a separate terminal):
   ```bash
   starknet-devnet --seed 0
   ```

### Deploy Script

1. Create a deployment script in `scripts/deploy.ts`:

```typescript
import { Account, ec, json, hash, Provider } from 'starknet';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    // Initialize provider
    const provider = new Provider({ baseUrl: 'http://localhost:5050' });
    
    // Initialize pre-deployed account (from devnet)
    const privateKey = '0x71d7bb07b9a64f6f78ac4c816aff4ee3';
    const accountAddress = '0x7e00d496e324876bbc8531f2d9a86bf22225716602afda2f1c8d12a0741419f3';
    
    const account = new Account(provider, accountAddress, privateKey);
    
    // Compile the contract
    const compiledContract = await provider.compileContract({
        contract: 'src/lib.cairo',
    });
    
    // Deploy the contract
    const deployResponse = await account.declare({
        classHash: '0x123...', // Replace with actual class hash
        contract: compiledContract,
    });
    
    console.log('Contract declared with class hash:', deployResponse.class_hash);
    
    // Deploy an instance of the contract
    const targetAmount = 1000; // Example target amount
    const deployTx = await account.deploy({
        classHash: deployResponse.class_hash,
        constructorCalldata: [targetAmount],
    });
    
    console.log('Deployment transaction:', deployTx);
}

main().catch(console.error);
```

2. Install dependencies:
   ```bash
   npm init -y
   npm install starknet dotenv
   ```

3. Run the deployment script:
   ```bash
   npx ts-node scripts/deploy.ts
   ```

## Interacting with the Contract

You can interact with the deployed contract using the Starknet.js library. Here's an example:

```typescript
import { Account, Contract, Provider } from 'starknet';

// Initialize provider and account (same as in deploy script)
const provider = new Provider({ baseUrl: 'http://localhost:5050' });
const account = new Account(provider, 'YOUR_ACCOUNT_ADDRESS', 'YOUR_PRIVATE_KEY');

// Contract ABI and address
const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const { abi } = await provider.getClassAt(contractAddress);

// Create contract instance
const contract = new Contract(abi, contractAddress, provider);
contract.connect(account);

// Call view functions
const raisedAmount = await contract.get_raised_amount();
console.log('Raised amount:', raisedAmount.toString());

// Send transactions
const contributionAmount = 100;
await contract.contribute(contributionAmount);
console.log('Contribution successful!');
```

## Next Steps

1. Add more functionality to the contract
2. Write comprehensive tests
3. Deploy to testnet/mainnet
4. Integrate with the frontend

## Resources

- [Starknet Documentation](https://www.cairo-lang.org/docs/)
- [Starknet.js Documentation](https://www.starknetjs.com/)
- [Scarb Documentation](https://docs.swmansion.com/scarb/)
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/)
