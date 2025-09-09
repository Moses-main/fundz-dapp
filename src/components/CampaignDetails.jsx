import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Target, DollarSign, Users, Share2, Copy, Twitter, Linkedin } from 'lucide-react';
import { getCampaign, getCampaigns } from '../lib/campaignService';
import { formatEther, parseEther } from 'ethers';
import { toast } from 'react-hot-toast';

const CampaignDetails = ({ account, signer }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('ETH');
  const [isContributing, setIsContributing] = useState(false);

  const currencies = [
    { value: 'ETH', label: 'ETH' },
    { value: 'USDC', label: 'USDC' },
    { value: 'NGN', label: 'NGN' },
    { value: 'USD', label: 'USD' },
  ];

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const campaignData = await getCampaign(id);
      setCampaign(campaignData);
      
      // Fetch related campaigns (for now, just get the first 3)
      const campaigns = await getCampaigns();
      setRelatedCampaigns(campaigns.slice(0, 3));
      
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError('Failed to load campaign details');
      toast.error('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsContributing(true);
      // Mock transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would call the contract's contribute function here
      // await contract.contribute(id, { value: parseEther(amount) });
      
      toast.success('Contribution successful! Thank you for your support!');
      setAmount('');
      
      // Refresh campaign data
      await fetchCampaign();
      
    } catch (err) {
      console.error('Error contributing:', err);
      toast.error(err.message || 'Failed to process contribution');
    } finally {
      setIsContributing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const shareOnTwitter = () => {
    const text = `Check out "${campaign?.title}" on Fundloom! ${window.location.href}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const calculateTimeLeft = (deadline) => {
    if (!deadline) return '0 days';
    const difference = new Date(deadline * 1000) - new Date();
    return difference > 0 
      ? `${Math.ceil(difference / (1000 * 60 * 60 * 24))} days left`
      : 'Ended';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-500 text-lg mb-4">{error || 'Campaign not found'}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const progress = (campaign.amountRaised / campaign.goal) * 100;
  const timeLeft = calculateTimeLeft(campaign.deadline);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Back button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Campaigns
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {campaign.category || 'General'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {timeLeft}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{campaign.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>By {campaign.creator?.slice(0, 8)}...{campaign.creator?.slice(-4)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(campaign.createdAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={shareOnTwitter}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Copy link"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="lg:w-2/3">
              {/* Campaign Image */}
              <div className="rounded-xl overflow-hidden mb-8 bg-gray-200 dark:bg-gray-700 aspect-[16/9] flex items-center justify-center">
                {campaign.image ? (
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
              </div>

              {/* Campaign Description */}
              <div className="prose dark:prose-invert max-w-none mb-12">
                <h2 className="text-2xl font-bold mb-4">About this campaign</h2>
                <div className="prose dark:prose-invert">
                  {campaign.description || 'No description provided.'}
                </div>
              </div>

              {/* Share Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-12">
                <h3 className="text-lg font-medium mb-4">Share this campaign</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={shareOnTwitter}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-300 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={shareOnLinkedIn}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-300 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <Copy className="h-5 w-5" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky on desktop */}
            <div className="lg:w-1/3">
              <div className="sticky top-6 space-y-6">
                {/* Funding Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Raised
                        </span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {formatEther(campaign.amountRaised)} ETH
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{Math.round(progress)}% of goal</span>
                        <span>{formatEther(campaign.goal)} ETH</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {campaign.backers || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Backers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {timeLeft.split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {timeLeft.includes('left') ? 'Days Left' : 'Status'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {campaign.minimumContribution ? formatEther(campaign.minimumContribution) : '0'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Min. Contribution</div>
                      </div>
                    </div>

                    {/* Contribution Form */}
                    <form onSubmit={handleContribute} className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Enter amount
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            min={formatEther(campaign.minimumContribution || '0')}
                            step="0.000000000000000001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full pr-16 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
                            placeholder="0.00"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center">
                            <select
                              className="h-full py-0 pl-2 pr-8 border-transparent bg-transparent text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-r-lg"
                              value={selectedCurrency}
                              onChange={(e) => setSelectedCurrency(e.target.value)}
                            >
                              {currencies.map((currency) => (
                                <option key={currency.value} value={currency.value}>
                                  {currency.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Minimum: {formatEther(campaign.minimumContribution || '0')} ETH
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isContributing}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors ${
                          isContributing ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isContributing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          'Contribute Now'
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Campaign Creator */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-medium mb-4">Created by</h3>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {campaign.creator?.slice(0, 8)}...{campaign.creator?.slice(-4)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Campaign Creator
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Campaigns */}
      {relatedCampaigns.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Related Campaigns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCampaigns.map((relatedCampaign) => (
                  <motion.div
                    key={relatedCampaign.id}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/campaigns/${relatedCampaign.id}`)}
                  >
                    <div className="h-40 bg-gray-200 dark:bg-gray-700">
                      {relatedCampaign.image && (
                        <img
                          src={relatedCampaign.image}
                          alt={relatedCampaign.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1 line-clamp-1">{relatedCampaign.title}</h3>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span>{relatedCampaign.category || 'General'}</span>
                        <span>{calculateTimeLeft(relatedCampaign.deadline)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mb-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (relatedCampaign.amountRaised / relatedCampaign.goal) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>{formatEther(relatedCampaign.amountRaised || '0')} ETH</span>
                        <span>{Math.round((relatedCampaign.amountRaised / relatedCampaign.goal) * 100)}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;
//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
//             gap: '12px',
//             marginBottom: '16px'
//           }}>
//             <div>
//               <div style={{ fontWeight: '500', color: '#555', fontSize: '0.9em' }}>Status</div>
//               <div style={{
//                 color: campaign.isActive ? '#4CAF50' : '#f44336',
//                 fontWeight: '500',
//                 fontSize: '0.9em'
//               }}>
//                 {campaign.isActive ? 'Active' : 'Inactive'}
//               </div>
//             </div>
//             <div>
