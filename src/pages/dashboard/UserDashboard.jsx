import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  getCampaignsByCreator,
  withdrawFunds,
} from "../../lib/campaignService";
import { getEthPrice } from "../../utils/priceFeed";
import { useWallet } from "../../context/WalletContext";

const UserDashboard = () => {
  const { account, provider, signer } = useWallet();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalDonors: 0,
  });
  const [ethPrice, setEthPrice] = useState(0);
  const [isWithdrawing, setIsWithdrawing] = useState({});

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Load user's campaigns
  const loadCampaigns = async () => {
    if (!account) {
      setCampaigns([]);
      return;
    }

    setIsLoading(true);
    try {
      const userCampaigns = await getCampaignsByCreator(account, provider);
      setCampaigns(userCampaigns || []);

      // Calculate stats
      const totalRaised = (userCampaigns || []).reduce(
        (sum, c) => sum + parseFloat(c?.raised || 0),
        0
      );
      const activeCampaigns = (userCampaigns || []).filter(
        (c) => c?.status === "active"
      ).length;
      const totalDonors = (userCampaigns || []).reduce(
        (sum, c) => sum + (c?.donorsCount || 0),
        0
      );

      setStats({
        totalRaised,
        totalCampaigns: (userCampaigns || []).length,
        activeCampaigns,
        totalDonors,
      });
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdraw funds
  const handleWithdraw = async (campaignId) => {
    if (!signer) return;

    setIsWithdrawing((prev) => ({ ...prev, [campaignId]: true }));
    try {
      await withdrawFunds(campaignId, signer);
      await loadCampaigns();
    } catch (error) {
      console.error("Withdrawal failed:", error);
    } finally {
      setIsWithdrawing((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  // Load ETH price
  useEffect(() => {
    const loadEthPrice = async () => {
      try {
        const price = await getEthPrice(provider);
        setEthPrice(price);
      } catch (error) {
        console.error("Error loading ETH price:", error);
      }
    };

    loadEthPrice();
    const interval = setInterval(loadEthPrice, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [provider]);

  // Load campaigns when account changes
  useEffect(() => {
    loadCampaigns();
  }, [account]);

  // Chart data
  const campaignData = campaigns.map((campaign) => {
    const title = campaign?.title || "Untitled";
    const raised = parseFloat(campaign?.raised || 0);
    const goal = parseFloat(campaign?.goal || 1); // prevent div by 0

    return {
      name: title.length > 10 ? `${title.substring(0, 10)}...` : title,
      raised,
      goal,
      progress: (raised / goal) * 100,
    };
  });

  const statusData = [
    { name: "Active", value: stats.activeCampaigns, color: "#4F46E5" },
    {
      name: "Completed",
      value: stats.totalCampaigns - stats.activeCampaigns,
      color: "#10B981",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Creator Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and manage your fundraising campaigns
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Raised"
            value={formatCurrency(stats.totalRaised)}
            icon={<DollarSign className="h-6 w-6 text-indigo-600" />}
            trend="+12.5%"
          />
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            trend={stats.activeCampaigns > 0 ? `+${stats.activeCampaigns * 20}%` : "0%"}
          />
          <StatCard
            title="Total Backers"
            value={stats.totalDonors}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            trend={stats.totalDonors > 0 ? `+${Math.min(50, stats.totalDonors * 5)}%` : "0%"}
          />
          <StatCard
            title="ETH Price"
            value={`$${ethPrice.toFixed(2)}`}
            icon={<RefreshCw className="h-6 w-6 text-purple-600" />}
            trend={ethPrice > 0 ? "Live" : "--"}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Campaign Progress
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                    labelFormatter={(label) => `Campaign: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="raised" name="Raised" fill="#4F46E5" />
                  <Bar dataKey="goal" name="Goal" fill="#E5E7EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Campaign Status
            </h3>
            <div className="h-80 flex flex-col items-center justify-center">
              <div className="w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Campaigns"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(
                    (stats.activeCampaigns / (stats.totalCampaigns || 1)) *
                    100
                  ).toFixed(0)}
                  % Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Raised
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <CampaignRow
                      key={campaign.id}
                      campaign={campaign}
                      ethPrice={ethPrice}
                      onWithdraw={handleWithdraw}
                      isWithdrawing={isWithdrawing[campaign.id] || false}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        No campaigns
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get started by creating a new campaign
                      </p>
                      <div className="mt-4">
                        <Link
                          to="/create-campaign"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          New Campaign
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard
const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <div className="flex items-center">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <span className="ml-2 flex items-center text-sm text-green-600 dark:text-green-400">
              <ArrowUpRight className="h-4 w-4" />
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

// CampaignRow
const CampaignRow = ({ campaign, ethPrice, onWithdraw, isWithdrawing }) => {
  const raised = parseFloat(campaign?.raised || 0);
  const goal = parseFloat(campaign?.goal || 1); // prevent NaN/Infinity
  const progress = (raised / goal) * 100;
  const isCompleted = progress >= 100;
  const canWithdraw = isCompleted || campaign?.status === "completed";

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            {campaign?.title?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {campaign?.title || "Untitled"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {campaign?.deadline
                ? new Date(campaign.deadline * 1000).toLocaleDateString()
                : "No deadline"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            campaign?.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {campaign?.status === "active" ? "Active" : "Completed"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white font-medium">
          ${raised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ≈ {ethPrice ? (raised / ethPrice).toFixed(4) : "--"} ETH
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {progress.toFixed(1)}% of ${goal.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <Link
            to={`/campaigns/${campaign?.id}`}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View
          </Link>
          {canWithdraw && (
            <button
              onClick={() => onWithdraw(campaign.id)}
              disabled={isWithdrawing}
              className={`text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 ${
                isWithdrawing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserDashboard;
