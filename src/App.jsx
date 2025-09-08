import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider as ThemeProviderContext } from './context/ThemeContext';
import Navigation from './components/Navigation';
import CampaignForm from './components/CampaignForm';
import CampaignDetails from './components/CampaignDetails';
import LandingPage from './pages/LandingPage';
import CampaignsPage from './pages/CampaignsPage';


const App = () => {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      const provider = await makeProvider();
      const signer = await makeSigner(provider);
      const accounts = await provider.listAccounts();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      
      // Listen for account changes
      if (provider.provider?.on) {
        provider.provider.on("accountsChanged", (accounts) => {
          setAccount(accounts[0] || "");
          if (!accounts[0]) {
            setSigner(undefined);
            setProvider(undefined);
          }
        });
        
        provider.provider.on("chainChanged", () => {
          window.location.reload();
        });
      }
      
      // Load campaigns
      await loadCampaigns(provider);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  const loadCampaigns = async (provider) => {
    try {
      setIsLoading(true);
      // Implementation of loadCampaigns
      // This would typically interact with your smart contract
      // For now, we'll use dummy data
      setCampaigns([
        { id: 1, title: "Sample Campaign 1", description: "This is a sample campaign" },
        { id: 2, title: "Sample Campaign 2", description: "Another sample campaign" },
      ]);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading campaigns:", err);
      setError("Failed to load campaigns.");
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async (campaignData) => {
    // Implementation for creating a campaign
    console.log("Creating campaign:", campaignData);
    // After successful creation, reload campaigns
    if (provider) {
      await loadCampaigns(provider);
    }
  };

  const handleDonate = async (campaignId, amount, isUSDC = false) => {
    // Implementation for donating to a campaign
    console.log(`Donating ${amount} ${isUSDC ? 'USDC' : 'ETH'} to campaign ${campaignId}`);
  };

  const handleWithdraw = async (campaignId, amount) => {
    // Implementation for withdrawing funds
    console.log(`Withdrawing ${amount} from campaign ${campaignId}`);
  };

  const handleTransfer = async (fromCampaignId, toCampaignId, amount) => {
    // Implementation for transferring funds between campaigns
    console.log(`Transferring ${amount} from campaign ${fromCampaignId} to ${toCampaignId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation account={account} onConnect={connectWallet} />
      <main className="pt-16"> {/* Add padding to account for fixed header */}
        <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/campaigns"
            element={
              <CampaignsPage
                campaigns={campaigns}
                onCampaignSelect={setSelectedCampaign}
              />
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              selectedCampaign ? (
                <CampaignDetails
                  campaign={selectedCampaign}
                  account={account}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-300">Loading campaign details...</p>
                </div>
              )
            }
          />
          <Route
            path="/create-campaign"
            element={
              <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  Create a New Campaign
                </h1>
                <CampaignForm
                  onSubmit={handleCreateCampaign}
                  loading={isLoading}
                />
              </div>
            }
          />
        </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <ThemeProviderContext>
      <App />
    </ThemeProviderContext>
  </Router>
);

export default AppWrapper;
