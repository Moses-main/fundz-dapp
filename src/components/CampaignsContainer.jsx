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

  // Load campaigns from the blockchain or use demo data
  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    
    // Always load demo data first for immediate display
    const demoCampaigns = [
      {
        id: '1',
        name: 'Save the Rainforest',
        description: 'Help us protect 1000 acres of Amazon rainforest. Your support will help preserve biodiversity and combat climate change.',
        raisedAmount: ethers.parseEther('5'),
        targetAmount: ethers.parseEther('10'),
        deadline: Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60), // 15 days from now
        creator: '0x123...456',
        isActive: true,
        totalDonors: 42,
        isFundsTransferred: false,
        image: '/charity-1.jpg',
        category: 'Environment'
      },
      {
        id: '2',
        name: 'Education for All',
        description: 'Providing school supplies to underprivileged children in rural areas. Help us give the gift of education.',
        raisedAmount: ethers.parseEther('3'),
        targetAmount: ethers.parseEther('5'),
        deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        creator: '0x789...012',
        isActive: true,
        totalDonors: 28,
        isFundsTransferred: false,
        image: '/charity-2.jpg',
        category: 'Education'
      }
    ];

    try {
      // Try to load from blockchain if connected
      if (ethProvider) {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDLOOM_ABI, ethProvider);
        const count = await contract.campaignCount();
        const campaignCount = parseInt(count.toString());
        
        if (campaignCount > 0) {
          const campaignsData = [];
          for (let i = 1; i <= campaignCount; i++) {
            try {
              const campaign = await contract.campaigns(i);
              campaignsData.push(campaign);
            } catch (error) {
              console.error(`Error fetching campaign ${i}:`, error);
            }
          }
          setCampaigns(campaignsData.map(formatCampaign));
          return;
        }
      }
      
      // Fall back to demo data if no blockchain data or not connected
      setCampaigns(demoCampaigns.map(formatCampaign));
    } catch (error) {
      console.error("Error loading campaigns from blockchain:", error);
      // Use demo data if there's an error
      setCampaigns(demoCampaigns.map(formatCampaign));
    } finally {
      setLoading(false);
    }
  }, [isEthConnected, ethSigner]);

  // Load campaigns on component mount and when wallet connects/disconnects
  useEffect(() => {
    loadCampaigns();
    
    // Listen for account changes to refresh campaigns
    const handleAccountsChanged = (accounts) => {
      loadCampaigns();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (campaigns.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          No Campaigns Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          There are no active campaigns at the moment. Be the first to create one!
        </p>
        {!isEthConnected && (
          <button
            onClick={() => document.querySelector('button[data-testid="wallet-connect-button"]')?.click()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Connect Wallet to Create Campaign
          </button>
        )}
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
