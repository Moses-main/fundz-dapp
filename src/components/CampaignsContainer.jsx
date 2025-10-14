// CampaignsContainer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUnifiedWallet } from "../context/UnifiedWalletContext";
import { ethers } from "ethers";
import CampaignsPage from "../pages/CampaignsPage";
import { CONTRACT_ADDRESS } from "../lib/contracts";
import { FUNDLOOM_ABI } from "../lib/contracts";

const CampaignsContainer = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { 
    ethAccount, 
    isEthConnected, 
    ethProvider,
    ethSigner
  } = useUnifiedWallet();
  const navigate = useNavigate();

  // Utility to convert on-chain data to frontend-friendly format
  const formatCampaign = (c) => ({
    id: c.id.toString(),
    title: c.name,
    description: `Target: ${c.targetAmount.toString()} Wei`, // placeholder
    raised: parseInt(c.raisedAmount.toString()), // convert BigNumber
    goal: parseInt(c.targetAmount.toString()),
    daysLeft: Math.max(
      0,
      Math.ceil((parseInt(c.deadline.toString()) - Date.now() / 1000) / 86400)
    ),
    creator: c.creator,
    isActive: c.isActive,
    totalDonors: parseInt(c.totalDonors.toString()),
    isFundsTransferred: c.isFundsTransferred,
    // optional placeholders
    image: null,
    category: "General",
    backers: parseInt(c.totalDonors.toString()),
    isNew: true,
  });

  // Load campaigns from the blockchain
  const loadCampaigns = useCallback(async () => {
    if (!isEthConnected || !ethSigner) {
      setLoading(false);
      // Don't return here, let the UI handle the unconnected state
      setCampaigns([]);
      return;
    }

    try {
      setLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDLOOM_ABI, ethSigner);
      
      // Fetch campaign count
      const count = await contract.campaignCount();
      const campaignCount = parseInt(count.toString());
      
      // Fetch each campaign
      const campaignPromises = [];
      for (let i = 1; i <= campaignCount; i++) {
        campaignPromises.push(contract.campaigns(i));
      }
      
      const campaignsData = await Promise.all(campaignPromises);
      setCampaigns(campaignsData.map(formatCampaign));
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, [isEthConnected, ethSigner]);

  useEffect(() => {
    loadCampaigns();
    
    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Disconnected
        setCampaigns([]);
      } else {
        // Account changed, reload campaigns
        loadCampaigns();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [loadCampaigns]);

  // Load campaigns when wallet connects
  useEffect(() => {
    if (isEthConnected && ethSigner) {
      loadCampaigns();
    }
  }, [isEthConnected, ethSigner, loadCampaigns]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isEthConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Browse Campaigns
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Connect your wallet to create a campaign or support existing ones.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => document.querySelector('button[data-testid="wallet-connect-button"]')?.click()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CampaignsPage 
        campaigns={campaigns} 
        loading={loading} 
        onRefresh={loadCampaigns}
      />
    </div>
  );
};

export default CampaignsContainer;
