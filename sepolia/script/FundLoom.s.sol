// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {FundLoom} from "../src/FundLoom.sol";

/**
 * @title FundLoomDeploy
 * @notice Foundry script to deploy FundLoom with USDC support on Sepolia.
 * @dev Usage examples:
 *   - Deploy to Sepolia:
 *       forge script script/FundLoom.s.sol:FundLoomDeploy \
 *         --rpc-url $SEPOLIA_RPC_URL \
 *         --private-key $PRIVATE_KEY \
 *         --broadcast -vvvv \
 *         --verify \
 *         --etherscan-api-key $ETHERSCAN_API_KEY
 *   - Simulate deployment:
 *       forge script script/FundLoom.s.sol:FundLoomDeploy -vvvv
 */
contract FundLoomDeploy is Script {
    // Default USDC address on Sepolia
    address public constant SEPOLIA_USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    
    // Additional tokens can be added here
    address[] public allowedTokens;

    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address[] memory tokensToAllow = vm.envOr(
            "ALLOWED_TOKENS",
            new address[](0)
        );

        // If no tokens provided in env, use default USDC
        if (tokensToAllow.length == 0) {
            tokensToAllow = new address[](1);
            tokensToAllow[0] = SEPOLIA_USDC;
        }

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        FundLoom fundLoom = new FundLoom();
        console2.log("FundLoom deployed at:", address(fundLoom));

        // Whitelist the allowed tokens
        for (uint i = 0; i < tokensToAllow.length; i++) {
            if (tokensToAllow[i] != address(0)) {
                fundLoom.setTokenWhitelist(tokensToAllow[i], true);
                console2.log("Whitelisted token:", tokensToAllow[i]);
            }
        }

        // Transfer ownership to the deployer (optional, remove if not needed)
        address deployer = vm.addr(deployerPrivateKey);
        fundLoom.transferOwnership(deployer);
        console2.log("Ownership transferred to:", deployer);

        vm.stopBroadcast();

        // Log deployment details
        console2.log("\n=== Deployment Summary ===");
        console2.log("Network:", block.chainid);
        console2.log("Deployer:", deployer);
        console2.log("FundLoom:", address(fundLoom));
        console2.log("Allowed Tokens:");
        for (uint i = 0; i < tokensToAllow.length; i++) {
            if (tokensToAllow[i] != address(0)) {
                console2.log("-", tokensToAllow[i]);
            }
        }
    }
}
