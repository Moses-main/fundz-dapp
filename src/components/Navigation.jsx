import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  Home,
  Compass,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import ConnectButton from "./ConnectButton";
import { useUnifiedWallet } from "../context/UnifiedWalletContext";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isConnected, account } = useUnifiedWallet();
  const { isAdmin } = useAuth();
  const isMobile = window.innerWidth < 768;

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Campaigns", path: "/campaigns", icon: Compass },
    ...(isConnected
      ? [
          { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          ...(isAdmin ? [{ name: "Admin", path: "/admin", icon: Shield }] : []),
        ]
      : []),
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".mobile-menu-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-sm z-40">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                Fundloom
              </Link>
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      isActive(item.path)
                        ? "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <ConnectButton
                  onConnect={() => {
                    alert("Connected");
                  }}
                  onDisconnect={() => {
                    alert("Account Disconnected");
                  }}
                  // account={ethAccount}
                  // provider={ethProvider}
                />
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween" }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setIsOpen(false)}
            />
            <div className="mobile-menu-container fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      Fundloom
                    </span>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-md text-base font-medium ${
                        isActive(item.path)
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    to="/create-campaign"
                    className="flex items-center px-4 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 mb-4"
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Create Campaign
                  </Link>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Toggle theme"
                      >
                        {theme === "dark" ? (
                          <Sun className="h-5 w-5" />
                        ) : (
                          <Moon className="h-5 w-5" />
                        )}
                      </button>
                      <ConnectButton />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
