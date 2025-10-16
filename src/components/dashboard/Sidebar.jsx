import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  HandCoins, 
  Settings, 
  Menu, 
  X,
  Home,
  PlusCircle,
  Shield
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = true; // In a real app, this would come from your auth context
  
  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Campaigns', path: '/dashboard/campaigns', icon: <FolderKanban size={20} /> },
    { name: 'Contributions', path: '/dashboard/contributions', icon: <HandCoins size={20} /> },
    // Admin only items
    ...(isAdmin ? [
      { 
        name: 'Admin Dashboard', 
        path: '/dashboard/admin', 
        icon: <Shield size={20} />,
        adminOnly: true
      },
    ] : []),
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:relative md:translate-x-0 z-30 transition-transform duration-300 ease-in-out
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} 
      w-64 border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} 
      flex flex-col h-screen`}>
      
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
            F
          </div>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Fundloom
          </h1>
        </div>
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-lg mx-2 transition-colors ${
              location.pathname === item.path
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={toggleSidebar}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`p-4 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
        <Link
          to="/create-campaign"
          className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          <span className="font-medium">Create Campaign</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
