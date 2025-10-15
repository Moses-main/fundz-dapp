import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useUnifiedWallet } from "../context/UnifiedWalletContext";

export default function ConnectButton() {
  const { theme } = useTheme();
  const { account, isConnected, connectWallet, disconnectWallet, loading } =
    useUnifiedWallet();
  const [showDisconnect, setShowDisconnect] = useState(false);

  // Toggle disconnect dropdown
  const toggleDisconnect = () => setShowDisconnect(!showDisconnect);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDisconnect) setShowDisconnect(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDisconnect]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDisconnect(false);
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(38)}`;
  };

  return (
    <div className="relative">
      {isConnected && account ? (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDisconnect();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 rounded-lg text-sm font-medium transition-colors"
            aria-label="Connected wallet"
          >
            <span>{formatAddress(account)}</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </button>

          {showDisconnect && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDisconnect();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          // disabled={isConnecting}
          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
          aria-label="Connect wallet"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connecting...
            </span>
          ) : (
            "Connect Wallet"
          )}
        </button>
      )}
    </div>
  );
}
