import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedWallet } from '../context/UnifiedWalletContext';
import { Wallet, Zap, ChevronDown } from 'lucide-react';
import { useAccount, useConnect } from '@starknet-react/core';
import { button, div } from 'framer-motion/client';

const WalletButton = () => {
  const {
    ethAccount,
    isEthConnected,
    starknetAccount,
    isStarknetConnected,
    connectEth,
    connectStarknet,
    disconnectWallet,
    setIsStarknetConnected,
  } = useUnifiedWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const { address: starknetAddress, isConnected: starknetIsConnected } = useAccount();
  console.log(starknetAddress)
  const { connect, connectors } = useConnect();
  const [starknetDropdownOpen, setStarknetDropdownOpen] = useState(false);

  const handleConnect = async (walletType) => {
    try {
      if (walletType === 'ethereum') {
        await connectEth();
      } else if (walletType === 'starknet') {
        // await connectStarknet();
        setStarknetDropdownOpen(true);
      }
    } catch (error) {
      console.error(`Error connecting ${walletType} wallet:`, error);
    }
  };

  console.log(connectors)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isEthConnected && !starknetIsConnected) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Wallet className="h-5 w-5" />
          <span>Connect Wallet</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => {
                handleConnect('ethereum');
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Wallet className="h-4 w-4 mr-2 text-blue-500" />
              <span>Connect Ethereum</span>
            </button>
            <button
              onClick={() => {
                handleConnect('starknet');
                // setIsDropdownOpen(false);
                setStarknetDropdownOpen(!starknetDropdownOpen);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Zap className="h-4 w-4 mr-2 text-purple-500" />
              <span>Connect Starknet</span>
            </button>
            <div>
          {starknetDropdownOpen && (
            <div className='text-white'>
                {connectors
                // .filter((connector) => connector.id === "argentX" || connector.id === "braavos")
                .map((connector) => {
                  
                  console.log(connector.id)

                  return (
                  <button
                      key={connector.id}
                      onClick={() => {
                          console.log("Trying to connect")
                          connect({ connector });
                          // setDropdownOpen(false);
                          setIsStarknetConnected(true);
                          setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[#ffffff]/10 rounded-lg flex items-center gap-2"
                  >
                      {connector.id === 'braavos' ? (
                          <>
                              <img
                                  // src={"/images/Braavos logo.jpeg"}
                                  src={connector.icon}
                                  alt="Braavos Wallet Logo"
                                  className="w-5 h-5 inline-block mr-2"
                              />
                              Braavos Wallet
                          </>
                      ) : (
                          <>
                              <img
                                  // src="/images/ready logo.png"
                                  src={connector.icon}
                                  alt="Ready Wallet Logo"
                                  className="w-5 h-5 inline-block mr-2"
                              />
                              Ready Wallet
                          </>
                      )}
                  </button>
                )
                })}
              </div>

            )}
          </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {isEthConnected && ethAccount && (
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Wallet className="h-4 w-4 text-blue-500" />
            <span>{formatAddress(ethAccount)}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ethAccount);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Copy Address
              </button>
              <button
                onClick={() => {
                  disconnectWallet('ethereum');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}

      {starknetIsConnected && (
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Zap className="h-4 w-4 text-purple-500" />
            <span>{formatAddress(starknetAddress)}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(starknetAddress);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Copy Address
              </button>
              <button
                onClick={() => {
                  disconnectWallet('starknet');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletButton;
