import { ethers } from "ethers";
import { CONTRACT_ADDRESS, FUNDLOOM_ABI } from "./contracts";

// Function to get a single campaign by ID
export const getCampaign = async (id, provider) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDLOOM_ABI, provider);
    const campaignData = await contract.campaigns(id);
    
    // Convert BigNumber values to strings for easier handling
    return {
      id: id,
      creator: campaignData.creator,
      title: campaignData.title,
      description: campaignData.description,
      imageUrl: campaignData.imageUrl,
      category: campaignData.category,
      goal: ethers.utils.formatEther(campaignData.goal.toString()),
      amountRaised: ethers.utils.formatEther(campaignData.amountRaised.toString()),
      startDate: new Date(campaignData.startTime.toNumber() * 1000).toISOString(),
      endDate: new Date(campaignData.endTime.toNumber() * 1000).toISOString(),
      minContribution: ethers.utils.formatEther(campaignData.minContribution.toString()),
      backersCount: campaignData.backersCount.toNumber(),
      isActive: campaignData.isActive,
      isApproved: campaignData.isApproved
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
};

// Function to get all campaigns
export const getCampaigns = async (provider) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, FUNDLOOM_ABI, provider);
    const campaignCount = await contract.campaignCount();
    const campaigns = [];

    // Fetch all campaigns
    for (let i = 0; i < campaignCount; i++) {
      try {
        const campaign = await getCampaign(i, provider);
        campaigns.push(campaign);
      } catch (err) {
        console.warn(`Error fetching campaign ${i}:`, err);
        // Continue with next campaign if one fails
        continue;
      }
    }

    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};
