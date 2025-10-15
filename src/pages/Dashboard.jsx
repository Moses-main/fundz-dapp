import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart2, 
  Users, 
  Settings, 
  Bell, 
  Menu, 
  X,
  FolderKanban,
  PlusCircle,
  Clock,
  TrendingUp,
  HelpCircle,
  Zap,
  Activity,
  Award,
  DollarSign
} from 'lucide-react';
import WalletInfo from '../components/dashboard/WalletInfo';
import { cn } from '../lib/utils';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('overview');
  const location = useLocation();

  // Update active nav based on URL
  useEffect(() => {
    const path = location.pathname.split('/').pop() || 'overview';
    setActiveNav(path);
  }, [location]);

  const navigation = [
    { name: 'Overview', icon: Home, href: 'overview' },
    { name: 'Campaigns', icon: FolderKanban, href: 'campaigns' },
    { name: 'Analytics', icon: BarChart2, href: 'analytics' },
    { name: 'Contributions', icon: TrendingUp, href: 'contributions' },
    { name: 'Activity', icon: Activity, href: 'activity' },
  ];

  const secondaryNavigation = [
    { name: 'Settings', icon: Settings, href: 'settings' },
    { name: 'Support', icon: HelpCircle, href: 'support' },
  ];

  // Stats for the overview
  const stats = [
    { name: 'Total Raised', value: '$24,567', change: '+12.5%', changeType: 'increase', icon: DollarSign },
    { name: 'Active Campaigns', value: '8', change: '+2', changeType: 'increase', icon: FolderKanban },
    { name: 'Contributions', value: '143', change: '+32', changeType: 'increase', icon: TrendingUp },
    { name: 'Community', value: '1.2k', change: '+180', changeType: 'increase', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar overlay */}
      <div className={cn(
        'lg:hidden fixed inset-0 z-40 bg-gray-900/80 transition-opacity',
        sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      )}>
        <div className="fixed inset-0" onClick={() => setSidebarOpen(false)} />
      </div>

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 bg-white dark:bg-gray-800 shadow-xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FundLoom</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50',
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Secondary Navigation */}
          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
            {secondaryNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all',
                    isActive
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50',
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {localStorage.getItem('walletAddress')?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {localStorage.getItem('walletAddress')?.substring(0, 8)}...
                </p>
                <button className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <span className="sr-only">Open sidebar</span>
                  <Menu className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 flex justify-between">
                <div className="flex-1 flex items-center justify-center lg:justify-start">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                    {activeNav || 'Dashboard'}
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="sr-only">View notifications</span>
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                    </div>
                  </button>
                  
                  <div className="ml-4 flex items-center">
                    <WalletInfo />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Stats */}
            {activeNav === 'overview' && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-full ${stat.changeType === 'increase' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'} flex items-center justify-center`}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              {stat.name}
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {stat.value}
                              </div>
                              <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {stat.change}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Main content area */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <Outlet />
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <PlusCircle className="h-10 w-10 text-white opacity-90" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-white">Create Campaign</h3>
                      <p className="mt-1 text-sm text-indigo-100">Start a new fundraising campaign</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Award className="h-10 w-10 text-white opacity-90" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-white">Earn Rewards</h3>
                      <p className="mt-1 text-sm text-blue-100">Earn tokens by contributing</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-10 w-10 text-white opacity-90" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-white">Invite Friends</h3>
                      <p className="mt-1 text-sm text-emerald-100">Earn 5% of their contributions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} FundLoom. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
