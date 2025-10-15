import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Provider, Contract, constants } from 'starknet';

const UnifiedWalletContext = createContext({});

export const UnifiedWalletProvider = ({ children }) => {
  // Ethereum wallet state
  const [ethAccount, setEthAccount] = useState('');
  const [ethProvider, setEthProvider] = useState(null);
  const [ethSigner, setEthSigner] = useState(null);
  const [isEthConnected, setIsEthConnected] = useState(false);
  
  // Starknet wallet state
  const [starknetAccount, setStarknetAccount] = useState(null);
  const [starknetProvider] = useState(
    () => new Provider({ sequencer: { network: constants.NetworkName.SN_SEPOLIA } })
  );
  const [starknetContract, setStarknetContract] = useState(null);
  const [isStarknetConnected, setIsStarknetConnected] = useState(false);
  
  // Connection states
  const [loading, setLoading] = useState({
    eth: false,
    starknet: false
  });
  const [error, setError] = useState({
    eth: null,
    starknet: null
  });

  // Initialize Ethereum provider - No automatic connection
  useEffect(() => {
    if (!window.ethereum) {
      console.warn('No Ethereum provider found. Please install MetaMask.');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    setEthProvider(provider);
    
    // Check if already connected
    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          setEthAccount(accounts[0]);
          setEthSigner(signer);
          setIsEthConnected(true);
        }
      } catch (err) {
        console.error('Error checking Ethereum connection:', err);
      }
    };
    
    checkConnection();
    
    // Handle account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Disconnected
        setEthAccount('');
        setEthSigner(null);
        setIsEthConnected(false);
      } else {
        // Account changed
        setEthAccount(accounts[0]);
        // Update signer for the new account
        provider.getSigner().then(signer => {
          setEthSigner(signer);
        });
      }
    };
    
    // Handle chain changes
    const handleChainChanged = () => {
      window.location.reload();
    };
    
    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isEthConnected]);

  // Initialize Starknet contract when account is connected
  const initStarknetContract = useCallback(async (account) => {
    if (!account) return;
    
    try {
      const contractAddress = process.env.REACT_APP_STARKNET_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.warn('No StarkNet contract address provided');
        return;
      }
      
      const response = await fetch(process.env.REACT_APP_STARKNET_CONTRACT_ABI_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch contract ABI');
      }
      
      const abi = await response.json();
      const contract = new Contract(abi, contractAddress, account);
      setStarknetContract(contract);
      
    } catch (err) {
      console.error('Error initializing StarkNet contract:', err);
      setError(prev => ({ ...prev, starknet: 'Failed to initialize contract' }));
    }
  }, []);
  
  // Connect to Ethereum wallet
  const connectEth = useCallback(async () => {
    if (!window.ethereum) {
      setError(prev => ({ ...prev, eth: 'Please install MetaMask to connect Ethereum wallet' }));
      throw new Error('MetaMask not installed');
    }

    try {
      setLoading(prev => ({ ...prev, eth: true }));
      setError(prev => ({ ...prev, eth: null }));
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setEthAccount(address);
      setEthProvider(provider);
      setEthSigner(signer);
      setIsEthConnected(true);
      
      return { address, provider, signer };
      
    } catch (err) {
      console.error('Error connecting Ethereum wallet:', err);
      setError(prev => ({ ...prev, eth: err.message || 'Failed to connect Ethereum wallet' }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, eth: false }));
    }
  }, []);
  
  // Disconnect Ethereum wallet
  const disconnectEth = useCallback(() => {
    setEthAccount('');
    setEthSigner(null);
    setIsEthConnected(false);
    setError(prev => ({ ...prev, eth: null }));
  }, []);
  
  // Connect to Starknet wallet
  const connectStarknet = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, starknet: true }));
      setError(prev => ({ ...prev, starknet: null }));
      
      const { connect } = await import('@argent/get-starknet');
      const starknet = await connect({
        modalMode: 'neverAsk',
        dappName: 'FundLoom'
      });
      
      if (!starknet) {
        throw new Error('No StarkNet wallet found. Please install Argent X or Braavos wallet.');
      }
      
      // Explicitly request connection
      await starknet.enable();
      
      if (!starknet.isConnected) {
        throw new Error('Failed to connect to StarkNet wallet');
      }
      
      setStarknetAccount(starknet.account);
      setIsStarknetConnected(true);
      localStorage.setItem('starknetConnected', 'true');
      
      // Initialize contract
      await initStarknetContract(starknet.account);
      
      return { account: starknet.account, provider: starknet.provider };
      
    } catch (err) {
      console.error('Error connecting StarkNet wallet:', err);
      setError(prev => ({ 
        ...prev, 
        starknet: err.message || 'Failed to connect StarkNet wallet' 
      }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, starknet: false }));
    }
  }, [initStarknetContract]);
  
  // Disconnect Starknet wallet
  const disconnectStarknet = useCallback(() => {
    setStarknetAccount(null);
    setIsStarknetConnected(false);
    setStarknetContract(null);
    localStorage.removeItem('starknetConnected');
    setError(prev => ({ ...prev, starknet: null }));
  }, []);
  
  // Check for existing Starknet connection on mount
  useEffect(() => {
    const checkStarknetConnection = async () => {
      const isStarknetConnected = localStorage.getItem('starknetConnected') === 'true';
      if (!isStarknetConnected) return;
      
      try {
        const { connect } = await import('@argent/get-starknet');
        const starknet = await connect({ showList: false });
        
        if (starknet?.isConnected) {
          setStarknetAccount(starknet.account);
          setIsStarknetConnected(true);
          await initStarknetContract(starknet.account);
        } else {
          localStorage.removeItem('starknetConnected');
        }
      } catch (err) {
        console.error('Error checking StarkNet connection:', err);
        localStorage.removeItem('starknetConnected');
      }
    };
    
    checkStarknetConnection();
  }, [initStarknetContract]);

  // Handle Ethereum account changes
  const handleEthAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnectEth();
    } else if (accounts[0] !== ethAccount) {
      setEthAccount(accounts[0]);
    }
  }, [disconnectEth, ethAccount]);

  // Handle Starknet account changes
  const handleStarknetAccountsChanged = useCallback(async () => {
    if (isStarknetConnected) {
      const { connect } = await import('@argent/get-starknet');
      const starknet = connect();
      if (starknet) {
        await starknet.enable();
        setStarknetAccount(starknet.account);
      }
    }
  }, [isStarknetConnected]);

  // Set up event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleEthAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
      
      // Check if already connected
      const checkEthConnection = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setEthProvider(provider);
          setEthSigner(signer);
          setEthAccount(accounts[0]);
          setIsEthConnected(true);
        }
      };
      
      checkEthConnection();
    }

    // Starknet event listener
    window.addEventListener('starknet', handleStarknetAccountsChanged);

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleEthAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
      window.removeEventListener('starknet', handleStarknetAccountsChanged);
    };
  }, [handleEthAccountsChanged, handleStarknetAccountsChanged]);

  return (
    <UnifiedWalletContext.Provider
      value={{
        // Ethereum
        ethAccount,
        ethProvider,
        ethSigner,
        isEthConnected,
        connectEth,
        disconnectEth,
        
        // Starknet
        starknetAccount,
        starknetProvider,
        starknetContract,
        isStarknetConnected,
        connectStarknet,
        disconnectStarknet,
        
        // General
        loading,
        error,
        disconnectAll: () => {
          disconnectEth();
          disconnectStarknet();
        }
      }}
    >
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

export default UnifiedWalletContext;
