import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getContract } from "../lib/ethereum";
import { CONTRACT_ADDRESS, FUNDLOOM_ABI } from "../lib/contracts";
import { ethers } from "ethers";
import { ArrowLeft } from "lucide-react";

export default function CampaignForm({ signer, account }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    charity: "", // Will default to the connected account if empty
    target: "0.1",
    duration: "7", // Default to 7 days
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!signer) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      const targetInWei = ethers.parseEther(String(formData.target));
      const durationInSeconds = BigInt(
        Number(formData.duration) * 24 * 60 * 60
      ); // Convert days to seconds
      const charityAddress = formData.charity || account; // Use provided address or default to connected account

      const tx = await contract.createCampaign(
        formData.name,
        charityAddress,
        targetInWei,
        durationInSeconds
      );

      await tx.wait();

      // Redirect to campaigns page after successful creation
      navigate("/campaigns", {
        state: {
          success: true,
          message: "Campaign created successfully!",
        },
      });
    } catch (err) {
      console.error("Error creating campaign:", err);
      setError(err.message || "Failed to create campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Campaigns
        </button>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create a New Campaign
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fill in the details below to create your campaign and start
              raising funds.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="E.g., Save the Children Education Fund"
                required
              />
            </div>

            <div>
              <label
                htmlFor="charity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Charity Address (leave empty to use your address)
              </label>
              <input
                type="text"
                id="charity"
                name="charity"
                value={formData.charity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="0x... (leave empty to use your connected wallet)"
              />
              {!formData.charity && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Will use your connected address:{" "}
                  <span className="font-mono text-xs">{account}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="target"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Funding Goal (ETH) *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="target"
                    name="target"
                    min="0.01"
                    step="0.01"
                    value={formData.target}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.10"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                      ETH
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Campaign Duration (days) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  min="1"
                  max="365"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
