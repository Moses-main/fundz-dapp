import { ethers } from "ethers";
import { CONTRACT_ADDRESS, FUNDLOOM_ABI, USDC_ADDRESS, USDC_ABI } from './contracts';

// Helper function to create contract instance
const getContract = (address, abi, provider) => {
  return new ethers.Contract(address, abi, provider);
};

// Helper function to get signer from provider
const getSigner = async (provider) => {
  const signer = await provider.getSigner();
  return signer;
};

// Function to get a single campaign by ID
const getCampaign = async (id, provider) => {
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
    const formattedCampaign = {
      id: id.toString(),
      title: campaignData.name || campaignData.title || 'Unnamed Campaign',
      description: campaignData.description || 'No description provided',
      creator: campaignData.creator || '0x0000000000000000000000000000000000000000',
      image: campaignData.image || campaignData.imageUrl || '',
      category: campaignData.category || 'General',
      goal: parseFloat(formatEther(campaignData.goal || campaignData.targetAmount || 0)),
      raised: parseFloat(formatEther(campaignData.raised || campaignData.amountRaised || 0)),
      startDate: campaignData.startTime ? new Date(Number(campaignData.startTime) * 1000) : new Date(),
      endDate: campaignData.endTime ? new Date(Number(campaignData.endTime) * 1000) : new Date(),
      deadline: campaignData.deadline ? Number(campaignData.deadline) : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // Default to 30 days from now
      minContribution: parseFloat(formatEther(campaignData.minContribution || 0)),
      backersCount: Number(campaignData.backersCount || campaignData.totalDonors || 0),
      isActive: Boolean(campaignData.isActive),
      isApproved: Boolean(campaignData.isApproved),
      totalDonors: Number(campaignData.totalDonors || campaignData.backersCount || 0),
      isFundsTransferred: Boolean(campaignData.isFundsTransferred || false)
    };

    console.log('Formatted campaign data:', formattedCampaign);
    return formattedCampaign;
  } catch (error) {
    console.error("Error fetching campaign:", error);
    throw error;
  }
};

// Function to get campaigns by creator
const getCampaignsByCreator = async (creatorAddress, provider) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDLOOM_ABI, provider);
    const campaignCount = await contract.campaignIdCounter();
    const campaigns = [];

    for (let i = 1; i <= campaignCount; i++) {
      try {
        const campaign = await contract.campaigns(i);
        if (campaign.creator.toLowerCase() === creatorAddress.toLowerCase()) {
          campaigns.push({
            id: i.toString(),
            ...campaign,
            creator: campaign.creator,
            charity: campaign.charity,
            targetAmount: parseFloat(ethers.formatEther(campaign.targetAmount)),
            amountRaised: parseFloat(ethers.formatEther(campaign.amountRaised || 0)),
            deadline: new Date(Number(campaign.deadline) * 1000),
            isActive: campaign.isActive,
            // Add other campaign fields as needed
          });
        }
      } catch (error) {
        console.error(`Error fetching campaign ${i}:`, error);
        // Continue with next campaign if there's an error with this one
        continue;
      }
    }

    return campaigns;
  } catch (error) {
    console.error('Error in getCampaignsByCreator:', error);
    throw error;
  }
};

// Function to get all campaigns
const getCampaigns = async (provider) => {
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

// Function to withdraw funds from a campaign
const withdrawFunds = async (campaignId, signer) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
    const tx = await contract.withdraw(campaignId);
    await tx.wait();
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw new Error(error.message || 'Failed to withdraw funds');
  }
};

// Export all functions
export { 
  getCampaign, 
  getCampaigns, 
  getCampaignsByCreator,
  withdrawFunds 
};
