import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

const UnifiedWalletContext = createContext({});

export const UnifiedWalletProvider = ({ children }) => {
  // Wallet state
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Connection states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect to Ethereum wallet
  const connectWallet = useCallback(async (walletType) => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('No Ethereum provider found. Please install a wallet like MetaMask.');
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      
      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(signer);
      setIsConnected(true);
      
      // Set up event listeners for account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // Disconnected
          disconnectWallet();
        } else {
          // Account changed
          setAccount(accounts[0]);
          const signer = web3Provider.getSigner();
          setSigner(signer);
        }
      };

      // Handle chain changes
      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    // Clean up Ethereum listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
    
    setAccount('');
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Check if wallet is connected on page load
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        // Check Ethereum wallet connection
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await web3Provider.listAccounts();
          
          if (accounts.length > 0) {
            const signer = web3Provider.getSigner();
            const address = await signer.getAddress();
            
            setAccount(address);
            setProvider(web3Provider);
            setSigner(signer);
            setIsConnected(true);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };
    
    checkIfWalletIsConnected();
  }, []);


  // Check if wallet is connected
  const isAnyConnected = isConnected;

  // Get the connected account
  const getPrimaryAccount = useCallback(() => {
    if (account) return { network: walletType, address: account };
    return null;
  }, [account]);

  // Get signer
  const getSigner = useCallback(() => {
    return signer;
  }, [signer]);

  // Get provider
  const getProvider = useCallback(() => {
    return provider;
  }, [provider]);

  const value = useMemo(() => ({
    account,
    provider,
    signer,
    isConnected,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  }), [account, provider, signer, isConnected, loading, error, connectWallet, disconnectWallet]);

  return (
    <UnifiedWalletContext.Provider value={value}>
      {children}
    </UnifiedWalletContext.Provider>
  );
};

export const useUnifiedWallet = () => {
  const context = useContext(UnifiedWalletContext);
  if (context === undefined) {
    throw new Error('useUnifiedWallet must be used within a UnifiedWalletProvider');
  }
  return context;
};

// For backward compatibility
export const useWallet = useUnifiedWallet;

export default UnifiedWalletContext;
