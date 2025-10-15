import React, { useState } from 'react';
import { getContract } from '../lib/ethereum';
import { CONTRACT_ADDRESS, FUNDLOOM_ABI } from '../lib/contracts';
import { toast } from 'react-hot-toast';
import { Loader2, Power } from 'lucide-react';

export default function CampaignActivation({ campaignId, isActive, onStatusChange, signer, isAdmin = false }) {
  const [isLoading, setIsLoading] = useState(false);

  const toggleCampaignStatus = async () => {
    if (!signer) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!isAdmin) {
      toast.error('Only admin can update campaign status');
      return;
    }

    try {
      setIsLoading(true);
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      
      let tx;
      if (isActive) {
        tx = await contract.deactivateCampaign(campaignId);
      } else {
        tx = await contract.activateCampaign(campaignId);
      }
      
      await tx.wait();
      onStatusChange(!isActive);
      toast.success(`Campaign ${isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      toast.error(error.message || 'Failed to update campaign status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleCampaignStatus}
      disabled={isLoading || !isAdmin}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
          : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
      } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!isAdmin ? 'Only admin can update campaign status' : isActive ? 'Deactivate campaign' : 'Activate campaign'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Power className="h-4 w-4" />
      )}
      <span>{isActive ? 'Deactivate' : 'Activate'}</span>
    </button>
  );
}
