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
  const [starknetProvider, setStarknetProvider] = useState(null);
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

  // Initialize providers and check for existing connections
  useEffect(() => {
    // Check for existing Ethereum connection
    const checkEthConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setEthProvider(provider);
        
        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          setEthAccount(accounts[0]);
          setEthSigner(signer);
          setIsEthConnected(true);
        }
      }
    };

    // Initialize Starknet provider
    const initStarknetProvider = async () => {
      try {
        const provider = new Provider({
          sequencer: {
            network: constants.NetworkName.SN_SEPOLIA
          }
        });
        setStarknetProvider(provider);
        
        // Check for existing Starknet connection
        const { connect } = await import('@argent/get-starknet');
        const starknet = await connect();
        if (starknet?.isConnected) {
          setStarknetAccount(starknet.account);
          setIsStarknetConnected(true);
          
          // Initialize contract if needed
          if (starknet.account) {
            const contractAddress = process.env.REACT_APP_STARKNET_CONTRACT_ADDRESS;
            if (contractAddress) {
              const response = await fetch(process.env.REACT_APP_STARKNET_CONTRACT_ABI_URL);
              const abi = await response.json();
              const contract = new Contract(abi, contractAddress, starknet.account);
              setStarknetContract(contract);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing StarkNet provider:', err);
        setError(prev => ({ ...prev, starknet: 'Failed to initialize StarkNet provider' }));
      }
    };

    checkEthConnection();
    initStarknetProvider();
    
    // Set up event listeners for wallet changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Disconnected
        disconnectWallet('ethereum');
      } else if (ethAccount !== accounts[0]) {
        // Account changed
        setEthAccount(accounts[0]);
      }
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, [ethAccount]);

  // Connect to Ethereum wallet
  const connectEth = useCallback(async () => {
    if (!window.ethereum) {
      setError(prev => ({ ...prev, eth: 'Please install MetaMask to connect Ethereum wallet' }));
      return null;
    }

    try {
      setLoading(prev => ({ ...prev, eth: true }));
      setError(prev => ({ ...prev, eth: null }));
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setEthAccount(accounts[0]);
      setEthProvider(provider);
      setEthSigner(signer);
      setIsEthConnected(true);
      
      return { provider, signer, account: accounts[0] };
    } catch (err) {
      console.error('Error connecting Ethereum wallet:', err);
      setError(prev => ({ ...prev, eth: err.message || 'Failed to connect Ethereum wallet' }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, eth: false }));
    }
  }, []);

  // Connect to Starknet wallet
  const connectStarknet = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, starknet: true }));
      setError(prev => ({ ...prev, starknet: null }));
      
      const { connect } = await import('@argent/get-starknet');
      const starknet = await connect({
        modalMode: 'alwaysShow',
        modalTheme: 'light',
        dappName: 'FundLoom'
      });
      
      if (!starknet) {
        throw new Error('No StarkNet wallet found');
      }
      
      await starknet.enable();
      setStarknetAccount(starknet.account);
      setIsStarknetConnected(true);
      
      // Initialize contract if needed
      if (starknet.account) {
        const contractAddress = process.env.REACT_APP_STARKNET_CONTRACT_ADDRESS;
        if (contractAddress) {
          const response = await fetch(process.env.REACT_APP_STARKNET_CONTRACT_ABI_URL);
          const abi = await response.json();
          const contract = new Contract(abi, contractAddress, starknet.account);
          setStarknetContract(contract);
        }
      }
      
      return starknet;
    } catch (err) {
      console.error('Error connecting StarkNet wallet:', err);
      setError(prev => ({ ...prev, starknet: err.message || 'Failed to connect StarkNet wallet' }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, starknet: false }));
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback((walletType) => {
    if (walletType === 'ethereum') {
      setEthAccount('');
      setEthProvider(null);
      setEthSigner(null);
      setIsEthConnected(false);
    } else if (walletType === 'starknet') {
      setStarknetAccount(null);
      setStarknetContract(null);
      setIsStarknetConnected(false);
    }
  }, []);

  // Handle Ethereum account changes
  const handleEthAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnectWallet('ethereum');
    } else if (accounts[0] !== ethAccount) {
      setEthAccount(accounts[0]);
    }
  }, [disconnectWallet, ethAccount]);

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
        
        // Starknet
        starknetAccount,
        starknetProvider,
        starknetContract,
        isStarknetConnected,
        connectStarknet,
        
        // Common
        disconnectWallet,
        loading,
        error
      }}
    >
      {children}
    </UnifiedWalletContext.Provider>
  );
};

export const useUnifiedWallet = () => {
  const context = useContext(UnifiedWalletContext);
  if (!context) {
    throw new Error('useUnifiedWallet must be used within a UnifiedWalletProvider');
  }
  return context;
};

export default UnifiedWalletContext;
