// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FundLoom (Sepolia-ready, Extended)
 * @notice Campaigns with ETH & ERC20 (USDC/USDT) donations, balances,
 *         campaign names, admin activation toggles, safe withdrawals,
 *         token whitelist, and reentrancy protection.
 */

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract FundLoom is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------
    // Data
    // ---------------------------------------------------------------------
    struct Campaign {
        uint256 id;                 // incremental id
        string name;                 // campaign name/title
        address payable creator;    // campaign creator (has withdraw rights)
        address payable charity;    // withdrawal destination
        uint256 targetAmount;       // goal in wei (informational)
        uint256 raisedAmount;       // ETH raised (net of withdrawals)
        uint256 deadline;           // unix seconds
        bool isActive;              // donations allowed only when true
        uint256 createdAt;          // unix seconds
        uint256 totalDonors;        // unique donors count
        bool isFundsTransferred;   // flag to track if funds were transferred
    }

    uint256 public campaignIdCounter;
    mapping(uint256 => Campaign) public campaigns;
    uint256[] public campaignIds;

    // Unique donors per campaign
    mapping(uint256 => mapping(address => bool)) private hasDonated;

    // Per-token totals raised (raw token units; depends on token decimals)
    mapping(uint256 => mapping(address => uint256)) public tokenRaised;

    // Optional global donor leaderboard (ETH-only aggregate)
    mapping(address => uint256) public donorTotalETH;

    // Token whitelist
    mapping(address => bool) public isAllowedToken;
    event TokenWhitelistUpdated(address indexed token, bool allowed);

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------
    event CampaignCreated(uint256 indexed id, string name, address indexed creator, address indexed charity);
    event CampaignActivated(uint256 indexed id);
    event CampaignDeactivated(uint256 indexed id);
    event DonatedETH(uint256 indexed campaignId, address indexed donor, uint256 amountETH);
    event WithdrawnETH(uint256 indexed campaignId, address indexed to, uint256 amountETH);
    event DonatedERC20(uint256 indexed campaignId, address indexed donor, address indexed token, uint256 amount);
    event WithdrawnERC20(uint256 indexed campaignId, address indexed token, address indexed to, uint256 amount);
    event FundsTransferred(uint256 indexed campaignId, address indexed to, uint256 amount);
    event TokenFundsTransferred(uint256 indexed campaignId, address indexed token, address indexed to, uint256 amount);

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    constructor() Ownable(msg.sender) {
        campaignIdCounter = 0;
    }

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------
    function setAllowedToken(address token, bool allowed) external onlyOwner {
        require(token != address(0), "BAD_TOKEN");
        isAllowedToken[token] = allowed;
        emit TokenWhitelistUpdated(token, allowed);
    }

    // ---------------------------------------------------------------------
    // Campaigns
    // ---------------------------------------------------------------------
    function createCampaign(
        string memory name,
        address payable charity,
        uint256 targetAmount,
        uint256 durationInSeconds
    ) external returns (uint256 id) {
        require(bytes(name).length > 0, "NO_NAME");
        require(charity != address(0), "BAD_CHARITY");
        require(durationInSeconds > 0, "BAD_DURATION");

        id = ++campaignIdCounter;
        campaigns[id] = Campaign({
            id: id,
            name: name,
            creator: payable(msg.sender),
            charity: charity,
            targetAmount: targetAmount,
            raisedAmount: 0,
            deadline: block.timestamp + durationInSeconds,
            isActive: true,
            createdAt: block.timestamp,
            totalDonors: 0,
            isFundsTransferred: false
        });
        campaignIds.push(id);
        emit CampaignCreated(id, name, msg.sender, charity);
    }

    function deactivateCampaign(uint256 id) external onlyOwner {
        Campaign storage c = campaigns[id];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.isActive, "ALREADY_OFF");
        c.isActive = false;
        emit CampaignDeactivated(id);
    }

    function activateCampaign(uint256 id) external onlyOwner {
        Campaign storage c = campaigns[id];
        require(c.id != 0, "NO_CAMPAIGN");
        require(!c.isActive, "ALREADY_ON");
        c.isActive = true;
        emit CampaignActivated(id);
    }

    // ---------------------------------------------------------------------
    // Donations (ETH)
    // ---------------------------------------------------------------------
    function donate(uint256 campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.isActive, "NOT_ACTIVE");
        require(block.timestamp <= c.deadline, "ENDED");
        require(msg.value > 0, "NO_VALUE");

        c.raisedAmount += msg.value;
        if (!hasDonated[campaignId][msg.sender]) {
            hasDonated[campaignId][msg.sender] = true;
            c.totalDonors += 1;
        }
        donorTotalETH[msg.sender] += msg.value;

        emit DonatedETH(campaignId, msg.sender, msg.value);
    }

    // ---------------------------------------------------------------------
    // Donations (ERC20)
    // ---------------------------------------------------------------------
    function donateERC20(uint256 campaignId, address token, uint256 amount) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.isActive, "NOT_ACTIVE");
        require(block.timestamp <= c.deadline, "ENDED");
        require(isAllowedToken[token], "TOKEN_NOT_ALLOWED");
        require(amount > 0, "NO_VALUE");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        tokenRaised[campaignId][token] += amount;
        if (!hasDonated[campaignId][msg.sender]) {
            hasDonated[campaignId][msg.sender] = true;
            c.totalDonors += 1;
        }

        emit DonatedERC20(campaignId, msg.sender, token, amount);
    }

    // ---------------------------------------------------------------------
    // Withdrawals
    // ---------------------------------------------------------------------
    function withdraw(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.creator == msg.sender, "NOT_CREATOR");
        require(block.timestamp > c.deadline, "CAMPAIGN_NOT_ENDED");
        require(c.raisedAmount > 0, "NO_FUNDS");
        require(!c.isFundsTransferred, "FUNDS_ALREADY_TRANSFERRED");

        uint256 amount = c.raisedAmount;
        c.raisedAmount = 0;
        c.isFundsTransferred = true;

        (bool ok, ) = c.creator.call{value: amount}("");
        require(ok, "TRANSFER_FAIL");

        emit WithdrawnETH(campaignId, c.creator, amount);
    }

    function withdrawToken(uint256 campaignId, address token) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.creator == msg.sender, "NOT_CREATOR");
        require(block.timestamp > c.deadline, "CAMPAIGN_NOT_ENDED");
        require(isAllowedToken[token], "TOKEN_NOT_ALLOWED");
        
        uint256 amount = tokenRaised[campaignId][token];
        require(amount > 0, "NO_TOKEN_BALANCE");
        require(!c.isFundsTransferred, "FUNDS_ALREADY_TRANSFERRED");

        tokenRaised[campaignId][token] = 0;
        c.isFundsTransferred = true;
        IERC20(token).safeTransfer(c.creator, amount);

        emit WithdrawnERC20(campaignId, token, c.creator, amount);
    }
    
    /**
     * @dev Transfer funds to another address (can only be called by the creator after campaign ends)
     * @param campaignId ID of the campaign
     * @param to Address to transfer the funds to
     */
    function transferFunds(uint256 campaignId, address payable to) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.creator == msg.sender, "NOT_CREATOR");
        require(block.timestamp > c.deadline, "CAMPAIGN_NOT_ENDED");
        require(c.raisedAmount > 0, "NO_FUNDS");
        require(to != address(0), "INVALID_RECIPIENT");
        
        uint256 amount = c.raisedAmount;
        c.raisedAmount = 0;
        c.isFundsTransferred = true;
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "TRANSFER_FAILED");
        
        emit FundsTransferred(campaignId, to, amount);
    }
    
    /**
     * @dev Transfer ERC20 tokens to another address (can only be called by the creator after campaign ends)
     * @param campaignId ID of the campaign
     * @param token Address of the ERC20 token
     * @param to Address to transfer the tokens to
     */
    function transferTokenFunds(uint256 campaignId, address token, address to) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "NO_CAMPAIGN");
        require(c.creator == msg.sender, "NOT_CREATOR");
        require(block.timestamp > c.deadline, "CAMPAIGN_NOT_ENDED");
        require(isAllowedToken[token], "TOKEN_NOT_ALLOWED");
        require(to != address(0), "INVALID_RECIPIENT");
        
        uint256 amount = tokenRaised[campaignId][token];
        require(amount > 0, "NO_TOKEN_BALANCE");
        
        tokenRaised[campaignId][token] = 0;
        IERC20(token).safeTransfer(to, amount);
        
        emit TokenFundsTransferred(campaignId, token, to, amount);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------
    function getCampaign(uint256 id) external view returns (Campaign memory) {
        require(campaigns[id].id != 0, "NO_CAMPAIGN");
        return campaigns[id];
    }

    /// @notice Get live balance for ETH (token=0) or ERC20
    function getCampaignBalance(uint256 id, address token) external view returns (uint256) {
        require(campaigns[id].id != 0, "NO_CAMPAIGN");
        if (token == address(0)) {
            return campaigns[id].raisedAmount;
        } else {
            return tokenRaised[id][token];
        }
    }

    function getAllCampaignIds() external view returns (uint256[] memory) {
        return campaignIds;
    }

    // ---------------------------------------------------------------------
    // ETH acceptance (default)
    // ---------------------------------------------------------------------
    receive() external payable {}
    fallback() external payable {}
}
