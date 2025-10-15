import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider as ThemeProviderContext } from "./context/ThemeContext";
import { UnifiedWalletProvider, useUnifiedWallet } from "./context/UnifiedWalletContext";
import Navigation from "./components/Navigation";
import ConnectButton from "./components/ConnectButton";
import CampaignForm from "./components/CampaignForm";
import CampaignDetails from "./components/CampaignDetails";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CampaignsContainer from "./components/CampaignsContainer";
import Overview from "./pages/dashboard/Overview";
import MyCampaigns from "./pages/dashboard/MyCampaigns";
import Contributions from "./pages/dashboard/Contributions";
import Settings from "./pages/dashboard/Settings";
import { Toaster } from "react-hot-toast";

// Protected route component that shows content but handles wallet connection prompts
const ProtectedRoute = ({ children, requireWallet = false }) => {
  const { isEthConnected } = useUnifiedWallet();
  
  // If wallet is required but not connected, show a message
  // The actual connection will be handled by the ConnectButton component in the UI
  if (requireWallet && !isEthConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Wallet Not Connected
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please connect your wallet to access this page.
        </p>
        <ConnectButton />
      </div>
    );
  }
  
  return children;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      <AnimatePresence mode="wait">
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/campaigns" element={<CampaignsContainer />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            
            {/* Routes that require wallet connection */}
            <Route 
              path="/create-campaign" 
              element={
                <ProtectedRoute requireWallet={true}>
                  <CampaignForm />
                </ProtectedRoute>
              } 
            />

            {/* Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireWallet={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="campaigns" element={<MyCampaigns />} />
              <Route path="contributions" element={<Contributions />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AnimatePresence>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1F2937',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
          error: {
            duration: 5000,
          },
        }}
      />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProviderContext>
        <UnifiedWalletProvider>
          <AppContent />
        </UnifiedWalletProvider>
      </ThemeProviderContext>
    </Router>
  );
};

export default App;
