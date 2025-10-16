import React from 'react';
import { useUnifiedWallet } from '../../context/UnifiedWalletContext';
import { Copy, ExternalLink, Coins } from 'lucide-react';

const WalletInfo = () => {
  const { account, isConnected, disconnectWallet } = useUnifiedWallet();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address) => {
    if (!address) return '#';
    return `https://sepolia.etherscan.io/address/${address}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Wallet</h3>
      
      <div className={`p-4 rounded-lg border ${isConnected ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Coins className={`w-5 h-5 ${isConnected ? 'text-green-600 dark:text-green-300' : 'text-gray-400'}`} />
            </div>
            <div>
              <h4 className="font-medium">Ethereum Wallet</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={disconnectWallet}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Disconnect
            </button>
          )}
        </div>
        
        {isConnected && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono text-gray-700 dark:text-gray-200">
                {formatAddress(account)}
              </span>
              <button
                onClick={() => copyToClipboard(account)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={getExplorerUrl(account)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="View on explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletInfo;
