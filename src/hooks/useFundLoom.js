import { useCallback, useState, useEffect } from 'react';
import { Contract, uint256, cairo } from 'starknet';

export const useFundLoom = (contract) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [userDonations, setUserDonations] = useState({});

  // Fetch all campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const count = await contract.get_campaigns_count();
      const campaigns = [];
      
      for (let i = 0; i < parseInt(count); i++) {
        const campaign = await contract.get_campaign(i);
        campaigns.push({
          id: i,
          name: campaign.name,
          creator: campaign.creator,
          charity: campaign.charity,
          targetAmount: uint256.uint256ToBN(campaign.target_amount).toString(),
          amountRaised: uint256.uint256ToBN(campaign.amount_raised).toString(),
          deadline: new Date(parseInt(campaign.deadline) * 1000),
          isActive: campaign.is_active,
          isClaimed: campaign.is_claimed
        });
      }
      
      setCampaigns(campaigns);
      return campaigns;
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to fetch campaigns');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Create a new campaign
  const createCampaign = useCallback(async (name, charity, targetAmount, durationInSeconds) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Convert target amount to Uint256
      const targetAmountUint256 = uint256.bnToUint256(targetAmount);
      
      // Execute the transaction
      const tx = await contract.create_campaign(
        name,
        charity,
        targetAmountUint256,
        durationInSeconds
      );
      
      // Wait for transaction to be accepted on StarkNet
      await contract.provider.waitForTransaction(tx.transaction_hash);
      
      // Refresh campaigns list
      await fetchCampaigns();
      
      return tx;
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Donate to a campaign
  const donate = useCallback(async (campaignId, amount, tokenAddress = null) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      let tx;
      const amountUint256 = uint256.bnToUint256(amount);
      
      if (tokenAddress) {
        // ERC20 donation
        tx = await contract.donate_erc20(
          uint256.bnToUint256(campaignId),
          tokenAddress,
          uint256.bnToUint256(amount)
        );
      } else {
        // Native token donation
        tx = await contract.donate_native_token(
          uint256.bnToUint256(campaignId),
          uint256.bnToUint256(amount)
        );
      }
      
      await contract.provider.waitForTransaction(tx.transaction_hash);
      return tx;
    } catch (err) {
      console.error('Error donating to campaign:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Get campaign details
  const getCampaign = useCallback(async (campaignId) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const campaign = await contract.get_campaign(uint256.bnToUint256(campaignId));
      return {
        id: campaignId,
        name: campaign.name,
        charity: campaign.charity,
        targetAmount: uint256.uint256ToBN(campaign.target_amount),
        raisedAmount: uint256.uint256ToBN(campaign.raised_amount),
        deadline: Number(campaign.deadline),
        isActive: campaign.is_active,
        creator: campaign.creator
      };
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Get all campaign IDs
  const getAllCampaigns = useCallback(async () => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const ids = await contract.get_all_campaign_ids();
      return ids.map(id => uint256.uint256ToBN(id));
    } catch (err) {
      console.error('Error fetching campaign IDs:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Fetch user's donations
  const fetchUserDonations = useCallback(async (userAddress) => {
    if (!contract || !userAddress) return;
    
    try {
      setLoading(true);
      const count = await contract.get_campaigns_count();
      const donations = {};
      
      for (let i = 0; i < parseInt(count); i++) {
        const donation = await contract.get_donor_info(i, userAddress);
        if (donation.amount > 0) {
          donations[i] = {
            amount: uint256.uint256ToBN(donation.amount).toString(),
            timestamp: new Date(parseInt(donation.timestamp) * 1000)
          };
        }
      }
      
      setUserDonations(donations);
      return donations;
    } catch (err) {
      console.error('Error fetching user donations:', err);
      setError('Failed to fetch user donations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Claim funds for a campaign
  const claimFunds = useCallback(async (campaignId) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.claim_funds(uint256.bnToUint256(campaignId));
      await contract.provider.waitForTransaction(tx.transaction_hash);
      
      // Refresh campaigns list
      await fetchCampaigns();
      
      return tx;
    } catch (err) {
      console.error('Error claiming funds:', err);
      setError('Failed to claim funds');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, fetchCampaigns]);

  // Fetch data on mount
  useEffect(() => {
    if (contract) {
      fetchCampaigns();
    }
  }, [contract, fetchCampaigns]);

  return {
    createCampaign,
    donate,
    claimFunds,
    fetchCampaigns,
    fetchUserDonations,
    campaigns,
    userDonations,
    loading,
    error,
    getAllCampaigns,
  };
};
