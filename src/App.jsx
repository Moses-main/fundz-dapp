import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider as ThemeProviderContext } from "./context/ThemeContext";
import { UnifiedWalletProvider, useUnifiedWallet } from "./context/UnifiedWalletContext";
import Navigation from "./components/Navigation";
import CampaignForm from "./components/CampaignForm";
import CampaignDetails from "./components/CampaignDetails";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CampaignsContainer from "./components/CampaignsContainer";
import UserDashboard from "./pages/dashboard/UserDashboard";
import StarknetProvider from "./context/StarknetProvider";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isEthConnected, isStarknetConnected } = useUnifiedWallet();
  const location = useLocation();

  // if (!isEthConnected || !isStarknetConnected) {
  //   return <Navigate to="/" state={{ from: location }} replace />;
  // }

  return children;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Public routes */}
          <Route path="/campaigns" element={<CampaignsContainer />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          
          {/* Protected routes */}
          <Route path="/create-campaign" element={
            <ProtectedRoute>
              <CampaignForm />
            </ProtectedRoute>
          } />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="my-campaigns" element={<UserDashboard />} />
            <Route path="my-donations" element={<UserDashboard />} />
            <Route path="settings" element={<UserDashboard />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProviderContext>
        {/* <UnifiedWalletProvider> */}
        <StarknetProvider>
          <AppContent />
        </StarknetProvider>
        {/* </UnifiedWalletProvider> */}
      </ThemeProviderContext>
    </Router>
  );
};

export default App;
