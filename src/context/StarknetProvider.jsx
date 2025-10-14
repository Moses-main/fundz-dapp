import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Provider, Contract, constants } from 'starknet';

export const StarknetContext = createContext({});

export const StarknetProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize provider - use Sepolia testnet
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const provider = new Provider({
          sequencer: {
            network: constants.NetworkName.SN_SEPOLIA
          }
        });
        setProvider(provider);
        
        // Check if wallet is already connected
        const { connect } = await import('@argent/get-starknet');
        const starknet = connect();
        
        if (starknet && starknet.isConnected) {
          await handleConnectedStarknet(starknet);
        }
      } catch (error) {
        console.error('Error initializing StarkNet provider:', error);
        setError('Failed to initialize StarkNet provider');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProvider();
  }, []);

  const handleConnectedStarknet = async (starknet) => {
    try {
      await starknet.enable();
      setAccount(starknet.account);
      setIsConnected(true);
      
      // Initialize contract with the connected account
      if (starknet.account) {
        const contractAddress = process.env.REACT_APP_STARKNET_CONTRACT_ADDRESS;
        if (!contractAddress) {
          throw new Error('StarkNet contract address not configured');
        }
        
        const response = await fetch(process.env.REACT_APP_STARKNET_CONTRACT_ABI_URL);
        const abi = await response.json();
        
        const contract = new Contract(
          abi,
          contractAddress,
          starknet.account
        );
        setContract(contract);
      }
    } catch (error) {
      console.error('Error connecting to StarkNet wallet:', error);
      setError('Failed to connect to wallet');
      throw error;
    }
  };

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { connect } = await import('@argent/get-starknet');
      const starknet = await connect({
        modalMode: 'alwaysShow',
        modalTheme: 'light',
        dappName: 'FundLoom'
      });
      
      if (!starknet) {
        throw new Error('No StarkNet wallet found');
      }
      
      await handleConnectedStarknet(starknet);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      const { disconnect } = await import('@argent/get-starknet');
      await disconnect();
      setAccount(null);
      setContract(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError('Failed to disconnect wallet');
      throw error;
    }
  }, []);

  // Add event listeners for account changes
  useEffect(() => {
    const handleAccountsChanged = async () => {
      if (isConnected) {
        const { connect } = await import('@argent/get-starknet');
        const starknet = connect();
        if (starknet) {
          await handleConnectedStarknet(starknet);
        }
      }
    };

    window.addEventListener('starknet', handleAccountsChanged);
    return () => window.removeEventListener('starknet', handleAccountsChanged);
  }, [isConnected]);

  return (
    <StarknetContext.Provider 
      value={{ 
        provider, 
        account, 
        contract, 
        connect, 
        disconnect, 
        isConnected,
        error,
        isLoading
      }}
    >
      {children}
    </StarknetContext.Provider>
  );
};

export const useStarknet = () => {
  const context = useContext(StarknetContext);
  if (context === undefined) {
    throw new Error('useStarknet must be used within a StarknetProvider');
  }
  return context;
};
