import React, { useState } from 'react';
import { ethers } from 'ethers';
import { makeProvider, makeSigner, getContract } from '../lib/ethereum';
import { CONTRACT_ADDRESS, USDC_ADDRESS, USDC_ABI, FUNDLOOM_ABI } from '../lib/contracts';
import { Loader2, X, ExternalLink, Check, AlertCircle, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

// Supported currencies
const SUPPORTED_CURRENCIES = [
  { id: 'ETH', name: 'Ethereum', type: 'crypto', icon: 'ETH' },
  { id: 'USDT', name: 'Tether', type: 'crypto', icon: 'USDT' },
];

const PaymentModal = ({ isOpen, onClose, campaign, onSuccess }) => {
  // Form state
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(SUPPORTED_CURRENCIES[0]);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  // Initialize contracts
  const initContracts = async (signer) => {
    const fundLoom = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
    const usdc = getContract(USDC_ADDRESS, USDC_ABI, signer);
    return { fundLoom, usdc };
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      const provider = await makeProvider();
      if (!provider) {
        toast.error('Please install MetaMask to continue');
        return null;
      }

      const signer = await makeSigner(provider);
      const address = await signer.getAddress();
      setWalletAddress(address);
      setWalletProvider(provider);
      return { provider, signer };
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
      toast.error('Failed to connect wallet');
      return null;
    }
  };

  // Process ETH payment
  const processEthPayment = async (signer, amount) => {
    try {
      const { fundLoom } = await initContracts(signer);
      const tx = await fundLoom.donate(campaign.id, {
        value: ethers.utils.parseEther(amount.toString())
      });
      setTxHash(tx.hash);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('ETH Payment Error:', error);
      throw new Error(error.message || 'Failed to process ETH payment');
    }
  };

  // Process USDT payment
  const processUsdtPayment = async (signer, amount) => {
    try {
      setIsApproving(true);
      const { fundLoom, usdc } = await initContracts(signer);
      
      // Convert amount to USDC decimals (6)
      const usdcAmount = ethers.utils.parseUnits(amount.toString(), 6);
      
      // Approve USDT spending
      const approveTx = await usdc.approve(CONTRACT_ADDRESS, usdcAmount);
      await approveTx.wait();
      
      // Contribute with USDT
      const contributeTx = await fundLoom.donateERC20(
        campaign.id,
        USDC_ADDRESS,
        usdcAmount
      );
      
      setTxHash(contributeTx.hash);
      await contributeTx.wait();
      return true;
    } catch (error) {
      console.error('USDT Payment Error:', error);
      throw new Error(error.message || 'Failed to process USDT payment');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setError(null);
      setPaymentStatus('processing');
      setIsProcessing(true);

      // Connect wallet if not already connected
      const wallet = walletAddress ? { signer: await makeSigner(walletProvider) } : await connectWallet();
      if (!wallet) {
        setIsProcessing(false);
        return;
      }

      let success = false;
      if (selectedCurrency.id === 'ETH') {
        success = await processEthPayment(wallet.signer, amount);
      } else if (selectedCurrency.id === 'USDT') {
        success = await processUsdtPayment(wallet.signer, amount);
      }

      if (success) {
        setPaymentStatus('success');
        toast.success('Contribution successful!');
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          await onSuccess();
        }
        
        // Close modal after 2 seconds
        setTimeout(() => onClose(true), 2000);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      setError(error.message || 'Payment failed');
      setPaymentStatus('error');
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Loading/Processing state
  if (paymentStatus === 'processing' || isApproving) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isApproving ? 'Approving...' : 'Processing Payment...'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {isApproving 
                ? 'Please approve the transaction in your wallet'
                : 'Waiting for transaction confirmation...'}
            </p>
            {txHash && (
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                View on Etherscan <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (paymentStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your contribution to {campaign?.title}.
            </p>
            {txHash && (
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                View on Etherscan <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => onClose(true)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Contribute to Campaign
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount ({selectedCurrency.id})
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-3 pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={isProcessing}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="h-full px-4 border-l border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg flex items-center justify-center focus:outline-none"
                  disabled={isProcessing}
                >
                  {selectedCurrency.id}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                {isCurrencyDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <button
                        key={currency.id}
                        type="button"
                        onClick={() => {
                          setSelectedCurrency(currency);
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        {currency.name} ({currency.id})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing || !amount || amount <= 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Processing...
              </>
            ) : (
              `Contribute ${amount ? amount + ' ' + selectedCurrency.id : ''}`
            )}
          </button>

          {walletAddress && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
