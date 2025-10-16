// CampaignsContainer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUnifiedWallet } from "../context/UnifiedWalletContext";
import { ethers } from "ethers";
import CampaignsPage from "../pages/CampaignsPage";
import { CONTRACT_ADDRESS } from "../lib/contracts";
import { FUNDLOOM_ABI } from "../lib/contracts";
import { toast } from "react-hot-toast";

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
    id: c.id?.toString() || '0',
    title: c.name || 'Untitled Campaign',
    description: c.description || 'No description provided',
    raised: c.raisedAmount ? parseFloat(ethers.utils.formatEther(c.raisedAmount.toString())) : 0,
    goal: c.targetAmount ? parseFloat(ethers.utils.formatEther(c.targetAmount.toString())) : 0,
    daysLeft: c.deadline 
      ? Math.max(0, Math.ceil((parseInt(c.deadline.toString()) - Math.floor(Date.now() / 1000)) / 86400))
      : 30,
    creator: c.creator || '0x000...000',
    isActive: c.isActive !== undefined ? c.isActive : true,
    totalDonors: c.totalDonors ? parseInt(c.totalDonors.toString()) : 0,
    isFundsTransferred: c.isFundsTransferred || false,
    image: c.image || null,
    category: c.category || 'General',
    backers: c.totalDonors ? parseInt(c.totalDonors.toString()) : 0,
    isNew: c.startTime ? (Date.now() / 1000 - c.startTime) < 604800 : false
  });

  // Load campaigns from the blockchain or use demo data
  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    
    // Demo data to show when not connected to a wallet
    const demoCampaigns = [
      {
        id: '1',
        title: 'Save the Rainforest',
        description: 'Help us protect 1000 acres of Amazon rainforest from deforestation',
        raised: 2500,
        goal: 10000,
        daysLeft: 15,
        creator: '0x123...abc',
        isActive: true,
        totalDonors: 42,
        isFundsTransferred: false,
        image: null,
        category: 'Environment',
        backers: 42,
        isNew: true
      },
      {
        id: '2',
        title: 'Clean Water Initiative',
        description: 'Providing clean water to 1000 families in need',
        raised: 15000,
        goal: 50000,
        daysLeft: 30,
        creator: '0x456...def',
        isActive: true,
        totalDonors: 128,
        isFundsTransferred: false,
        image: null,
        category: 'Humanitarian',
        backers: 128,
        isNew: false
      }
    ];

    try {
      if (!isEthConnected || !ethProvider || !ethSigner) {
        setCampaigns(demoCampaigns);
        setLoading(false);
        return;
      }

      // Load real data when wallet is connected
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDLOOM_ABI, ethSigner);
      const campaignCount = await contract.getCampaignsCount();
      const campaignPromises = [];

      for (let i = 0; i < campaignCount; i++) {
        campaignPromises.push(contract.getCampaign(i));
      }

      const campaignsData = await Promise.all(campaignPromises);
      
      const formattedCampaigns = campaignsData.map((campaign, index) => ({
        id: index.toString(),
        title: campaign.name || `Campaign #${index + 1}`,
        description: campaign.description || 'No description provided',
        raised: parseFloat(ethers.utils.formatEther(campaign.raisedAmount?.toString() || '0')),
        goal: parseFloat(ethers.utils.formatEther(campaign.targetAmount?.toString() || '0')),
        daysLeft: Math.max(0, Math.ceil((parseInt(campaign.deadline?.toString() || '0') - Math.floor(Date.now() / 1000)) / 86400)),
        creator: campaign.creator || '0x000...000',
        isActive: campaign.isActive !== undefined ? campaign.isActive : true,
        totalDonors: parseInt(campaign.totalDonors?.toString() || '0'),
        isFundsTransferred: campaign.isFundsTransferred || false,
        image: null,
        category: campaign.category || 'General',
        backers: parseInt(campaign.totalDonors?.toString() || '0'),
        isNew: (Date.now() / 1000 - (campaign.startTime?.toNumber() || 0)) < 604800
      }));

      setCampaigns(formattedCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns. Please try again.');
      // Fall back to demo data if there's an error
      setCampaigns(demoCampaigns);
    } finally {
      setLoading(false);
    }
  }, [isEthConnected, ethProvider, ethSigner, ethAccount]);

  // Load campaigns on component mount and when wallet connection changes
  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns, isEthConnected, ethAccount]);

  // Listen for campaign created/updated events
  useEffect(() => {
    if (!ethProvider || !isEthConnected) return;

    const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDLOOM_ABI, ethProvider);
    
    const handleCampaignCreated = () => {
      toast.success('New campaign created!');
      loadCampaigns();
    };

    const handleCampaignDonated = () => {
      loadCampaigns();
    };

    contract.on('CampaignCreated', handleCampaignCreated);
    contract.on('DonationMade', handleCampaignDonated);
    contract.on('CampaignActivated', loadCampaigns);
    contract.on('CampaignDeactivated', loadCampaigns);
    contract.on('FundsWithdrawn', loadCampaigns);

    return () => {
      contract.off('CampaignCreated', handleCampaignCreated);
      contract.off('DonationMade', handleCampaignDonated);
      contract.off('CampaignActivated', loadCampaigns);
      contract.off('CampaignDeactivated', loadCampaigns);
      contract.off('FundsWithdrawn', loadCampaigns);
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
