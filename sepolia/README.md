# FundLoom Smart Contract

## Overview
FundLoom is a decentralized crowdfunding platform built on Ethereum that enables users to create and donate to campaigns using both ETH and ERC20 tokens (like USDC/USDT). It includes features like token whitelisting, campaign management, and secure fund withdrawal mechanisms.

## Application Flow

### 1. Campaign Creation
1. **Admin** whitelists supported ERC20 tokens using `setAllowedToken()`
2. **Creator** calls `createCampaign()` with:
   - Campaign name
   - Charity address (beneficiary)
   - Target amount (in wei)
   - Duration (in seconds)
3. Campaign becomes immediately active and can receive donations

### 2. Donation Process
1. **Donor** can contribute to active campaigns in two ways:
   - ETH: Call `donate()` with ETH value
   - ERC20: Call `donateERC20()` with token address and amount
2. System tracks:
   - Total raised amount
   - Unique donor count
   - Per-token balances
   - Donor history

### 3. Fund Management
1. **After Campaign Deadline**:
   - Campaign creator can withdraw funds using `withdraw()` for ETH or `withdrawToken()` for ERC20
   - Funds can be transferred to another address using `transferFunds()` or `transferTokenFunds()`
2. **Admin Controls**:
   - Can activate/deactivate campaigns
   - Can whitelist/blacklist ERC20 tokens

## Functional Requirements

### 1. Campaign Management
- [x] Create campaigns with name, target amount, and duration
- [x] Track campaign status (active/inactive)
- [x] Set campaign deadlines
- [x] Track total raised amount and unique donors
- [x] Support both ETH and ERC20 token donations

### 2. Donation System
- [x] Accept ETH donations
- [x] Accept ERC20 token donations (whitelisted tokens only)
- [x] Track donor history and amounts
- [x] Prevent donations to inactive/ended campaigns
- [x] Prevent donations of 0 value

### 3. Fund Management
- [x] Allow fund withdrawal after campaign deadline
- [x] Support transferring funds to different addresses
- [x] Track fund transfer status to prevent double-spending
- [x] Separate handling of ETH and ERC20 tokens

### 4. Admin Controls
- [x] Manage token whitelist
- [x] Toggle campaign activation status
- [x] Contract ownership management

## Non-Functional Requirements

### 1. Security
- [x] Reentrancy protection on all state-changing functions
- [x] Input validation for all user inputs
- [x] Access control for sensitive operations
- [x] Protection against common vulnerabilities (e.g., integer overflows)
- [x] Safe token transfer patterns

### 2. Performance
- [x] Gas-efficient storage patterns
- [x] Minimal state changes in loops
- [x] Efficient data structures for lookups

### 3. Usability
- [x] Clear event emissions for all state changes
- [x] Comprehensive view functions
- [x] Intuitive function signatures
- [x] Clear error messages

### 4. Maintainability
- [x] Modular code structure
- [x] Comprehensive NatSpec documentation
- [x] Separation of concerns
- [x] Clear variable naming

## Contract Architecture

### Main Contract: `FundLoom.sol`
Inherits from:
- `Ownable`: For admin functions
- `ReentrancyGuard`: For protection against reentrancy attacks

### Data Structures
1. **Campaign**
   - `id`: Unique identifier
   - `name`: Campaign title
   - `creator`: Campaign creator's address
   - `charity`: Beneficiary address
   - `targetAmount`: Funding goal in wei
   - `raisedAmount`: Total ETH raised (net of withdrawals)
   - `deadline`: Campaign end time
   - `isActive`: Campaign status
   - `totalDonors`: Count of unique donors
   - `isFundsTransferred`: Flag to prevent multiple withdrawals

### Key Mappings
- `campaigns`: Maps campaign IDs to Campaign structs
- `hasDonated`: Tracks donors per campaign
- `tokenRaised`: Tracks ERC20 token amounts per campaign
- `isAllowedToken`: Whitelist of supported ERC20 tokens

## Events
- `CampaignCreated`: When a new campaign is created
- `CampaignActivated/Deactivated`: When campaign status changes
- `DonatedETH/ERC20`: When donations are made
- `WithdrawnETH/ERC20`: When funds are withdrawn
- `FundsTransferred`: When funds are transferred to another address
- `TokenWhitelistUpdated`: When token whitelist is modified

## Core Functions

### Campaign Management
- `createCampaign()`: Create a new crowdfunding campaign
- `activateCampaign()`: Enable donations (admin-only)
- `deactivateCampaign()`: Disable donations (admin-only)

### Donations
- `donate()`: Contribute ETH to a campaign
- `donateERC20()`: Contribute ERC20 tokens to a campaign

### Withdrawals
- `withdraw()`: Withdraw ETH after campaign ends
- `withdrawToken()`: Withdraw ERC20 tokens after campaign ends
- `transferFunds()`: Transfer ETH to another address
- `transferTokenFunds()`: Transfer ERC20 tokens to another address

### Admin
- `setAllowedToken()`: Manage token whitelist

## Development

### Prerequisites
- Foundry (Forge, Anvil, Cast)
- Node.js (for testing)

### Setup
1. Install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Install dependencies:
   ```bash
   forge install
   ```

### Testing
Run the test suite:
```bash
forge test -vvv
```

### Deployment
1. Configure environment variables in `.env`
2. Deploy to network:
   ```bash
   forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify -vvvv
   ```

## Security Considerations
- Always verify token addresses before whitelisting
- Set reasonable campaign deadlines
- Ensure proper access control is maintained
- Test thoroughly on testnets before mainnet deployment
- Use proper error handling for all external calls
- Implement circuit breakers for emergency stops
- Consider adding rate limiting for certain operations
- Regular security audits recommended

## License
MIT
