import React, { useState, useEffect } from "react";
import { useStarknet } from "../context/StarknetProvider";
import { useFundLoom } from "../hooks/useFundLoom";

export const StarknetConnect = () => {
  const {
    account,
    connect,
    disconnect,
    isConnected,
    isLoading,
    error: connectionError,
  } = useStarknet();

  const {
    createCampaign,
    campaigns = [],
    fetchCampaigns,
    claimFunds,
    loading: contractLoading,
    error: contractError,
  } = useFundLoom();

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    durationDays: "7",
  });
  const [activeTab, setActiveTab] = useState("create");
  const [manuallyConnected, setManuallyConnected] = useState(false);

  // Only fetch campaigns after manual connection
  useEffect(() => {
    if (manuallyConnected && isConnected && account) {
      fetchCampaigns().catch(console.error);
    }
  }, [manuallyConnected, isConnected, account, fetchCampaigns]);

  const handleConnect = async () => {
    try {
      await connect();
      setManuallyConnected(true);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();

    if (!isConnected || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const targetAmount = Math.floor(
        parseFloat(formData.targetAmount) * 1e18
      ).toString();
      const durationInSeconds = parseInt(formData.durationDays) * 24 * 60 * 60;

      const tx = await createCampaign(
        formData.name,
        account.address,
        targetAmount,
        durationInSeconds
      );

      console.log("Transaction hash:", tx.transaction_hash);
      alert("Campaign created successfully!");

      // Reset form
      setFormData({
        name: "",
        targetAmount: "",
        durationDays: "7",
      });
    } catch (err) {
      console.error("Error creating campaign:", err);
      alert(`Error: ${err.message || "Failed to create campaign"}`);
    }
  };

  // Show connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to FundLoom</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Connect your wallet to create or manage campaigns
          </p>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-lg font-medium"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {connectionError && (
            <div className="mt-4 text-red-500 text-sm">
              {connectionError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show main interface when connected
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">FundLoom Campaign Manager</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {`${account?.address?.slice(0, 6)}...${account?.address?.slice(-4)}`}
            </span>
            <button
              onClick={disconnect}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-300 dark:border-gray-600 mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "create"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create Campaign
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "view"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("view")}
          >
            View Campaigns
          </button>
        </div>

        {activeTab === "create" ? (
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter campaign name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Amount (ETH)
              </label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.1"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (days)
              </label>
              <select
                name="durationDays"
                value={formData.durationDays}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={contractLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {contractLoading ? "Creating..." : "Create Campaign"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Campaigns</h3>
            {contractLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns
                  .filter((campaign) => campaign.creator === account?.address)
                  .map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Raised: {(campaign.amountRaised / 1e18).toFixed(4)} /{" "}
                        {(campaign.targetAmount / 1e18).toFixed(4)} ETH
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (campaign.amountRaised / campaign.targetAmount) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>
                          Ends:{" "}
                          {new Date(campaign.deadline).toLocaleDateString()}
                        </span>
                        <span>{campaign.isActive ? "Active" : "Ended"}</span>
                      </div>
                      {campaign.isActive &&
                        campaign.amountRaised >= campaign.targetAmount && (
                          <button
                            onClick={() => claimFunds(campaign.id)}
                            disabled={contractLoading}
                            className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-1 px-2 rounded"
                          >
                            Claim Funds
                          </button>
                        )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                You haven't created any campaigns yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarknetConnect;
