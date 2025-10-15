import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      console.warn('No Ethereum provider found. Please install MetaMask.');
      setError('Please install MetaMask to connect your wallet');
      return false;
    }

    try {
      setLoading(true);
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
      console.error('Error connecting to wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount('');
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }, []);

  // Check if wallet is connected on page load
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (!window.ethereum) return;
      
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await web3Provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = web3Provider.getSigner();
          const address = await signer.getAddress();
          
          setAccount(address);
          setProvider(web3Provider);
          setSigner(signer);
          setIsConnected(true);
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
    if (account) return { network: 'ethereum', address: account };
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

  return (
    <UnifiedWalletContext.Provider
      value={{
        // Connection state
        isConnected,
        isAnyConnected,
        loading,
        error,
        
        // Wallet info
        account,
        provider,
        signer,
        
        // Methods
        connectWallet: connectWallet,
        disconnectWallet: disconnectWallet,
        getPrimaryAccount,
        getSigner,
        getProvider,
      }}>
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
