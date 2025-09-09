import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Overview from './dashboard/Overview';
import MyCampaigns from './dashboard/MyCampaigns';
import Contributions from './dashboard/Contributions';
import Settings from './dashboard/Settings';

const Dashboard = ({ account, signer }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { pathname } = location;

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Common props to pass to all dashboard pages
  const commonProps = {
    account,
    signer
  };

  return (
    <DashboardLayout 
      isSidebarOpen={isSidebarOpen} 
      toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      currentPath={pathname}
    >
      <Routes>
        <Route 
          path="/" 
          element={<Overview {...commonProps} />} 
        />
        <Route 
          path="campaigns" 
          element={<MyCampaigns {...commonProps} />} 
        />
        <Route 
          path="contributions" 
          element={<Contributions {...commonProps} />} 
        />
        <Route 
          path="settings" 
          element={<Settings {...commonProps} />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
