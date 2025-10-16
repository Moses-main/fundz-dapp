import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useUnifiedWallet } from "../context/UnifiedWalletContext";
import { ChevronDown, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";

const WALLET_OPTIONS = [
  {
    id: "metamask",
    name: "MetaMask",
    type: "ethereum",
    icon: "/wallets/metamask.svg",
    connector: null,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    type: "ethereum",
    icon: "/wallets/coinbase.svg",
    connector: null,
  }
];

export default function ConnectButton() {
  const { theme } = useTheme();
  const { isConnected, account, connectWallet, disconnectWallet, loading } =
    useUnifiedWallet();
  const { isDarkMode } = useTheme();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const toggleDisconnect = () => setShowDisconnect((prev) => !prev);

  const handleConnect = async (wallet) => {
    try {
      await connectWallet("ethereum");
      setShowWalletOptions(false);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || `Failed to connect ${wallet.name}`);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDisconnect(false);
  };

  const formatAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showWalletOptions &&
        !event.target.closest(".wallet-connect-container")
      ) {
        setShowWalletOptions(false);
      }
      if (showDisconnect && !event.target.closest(".disconnect-container")) {
        setShowDisconnect(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWalletOptions, showDisconnect]);

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium opacity-70 cursor-not-allowed"
      >
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Connecting...</span>
      </button>
    );
  }

  if (isConnected && account) {
    return (
      <div className="relative">
        <button
          onClick={toggleDisconnect}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <span>{formatAddress(account)}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {showDisconnect && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show connect wallet button
  return (
    <div className="relative wallet-connect-container">
      <button
        onClick={() => setShowWalletOptions((prev) => !prev)}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
      >
        <Wallet className="h-5 w-5" />
        <span>Connect Wallet</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            showWalletOptions ? "rotate-180" : ""
          }`}
        />
      </button>

      {showWalletOptions && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Choose Wallet
            </h3>
          </div>

          <div className="py-1">
            {WALLET_OPTIONS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet)}
                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-5 h-5 object-contain"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                  <span>{wallet.name}</span>
                </div>

                {wallet.type === "starknet" && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full">
                    Starknet
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
            By connecting, you agree to our Terms of Service
          </div>
        </div>
      )}
    </div>
  );
}
