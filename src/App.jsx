import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider as ThemeProviderContext } from "./context/ThemeContext";
import Navigation from "./components/Navigation";
import CampaignForm from "./components/CampaignForm";
import CampaignDetails from "./components/CampaignDetails";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CampaignsContainer from "./components/CampaignsContainer";

// Protected route component
const ProtectedRoute = ({ children, account }) => {
  const location = useLocation();

  if (!account) {
    // Redirect to home if not connected
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

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
      // Request account access if needed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use this dApp!');
      }
      
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || "");
        if (!accounts[0]) {
          setSigner(undefined);
          setProvider(undefined);
        } else {
          // Update signer if account changes but stays connected
          provider.getSigner().then(newSigner => {
            setSigner(newSigner);
          });
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      // Load campaigns
      if (loadCampaigns) {
        await loadCampaigns(provider);
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      setError("Failed to connect wallet. Please try again.");
      throw err; // Re-throw to be handled by the caller
    }
  };

  const loadCampaigns = async (provider) => {
    try {
      setIsLoading(true);
      // Implementation of loadCampaigns
      // This would typically interact with your smart contract
      // For now, we'll use dummy data
      setCampaigns([
        {
          id: 1,
          title: "Sample Campaign 1",
          description: "This is a sample campaign",
        },
        {
          id: 2,
          title: "Sample Campaign 2",
          description: "Another sample campaign",
        },
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
    console.log(
      `Donating ${amount} ${isUSDC ? "USDC" : "ETH"} to campaign ${campaignId}`
    );
  };

  const handleWithdraw = async (campaignId, amount) => {
    // Implementation for withdrawing funds
    console.log(`Withdrawing ${amount} from campaign ${campaignId}`);
  };

  const handleTransfer = async (fromCampaignId, toCampaignId, amount) => {
    // Implementation for transferring funds between campaigns
    console.log(
      `Transferring ${amount} from campaign ${fromCampaignId} to ${toCampaignId}`
    );
  };

  return (
    <ThemeProviderContext>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation account={account} connectWallet={connectWallet} />
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={<LandingPage connectWallet={connectWallet} />}
            />
            <Route path="/campaigns" element={<CampaignsContainer />} />
            <Route
              path="/campaigns/:id"
              element={<CampaignDetails account={account} signer={signer} />}
            />
            <Route
              path="/create-campaign"
              element={
                <CampaignForm
                  signer={signer}
                  account={account}
                  onConnect={connectWallet}
                />
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute account={account}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect to home for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </ThemeProviderContext>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
