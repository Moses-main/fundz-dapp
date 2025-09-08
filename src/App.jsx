import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ConnectButton from "./components/ConnectButton";
import CampaignForm from "./components/CampaignForm";
import DonateETH from "./components/DonateETH";
import DonateUSDC from "./components/DonateUSDC";
import CampaignDetails from "./components/CampaignDetails";
import CampaignsList from "./components/CampaignsList";
import WithdrawFunds from "./components/WithdrawFunds";
import TransferFunds from "./components/TransferFunds";
import LandingPage from "./pages/LandingPage";
import { makeProvider, makeSigner } from "./lib/ethereum";

export default function App() {
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
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                account={account} 
                onConnect={connectWallet} 
              />
            } 
          />
          <Route 
            path="/app/*" 
            element={
              <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="flex justify-between items-center mb-8">
                    <Link to="/" className="text-3xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                      FundLoom
                    </Link>
                    <div className="flex items-center space-x-4">
                      <Link 
                        to="/app/campaigns" 
                        className="text-gray-700 hover:text-indigo-600 font-medium"
                      >
                        My Campaigns
                      </Link>
                      <ConnectButton 
                        account={account} 
                        onConnect={connectWallet} 
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Routes>
                    <Route 
                      path="campaigns" 
                      element={
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="md:col-span-2 space-y-6">
                            <CampaignsList 
                              campaigns={campaigns} 
                              onSelectCampaign={setSelectedCampaign} 
                              isLoading={isLoading} 
                            />
                          </div>
                          <div className="space-y-6">
                            <CampaignForm onSubmit={handleCreateCampaign} />
                          </div>
                        </div>
                      } 
                    />
                    <Route 
                      path="campaigns/:id" 
                      element={
                        selectedCampaign ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                              <CampaignDetails 
                                campaign={selectedCampaign} 
                                onBack={() => window.history.back()}
                              />
                            </div>
                            <div className="space-y-6">
                              <DonateETH 
                                campaignId={selectedCampaign.id} 
                                onDonate={handleDonate} 
                              />
                              <DonateUSDC 
                                campaignId={selectedCampaign.id} 
                                onDonate={handleDonate} 
                              />
                              <WithdrawFunds 
                                campaignId={selectedCampaign.id} 
                                onWithdraw={handleWithdraw} 
                              />
                              <TransferFunds 
                                campaignId={selectedCampaign.id}
                                campaigns={campaigns.filter(c => c.id !== selectedCampaign.id)}
                                onTransfer={handleTransfer}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>Campaign not found</div>
                        )
                      } 
                    />
                  </Routes>
                </div>
              </div>
            } 
          />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
