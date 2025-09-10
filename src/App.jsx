import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider as ThemeProviderContext } from "./context/ThemeContext";
import { WalletProvider, useWallet } from "./context/WalletContext";
import Navigation from "./components/Navigation";
import CampaignForm from "./components/CampaignForm";
import CampaignDetails from "./components/CampaignDetails";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CampaignsContainer from "./components/CampaignsContainer";
import UserDashboard from "./pages/dashboard/UserDashboard";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isConnected } = useWallet();
  const location = useLocation();

  if (!isConnected) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/campaigns" element={<CampaignsContainer />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          
          <Route
            path="/create-campaign"
            element={
              <ProtectedRoute>
                <CampaignForm />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="/my-campaigns" element={<UserDashboard />} />

          {/* Redirect to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <Router>
    <ThemeProviderContext>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ThemeProviderContext>
  </Router>
);

export default App;
