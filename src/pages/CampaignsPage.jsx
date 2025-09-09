import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Target, Users } from "lucide-react";
// In CampaignsPage.js
import { useNavigate } from "react-router-dom";

const CampaignsPage = ({ campaigns, onCampaignSelect }) => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  // const handleViewCampaign = (campaign) => {
  //   navigate(`/campaigns/${campaign.id}`, { state: { provider } });
  // };

  const handleViewCampaign = (campaign) => {
    navigate(
      `/campaigns/
${campaign.id}
`,
      {
        state: { campaign },
      }
    );
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "trending") {
      return matchesSearch && campaign.raised / campaign.goal >= 0.5;
    } else if (filter === "ending-soon") {
      return matchesSearch && campaign.daysLeft < 7;
    } else if (filter === "new") {
      return matchesSearch && campaign.isNew;
    }
    return matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              All Campaigns
            </button>
            <button
              onClick={() => setFilter("trending")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "trending"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => setFilter("ending-soon")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "ending-soon"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              ⏰ Ending Soon
            </button>
            <button
              onClick={() => setFilter("new")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "new"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              🆕 New & Noteworthy
            </button>
          </div>
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      campaign.image ||
                      "https://via.placeholder.com/400x300?text=Campaign+Image"
                    }
                    alt={campaign.title}
                    className="w-full h-full object-cover"
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
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {campaign.daysLeft} days left
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
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Raised: {formatCurrency(campaign.raised)}</span>
                        <span>
                          {Math.min(
                            100,
                            Math.round((campaign.raised / campaign.goal) * 100)
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (campaign.raised / campaign.goal) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Goal: {formatCurrency(campaign.goal)}
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
                      {/* <Link
                        to={`/campaigns/${campaign.id}`}
                        onClick={() => onCampaignSelect?.(campaign)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        View Campaign
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link> */}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No campaigns found
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search or filter to find what you're looking for."
                : "There are currently no campaigns matching your criteria."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
