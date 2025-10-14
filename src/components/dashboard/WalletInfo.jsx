import React from 'react';
import { useUnifiedWallet } from '../../context/UnifiedWalletContext';
import { Copy, ExternalLink, Wallet, Zap, Coins } from 'lucide-react';

export const WalletInfo = () => {
  const {
    ethAccount,
    isEthConnected,
    starknetAccount,
    isStarknetConnected,
    disconnectWallet
  } = useUnifiedWallet();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address, isStarknet = false) => {
    if (!address) return '#';
    if (isStarknet) {
      return `https://sepolia.starkscan.co/contract/${address}`;
    }
    return `https://sepolia.etherscan.io/address/${address}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Connected Wallets</h3>
      
      {/* Ethereum Wallet Card */}
      <div className={`p-4 rounded-lg border ${isEthConnected ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${isEthConnected ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Coins className={`w-5 h-5 ${isEthConnected ? 'text-green-600 dark:text-green-300' : 'text-gray-400'}`} />
            </div>
            <div>
              <h4 className="font-medium">Ethereum Wallet</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEthConnected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          {isEthConnected && (
            <button
              onClick={() => disconnectWallet('ethereum')}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Disconnect
            </button>
          )}
        </div>
        
        {isEthConnected && ethAccount && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">{formatAddress(ethAccount)}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(ethAccount)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={getExplorerUrl(ethAccount, false)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="View on explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Starknet Wallet Card */}
      <div className={`p-4 rounded-lg border ${isStarknetConnected ? 'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${isStarknetConnected ? 'bg-purple-100 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Zap className={`w-5 h-5 ${isStarknetConnected ? 'text-purple-600 dark:text-purple-300' : 'text-gray-400'}`} />
            </div>
            <div>
              <h4 className="font-medium">Starknet Wallet</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isStarknetConnected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          {isStarknetConnected ? (
            <button
              onClick={() => disconnectWallet('starknet')}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => connectStarknet()}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Connect
            </button>
          )}
        </div>
        
        {isStarknetConnected && starknetAccount?.address && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">{formatAddress(starknetAccount.address)}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(starknetAccount.address)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={getExplorerUrl(starknetAccount.address, true)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="View on explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletInfo;
