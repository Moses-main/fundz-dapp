import { ethers } from "ethers";
import { CONTRACT_ADDRESS, FUNDLOOM_ABI } from './contracts';

// Function to get a single campaign by ID
export const getCampaign = async (id, provider) => {
  try {
    // If provider is a signer, get its provider
    const providerToUse = provider?.provider ? provider : provider;
    
    // Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      FUNDLOOM_ABI,
      providerToUse
    );
    
    // Get campaign data
    const campaignData = await contract.campaigns(id);

    // Helper function to safely format ether values
    const formatEther = (value) => {
      try {
        return ethers.formatEther(value.toString());
      } catch (e) {
        console.error('Error formatting ether value:', e);
        return '0';
      }
    };

    // Convert BigNumber values to strings for easier handling
    return {
      id: id.toString(),
      title: campaignData.name || 'Unnamed Campaign',
      description: campaignData.description || 'No description provided',
      creator: campaignData.creator || '0x0000000000000000000000000000000000000000',
      image: campaignData.imageUrl || '',
      category: campaignData.category || 'General',
      goal: parseFloat(formatEther(campaignData.goal || 0)),
      raised: parseFloat(formatEther(campaignData.amountRaised || 0)),
      startDate: campaignData.startTime ? new Date(Number(campaignData.startTime) * 1000) : new Date(),
      endDate: campaignData.endTime ? new Date(Number(campaignData.endTime) * 1000) : new Date(),
      deadline: campaignData.deadline ? Number(campaignData.deadline) : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // Default to 30 days from now
      minContribution: parseFloat(formatEther(campaignData.minContribution || 0)),
      backersCount: Number(campaignData.backersCount || 0),
      isActive: Boolean(campaignData.isActive),
      isApproved: Boolean(campaignData.isApproved),
      totalDonors: Number(campaignData.totalDonors || 0),
      isFundsTransferred: Boolean(campaignData.isFundsTransferred)
    };
  } catch (error) {
    console.error("Error fetching campaign:", error);
    throw error;
  }
};

// Function to get all campaigns
export const getCampaigns = async (provider) => {
  try {
    // If provider is a signer, get its provider
    const providerToUse = provider?.provider ? provider : provider;
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      FUNDLOOM_ABI,
      providerToUse
    );
    
    // Get campaign count - using getCampaignsCount() instead of campaignCount()
    const campaignCount = await contract.getCampaignsCount ? 
      await contract.getCampaignsCount() : 
      (await contract.campaignsCount?.()) || 0;
    
    // Ensure we have a valid campaign count
    const count = Number(campaignCount?.toString() || '0');
    const campaigns = [];

    // Fetch all campaigns in parallel
    const campaignPromises = [];
    for (let i = 0; i < count; i++) {
      campaignPromises.push(
        getCampaign(i, providerToUse).catch(err => {
          console.error(`Error fetching campaign ${i}:`, err);
          return null;
        })
      );
    }

    // Wait for all promises to resolve and filter out any failed fetches
    const results = await Promise.all(campaignPromises);
    return results.filter(campaign => campaign !== null);
  } catch (error) {
    console.error("Error in getCampaigns:", error);
    throw error;
  }
};
