import React from 'react';
import { useUnifiedWallet } from '../context/UnifiedWalletContext';
import { Wallet, Zap, ChevronDown } from 'lucide-react';

const WalletButton = () => {
  const {
    ethAccount,
    isEthConnected,
    starknetAccount,
    isStarknetConnected,
    connectEth,
    connectStarknet,
    disconnectWallet
  } = useUnifiedWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async (walletType) => {
    try {
      if (walletType === 'ethereum') {
        await connectEth();
      } else if (walletType === 'starknet') {
        await connectStarknet();
      }
    } catch (error) {
      console.error(`Error connecting ${walletType} wallet:`, error);
    }
  };

  if (!isEthConnected && !isStarknetConnected) {
    return (
      <div className="relative group">
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
          <Wallet className="h-5 w-5" />
          <span>Connect Wallet</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 hidden group-hover:block">
          <button
            onClick={() => handleConnect('ethereum')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Wallet className="h-4 w-4 mr-2 text-blue-500" />
            <span>Connect Ethereum</span>
          </button>
          <button
            onClick={() => handleConnect('starknet')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Zap className="h-4 w-4 mr-2 text-purple-500" />
            <span>Connect Starknet</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {isEthConnected && ethAccount && (
        <div className="relative group">
          <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
            <Wallet className="h-4 w-4 text-blue-500" />
            <span>{formatAddress(ethAccount)}</span>
          </button>
          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 hidden group-hover:block">
            <button
              onClick={() => navigator.clipboard.writeText(ethAccount)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Copy Address
            </button>
            <button
              onClick={() => disconnectWallet('ethereum')}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {isStarknetConnected && starknetAccount?.address && (
        <div className="relative group">
          <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
            <Zap className="h-4 w-4 text-purple-500" />
            <span>{formatAddress(starknetAccount.address)}</span>
          </button>
          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 hidden group-hover:block">
            <button
              onClick={() => navigator.clipboard.writeText(starknetAccount.address)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Copy Address
            </button>
            <button
              onClick={() => disconnectWallet('starknet')}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletButton;
