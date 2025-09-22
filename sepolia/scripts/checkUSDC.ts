import { ethers } from "ethers";
import { SEPOLIA_USDC } from "../frontend/src/config/contracts";

// ABI for the ERC20 token (USDC)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

async function main() {
  // Load environment variables
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const RPC_URL = process.env.SEPOLIA_RPC_URL;

  if (!PRIVATE_KEY || !RPC_URL) {
    throw new Error("Please set PRIVATE_KEY and SEPOLIA_RPC_URL in .env file");
  }

  // Initialize provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const address = await wallet.getAddress();

  console.log(`Connected to ${RPC_URL}`);
  console.log(`Account: ${address}`);
  
  // Initialize USDC contract
  const usdc = new ethers.Contract(SEPOLIA_USDC, ERC20_ABI, wallet);
  const decimals = await usdc.decimals();
  const symbol = await usdc.symbol();
  const balance = await usdc.balanceOf(address);

  console.log(`\n${symbol} Balance: ${ethers.formatUnits(balance, decimals)}`);
  console.log(`Token Address: ${SEPOLIA_USDC}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
