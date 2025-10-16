import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getContract } from "../lib/ethereum";
import { CONTRACT_ADDRESS, FUNDLOOM_ABI } from "../lib/contracts";
import CampaignListFilters from "./CampaignListFilters";
import CampaignActivation from "./CampaignActivation";
import { toast } from "react-hot-toast";

const CampaignCard = ({ campaign, onSelect, isAdmin, signer, onStatusChange }) => {
  const deadlineDate = new Date(Number(campaign.deadline) * 1000);
  const isActive = campaign.isActive && deadlineDate > new Date();
  const progress = Math.min(
    (Number(campaign.raisedAmount) / Number(campaign.targetAmount)) * 100,
    100
  );
  const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
  const isEnded = deadlineDate <= new Date();
  const raised = parseFloat(ethers.utils.formatEther(campaign.raisedAmount));
  const goal = parseFloat(ethers.utils.formatEther(campaign.targetAmount));

  const handleCardClick = (e) => {
    if (e.target.closest('.activation-button') || e.target.closest('.view-details')) return;
    onSelect(campaign.id);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
      onClick={handleCardClick}
    >
      {/* Campaign image placeholder */}
      <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
        <span className="text-white font-bold text-lg">
          {campaign.name?.charAt(0).toUpperCase() || 'C'}
        </span>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
            {campaign.name || `Campaign #${campaign.id}`}
          </h3>
          {isAdmin && (
            <div className="activation-button flex-shrink-0 ml-2">
              <CampaignActivation 
                campaignId={campaign.id} 
                isActive={campaign.isActive} 
                onStatusChange={onStatusChange}
                signer={signer}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 h-10">
          {campaign.description || "No description provided"}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Raised of {goal.toFixed(2)} ETH</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 text-xs">Raised</div>
            <div className="font-medium text-indigo-600 dark:text-indigo-400">
              {raised.toFixed(2)} ETH
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 text-xs">Goal</div>
            <div className="font-medium">
              {goal.toFixed(2)} ETH
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 text-xs">Backers</div>
            <div className="font-medium">{campaign.totalDonors || 0}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              {isEnded ? 'Ended' : 'Ends in'}
            </div>
            <div className="font-medium">
              {isEnded ? 'Completed' : `${daysLeft} days`}
            </div>
          </div>
        </div>
      </div>
      
      <div className={`px-5 py-3 border-t ${
        isActive 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' 
          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center text-sm font-medium ${
            isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${
              isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}></span>
            {isActive ? 'Active' : 'Ended'}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(campaign.id);
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

const CampaignsList = ({ provider, onSelectCampaign, account, signer, isAdmin = false }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState('newest');

  const fetchCampaigns = useCallback(async () => {
    if (!provider) {
      setError("No Ethereum provider available. Please connect your wallet.");
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError("");

      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, provider);
      const campaignIds = await contract.getAllCampaignIds();
      const campaignsList = [];

      for (let id of campaignIds) {
        try {
          const data = await contract.getCampaign(id);
          campaignsList.push({
            id: id.toString(),
            name: data.name,
            description: data.description || "No description provided",
            creator: data.creator,
            targetAmount: data.targetAmount.toString(),
            raisedAmount: data.raisedAmount.toString(),
            deadline: Number(data.deadline),
            isActive: data.isActive,
            totalDonors: data.totalDonors?.toString() || '0',
            isFundsTransferred: data.isFundsTransferred || false,
            createdAt: Number(data.createdAt) || Math.floor(Date.now() / 1000)
          });
        } catch (err) {
          console.error(`Error fetching campaign ${id}:`, err);
        }
      }

      setCampaigns(campaignsList);
      return campaignsList;
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load campaigns. Please try again later.");
      toast.error("Failed to load campaigns");
      return [];
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Apply filters and sorting
  useEffect(() => {
    if (!campaigns.length) return;

    let result = [...campaigns];

    // Apply status filter
    if (filters.status === 'active') {
      result = result.filter(campaign => {
        const deadlineDate = new Date(Number(campaign.deadline) * 1000);
        return campaign.isActive && deadlineDate > new Date();
      });
    } else if (filters.status === 'ended') {
      result = result.filter(campaign => {
        const deadlineDate = new Date(Number(campaign.deadline) * 1000);
        return !campaign.isActive || deadlineDate <= new Date();
      });
    } else if (filters.status === 'successful') {
      result = result.filter(campaign => {
        const target = Number(ethers.formatEther(campaign.targetAmount));
        const raised = Number(ethers.formatEther(campaign.raisedAmount));
        return raised >= target * 0.9;
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm) ||
        campaign.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'ending-soon':
          return a.deadline - b.deadline;
        case 'most-funded': {
          const aRaised = Number(ethers.formatEther(a.raisedAmount));
          const bRaised = Number(ethers.formatEther(b.raisedAmount));
          return bRaised - aRaised;
        }
        case 'most-donors':
          return (parseInt(b.totalDonors) || 0) - (parseInt(a.totalDonors) || 0);
        default:
          return 0;
      }
    });

    setFilteredCampaigns(result);
  }, [campaigns, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        status: 'all',
        category: 'all',
        search: ''
      });
      setSortBy('newest');
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleSortChange = (sortKey) => {
    setSortBy(sortKey);
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    if (!signer) {
      toast.error('Please connect your wallet to update campaign status');
      return;
    }

    try {
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      let tx;
      
      if (newStatus) {
        tx = await contract.activateCampaign(campaignId);
      } else {
        tx = await contract.deactivateCampaign(campaignId);
      }
      
      await tx.wait();
      
      // Update local state
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, isActive: newStatus } 
            : campaign
        )
      );
      
      toast.success(`Campaign ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error(error.reason || error.message || 'Failed to update campaign status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">Loading campaigns...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Campaigns</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
        <button
          onClick={fetchCampaigns}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const displayCampaigns = filteredCampaigns.length > 0 ? filteredCampaigns : campaigns;

  if (displayCampaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No campaigns found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {filters.status !== 'all' || filters.category !== 'all' || filters.search
            ? 'Try adjusting your filters or search criteria.'
            : 'Be the first to create a campaign!'}
        </p>
        <div className="mt-6">
          <button
            onClick={() => handleFilterChange('reset')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CampaignListFilters 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        filters={filters}
        sortBy={sortBy}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onSelect={onSelectCampaign}
            onStatusChange={(newStatus) => {
              setCampaigns(prev => 
                prev.map(c => 
                  c.id === campaign.id 
                    ? { ...c, isActive: newStatus } 
                    : c
                )
              );
            }}
            signer={signer}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
};

// Add responsive grid styles
const styles = `
  @media (min-width: 640px) {
    .campaigns-grid {
      grid-template-columns: repeat(1, 1fr);
    }
  }
  
  @media (min-width: 768px) {
    .campaigns-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .campaigns-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .campaign-card {
    transition: all 0.3s ease;
  }
  
  .campaign-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .progress-bar {
    transition: width 0.6s ease;
  }
  
  .dark .campaign-card {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .dark .campaign-card h3 {
    color: #f3f4f6;
  }
  
  .dark .campaign-card p {
    color: #9ca3af;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default CampaignsList;
