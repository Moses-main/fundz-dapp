import React, { useEffect } from "react";
import { 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider as ThemeProviderContext } from "./context/ThemeContext";
import { UnifiedWalletProvider, useUnifiedWallet } from "./context/UnifiedWalletContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
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
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import { Toaster } from "react-hot-toast";

// Protected route component that shows content but handles wallet connection prompts
const ProtectedRoute = ({ children, requireWallet = false, requireAdmin = false }) => {
  const { isConnected } = useUnifiedWallet();
  
  // If wallet is required but not connected, show a message
  if (requireWallet && !isConnected) {
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

  // Check for admin access
  const { isAdmin } = useAuth();
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  return children;
};

const AppContent = () => {
  const { isAdmin } = useAuth();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      <AnimatePresence mode="wait">
        <main className="w-full">
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
              <Route 
                path="contributions" 
                element={
                  <ProtectedRoute requireWallet={true}>
                    <Contributions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute requireWallet={true}>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Admin Dashboard - Separate from main dashboard layout */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireWallet={true} requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
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
        <AuthProvider>
          <UnifiedWalletProvider>
            <AppContent />
          </UnifiedWalletProvider>
        </AuthProvider>
      </ThemeProviderContext>
    </Router>
  );
};

export default App;
