import React, { useState } from 'react';
import { makeProvider, makeSigner } from '../lib/ethereum';
import { useTheme } from '../context/ThemeContext';

export default function ConnectButton({ onConnect, account }) {
  const { theme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      if (!window.ethereum) {
        window.open('https://metamask.io/download.html', '_blank');
        throw new Error('MetaMask not installed');
      }
      
      const provider = makeProvider();
      const signer = await makeSigner();
      const addr = signer ? await signer.getAddress() : null;
      onConnect?.(addr);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.message !== 'MetaMask not installed') {
        alert(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(38)}`;
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        account 
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600'
      }`}
      aria-label={account ? 'Connected wallet' : 'Connect wallet'}
    >
      {isConnecting ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </span>
      ) : account ? (
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
          {formatAddress(account)}
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}