import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X, Bell, UserCircle, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = ({ isSidebarOpen, toggleSidebar, currentPath, children }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close dropdowns when route changes
  useEffect(() => {
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  // Mock notifications
  useEffect(() => {
    const mockNotifications = [
      { id: 1, message: 'Your campaign has received a new contribution!', time: '2 hours ago', read: false },
      { id: 2, message: 'Campaign "Save the Whales" is 80% funded!', time: '1 day ago', read: true },
      { id: 3, message: 'Welcome to Fundloom! Start by creating your first campaign.', time: '1 week ago', read: true },
    ];
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get page title based on current route
  const getPageTitle = () => {
    const path = currentPath || location.pathname;
    if (path.includes('campaigns')) return 'My Campaigns';
    if (path.includes('contributions')) return 'My Contributions';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-50 text-gray-900' : 'bg-white text-gray-900'}`}>
      {/* Sidebar - shown on desktop, conditionally shown on mobile */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <Sidebar currentPath={currentPath || location.pathname} />
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex-shrink-0 h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center px-4">
          <div className="flex items-center md:hidden mr-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          <h1 className="text-xl font-semibold flex-1">{getPageTitle()}</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'text-yellow-400' : 'text-gray-500'} hover:bg-gray-100 dark:hover:bg-gray-700`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-full text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-gray-800' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center text-sm rounded-full focus:outline-none"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <UserCircle size={20} />
                </div>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/dashboard/settings/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <Link
                    to="/logout"
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
