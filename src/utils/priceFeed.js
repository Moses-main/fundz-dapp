import { ethers } from "ethers";

// ABI for Chainlink ETH/USD price feed
const AGGREGATOR_V3_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// Sepolia ETH/USD price feed (Chainlink)
const ETH_USD_PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

export const getEthPrice = async (provider) => {
  try {
    if (!provider) {
      console.warn("No provider available, using default ETH price");
      return 2000; // Default price if no provider
    }

    // Create contract instance
    const priceFeed = new ethers.Contract(
      ETH_USD_PRICE_FEED,
      AGGREGATOR_V3_ABI,
      provider
    );

    // Get the latest round data
    const roundData = await priceFeed.latestRoundData();
    
    // Check if we got valid data
    if (!roundData || !roundData.answer) {
      throw new Error("Invalid price data received from oracle");
    }
    
    const decimals = await priceFeed.decimals();
    const price = Number(roundData.answer) / (10 ** Number(decimals));
    
    // Validate the price is reasonable
    if (price < 1 || price > 100000) {
      console.warn("Suspicious ETH price received:", price);
      return 2000; // Fallback price if price is out of expected range
    }
    
    return price;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    // Fallback to a default price if the price feed fails
    return 2000; // Default to $2000 if there's an error
  }
};
