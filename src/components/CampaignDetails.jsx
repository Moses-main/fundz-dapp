import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  User,
  Target,
  Users,
  Share2,
  Copy,
  Check,
  Globe,
  Calendar,
  DollarSign,
  ArrowUpRight,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { getCampaign, getCampaigns } from "../lib/campaignService";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import { getEthPrice } from "../utils/priceFeed";
import PaymentModal from "./PaymentModal";
import { useUnifiedWallet } from "../context/UnifiedWalletContext";
import ConnectButton from "./ConnectButton";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isConnected, 
    account, 
    provider, 
    signer 
  } = useUnifiedWallet();

  const campaignFromState = location.state?.campaign;
  const [campaign, setCampaign] = useState(campaignFromState || null);
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [ethPrice, setEthPrice] = useState(2000);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Copy campaign link to clipboard
  const copyCampaignLink = () => {
    const campaignUrl = `${window.location.origin}/campaigns/${id}`;
    navigator.clipboard.writeText(campaignUrl);
    setIsLinkCopied(true);
    toast.success('Campaign link copied to clipboard!');
    setShowShareOptions(false);
    
    // Reset the copied state after 3 seconds
    setTimeout(() => {
      setIsLinkCopied(false);
    }, 3000);
  };

  // Share campaign via Web Share API if available
  const handleShare = async () => {
    const campaignUrl = `${window.location.origin}/campaigns/${id}`;
    const shareData = {
      title: `Support ${campaign?.title || 'this campaign'}`,
      text: `Check out this campaign on FundLoom: ${campaign?.description?.substring(0, 100)}...`,
      url: campaignUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyCampaignLink();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        // Fallback to copy if sharing fails
        copyCampaignLink();
      }
    }
  };

  // Format campaign data from blockchain
  const formatCampaignData = (campaignData, id) => ({
    id: id,
    title: campaignData.name || `Campaign #${id}`,
    description: campaignData.description || "No description provided",
    image: campaignData.image || "/placeholder-campaign.jpg",
    owner: campaignData.owner || "0x0000000000000000000000000000000000000000",
    raised: campaignData.raised ? ethers.utils.formatEther(campaignData.raised) : "0",
    goal: campaignData.goal ? ethers.utils.formatEther(campaignData.goal) : "0",
    deadline: new Date(parseInt(campaignData.deadline) * 1000).toISOString(),
    category: campaignData.category || "General",
    backers: parseInt(campaignData.backers) || 0,
    isActive: campaignData.isActive !== undefined ? campaignData.isActive : true,
  });

  // Fetch campaign data
  const fetchCampaign = async (id, fromState = false) => {
    if (fromState) return;
    
    try {
      setLoading(true);
      setError("");
      
      if (provider) {
        const campaignData = await getCampaign(id, provider);
        setCampaign(formatCampaignData(campaignData, id));
      } else {
        throw new Error("No provider available");
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign details. Please ensure you're connected to the network and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        setIsLoadingPrice(true);
        if (provider) {
          const price = await getEthPrice(provider);
          setEthPrice(price);
        }
      } catch (error) {
        console.error("Error fetching ETH price:", error);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchEthPrice();
    const priceInterval = setInterval(fetchEthPrice, 5 * 60 * 1000);
    return () => clearInterval(priceInterval);
  }, [provider]);

  // Fetch campaign data on mount
  useEffect(() => {
    if (campaignFromState) {
      setCampaign(campaignFromState);
    }
    fetchCampaign(id);
  }, [id, provider]);

  const handleDonate = (campaign) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    setSelectedCampaign(campaign);
    setIsPaymentModalOpen(true);
  };

  const isOwner = campaign?.owner?.toLowerCase() === account?.toLowerCase();

  const calculateTimeLeft = (deadline) => {
    if (!deadline) return "0 days";
    const difference = new Date(deadline) - new Date();
    if (difference <= 0) return "Ended";
    return `${Math.ceil(difference / (1000 * 60 * 60 * 24))} days left`;
  };

  const shareCampaign = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Check out this campaign: ${campaign.title}`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Campaign</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Campaign not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Browse Campaigns
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.min(100, (parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100);
  const timeLeft = calculateTimeLeft(campaign.deadline);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {isPaymentModalOpen && selectedCampaign && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          campaign={selectedCampaign}
          provider={provider}
          signer={signer}
          account={account}
          ethPrice={ethPrice}
        />
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Campaigns
        </button>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Campaign details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign image */}
            <div className="relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 aspect-video">
              <img
                src={campaign.image || "/placeholder-campaign.jpg"}
                alt={campaign.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-campaign.jpg";
                }}
              />
            </div>

            {/* Campaign title and description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
                <div className="relative">
                  <div className="relative">
                    <button
                      onClick={() => setShowShareOptions(!showShareOptions)}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors"
                      aria-label="Share campaign"
                      aria-expanded={showShareOptions}
                      aria-haspopup="true"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                    
                    {/* Share options dropdown */}
                    <AnimatePresence>
                      {showShareOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="share-dropdown absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                          role="menu"
                        >
                          <div className="py-1">
                            <button
                              onClick={handleShare}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                            >
                              <Share2 className="mr-3 h-5 w-5 text-gray-400" />
                              Share via...
                            </button>
                            <button
                              onClick={copyCampaignLink}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                            >
                              {isLinkCopied ? (
                                <Check className="mr-3 h-5 w-5 text-green-500" />
                              ) : (
                                <LinkIcon className="mr-3 h-5 w-5 text-gray-400" />
                              )}
                              {isLinkCopied ? 'Link Copied!' : 'Copy Link'}
                            </button>
                          </div>
                          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                            Share this campaign with others
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Share options dropdown */}
                  <AnimatePresence>
                    {showShareOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                      >
                        <div className="py-1">
                          <button
                            onClick={shareCampaign}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Share2 className="mr-3 h-5 w-5 text-gray-400" />
                            Share via...
                          </button>
                          <button
                            onClick={copyCampaignLink}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {isLinkCopied ? (
                              <Check className="mr-3 h-5 w-5 text-green-500" />
                            ) : (
                              <LinkIcon className="mr-3 h-5 w-5 text-gray-400" />
                            )}
                            {isLinkCopied ? 'Link Copied!' : 'Copy Link'}
                          </button>
                        </div>
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                          Share this campaign with others
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">{campaign.description}</p>
              
              {/* Campaign stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold">${parseFloat(campaign.raised).toLocaleString()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Raised of ${parseFloat(campaign.goal).toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{campaign.backers}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Backers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{timeLeft}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-6">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">
                  {progress.toFixed(1)}% funded
                </div>
              </div>
            </div>

            {/* Campaign details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Campaign Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Creator</div>
                    <div className="flex items-center">
                      <span className="font-mono">{`${campaign.owner.substring(0, 6)}...${campaign.owner.substring(38)}`}</span>
                      <button 
                        onClick={() => handleCopyAddress(campaign.owner)}
                        className="ml-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Copy address"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</div>
                    <div className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded">
                      {campaign.category}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
                    <div>{new Date(campaign.deadline).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <div className="inline-flex items-center">
                      <span className={`h-2 w-2 rounded-full mr-2 ${campaign.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {campaign.isActive ? 'Active' : 'Ended'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Donation card */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Support this campaign</h3>
              
              {/* Donation amount input */}
              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter amount (ETH)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Ξ</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    min="0"
                    step="0.01"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="0.1"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      ≈ ${ethPrice ? (parseFloat(contributionAmount || 0) * ethPrice).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  ${ethPrice} per ETH
                </p>
              </div>
              
              {/* Donate button */}
              <button
                onClick={() => handleDonate(campaign)}
                disabled={!isConnected || loading}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  !isConnected
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isConnected ? 'Contribute Now' : 'Connect Wallet to Donate'}
              </button>
              
              {/* Connect wallet prompt */}
              {!isConnected && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Connect your wallet to support this campaign
                  </p>
                  <ConnectButton className="w-full justify-center" />
                </div>
              )}
              
              {/* Campaign owner actions */}
              {isOwner && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3">Campaign Owner</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/campaigns/${id}/edit`)}
                      className="w-full px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-md transition-colors"
                    >
                      Edit Campaign
                    </button>
                    <button
                      onClick={() => {}}
                      disabled={!isConnected || parseFloat(campaign.raised) === 0}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        parseFloat(campaign.raised) === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Withdraw Funds
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
