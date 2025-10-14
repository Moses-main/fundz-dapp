import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Target, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { getEthPrice } from "../utils/priceFeed";
import Footer from "../components/landing/Footer";

import { useUnifiedWallet } from "../context/UnifiedWalletContext";

const CampaignsPage = ({ campaigns = [], loading = false, onRefresh = () => {} }) => {
  const { ethProvider: provider, isEthConnected } = useUnifiedWallet();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ethPrice, setEthPrice] = useState(2000); // Default to $2000 if fetch fails
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  const navigate = useNavigate();

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

    if (isEthConnected) {
      fetchEthPrice();
      // Set up interval to refresh price every 5 minutes
      const priceInterval = setInterval(fetchEthPrice, 5 * 60 * 1000);
      return () => clearInterval(priceInterval);
    }
  }, [provider, isEthConnected]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatEthAmount = (usdAmount) => {
    const ethAmount = usdAmount / ethPrice;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(ethAmount);
  };

  const handleViewCampaign = (campaign) => {
    navigate(
      `/campaigns/${campaign.id}`,
      {
        state: { campaign },
      }
    );
  };

  const filteredCampaigns = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return [];

    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const now = new Date();
      const endDate = new Date(campaign.deadline * 1000);
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      switch (filter) {
        case 'trending':
          return matchesSearch && (campaign.isTrending || campaign.totalDonors > 10);
        case 'ending-soon':
          return matchesSearch && daysLeft <= 7;
        case 'new':
          return matchesSearch && (campaign.isNew || daysLeft > 30);
        default:
          return matchesSearch;
      }
    });
  }, [campaigns, searchQuery, filter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isEthConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Wallet Not Connected</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Please connect your wallet to view campaigns.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-gray-50  dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Amazing Campaigns
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Support innovative projects and be part of something bigger. Every
            contribution makes a difference.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              All Campaigns
            </button>
            <button
              onClick={() => setFilter("trending")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "trending"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setFilter("ending-soon")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "ending-soon"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Ending Soon
            </button>
            <button
              onClick={() => setFilter("new")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "new"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              New & Noteworthy
            </button>
          </div>
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleViewCampaign(campaign)}
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <img
                    src={
                      campaign.image ||
                      (() => {
                        // Map specific titles to their corresponding images
                        const title = campaign.title.toLowerCase();
                        if (title.includes("daughters"))
                          return "/save-daughters.jpg";
                        if (
                          title.includes("hope") ||
                          title.includes("orphanage")
                        )
                          return "/give-hope.jpg";
                        if (title.includes("tree") || title.includes("plant"))
                          return "/plant-trees.jpg";
                        // Default fallback
                        return "/save-daughters.jpg";
                      })()
                    }
                    alt={campaign.title}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    onError={(e) => {
                      // Fallback to first image if the specified one fails to load
                      e.target.src = "/save-daughters.jpg";
                    }}
                    style={{
                      minHeight: "100%",
                      minWidth: "100%",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">
                          {campaign.creator?.charAt(0) || "?"}
                        </span>
                      </div>
                      <span className="text-white text-sm font-medium">
                        {campaign.creator || "Anonymous"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {campaign.category || "General"}
                    </span>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                        <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                        <span>{formatAmount(campaign.goal)} USDC</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Target className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                        <span>≈ {isLoadingPrice ? '...' : formatEthAmount(campaign.goal)} ETH</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  <div className="mt-auto">
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Raised: {formatAmount(campaign.raised)} USDC
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (campaign.raised / campaign.goal) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Goal: {formatAmount(campaign.goal)} USDC</span>
                        <span>≈ {isLoadingPrice ? '...' : formatEthAmount(campaign.raised)} / {isLoadingPrice ? '...' : formatEthAmount(campaign.goal)} ETH</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-1" />
                        {campaign.backers || 0} backers
                      </div>

                      <motion.div key={campaign.id}>
                        {/* ...campaign card layout */}
                        <button
                          onClick={() => handleViewCampaign(campaign)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          View Campaign
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {campaigns.length === 0 ? 'No campaigns have been created yet' : 'No campaigns match your search'}
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {campaigns.length === 0 
                ? 'Be the first to create a campaign!' 
                : 'Try adjusting your search or filter criteria'}
            </p>
            {campaigns.length === 0 && (
              <button
                onClick={onRefresh}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CampaignsPage;
