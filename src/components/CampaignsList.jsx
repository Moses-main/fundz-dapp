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

  const handleCardClick = (e) => {
    if (e.target.closest('.activation-button')) return;
    onSelect(campaign.id);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {campaign.name || `Campaign #${campaign.id}`}
          </h3>
          <div className="activation-button">
            <CampaignActivation 
              campaignId={campaign.id} 
              isActive={campaign.isActive} 
              onStatusChange={onStatusChange}
              signer={signer}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {campaign.description || "No description provided"}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Raised {ethers.formatEther(campaign.raisedAmount)} ETH</span>
            <span>{progress.toFixed(1)}% of {ethers.formatEther(campaign.targetAmount)} ETH</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
            <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isActive ? 'Active' : 'Ended'}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isEnded ? (
              <span>Ended {deadlineDate.toLocaleDateString()}</span>
            ) : (
              <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
            )}
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{campaign.totalDonors || 0} {campaign.totalDonors === 1 ? 'donor' : 'donors'}</span>
          </div>
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
    const currentProvider = provider || new ethers.InfuraProvider('sepolia');

    try {
      setLoading(true);
      setError("");

      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, currentProvider);
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
            charity: data.charity,
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
    try {
      await fetchCampaigns();
    } catch (err) {
      console.error('Error refreshing campaigns:', err);
      toast.error('Failed to update campaign status');
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
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
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
