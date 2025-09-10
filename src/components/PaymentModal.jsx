// src/components/PaymentModal.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import EthereumProvider from "@walletconnect/ethereum-provider";
import {
  Loader2,
  X,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
  ArrowRight,
  Twitter,
  Linkedin,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

// Example supported currencies
const SUPPORTED_CURRENCIES = [
  { id: "ETH", name: "Ethereum", type: "crypto", icon: "ETH" },
  { id: "USDT", name: "Tether", type: "crypto", icon: "USDT" },
  { id: "USD", name: "US Dollar", type: "fiat", icon: "USDC" },
];

// helper
const formatAmount = (amount, currency) => {
  if (!amount) return "";
  return currency.type === "fiat" ? parseFloat(amount).toFixed(2) : amount;
};

export default function PaymentModal({ isOpen, onClose, campaign }) {
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(
    SUPPORTED_CURRENCIES[0]
  );
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // Wallet state
  const [walletProvider, setWalletProvider] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  // 🔹 Connect Wallet with WalletConnect v2
  const connectWallet = async () => {
    try {
      setPaymentStatus("connecting");

      const provider = await EthereumProvider.init({
        projectId: "681f29d9f45ef0405f4f019d2e8b6afd", // 👉 get from https://cloud.walletconnect.com
        chains: [1], // Ethereum Mainnet
        optionalChains: [5], // Goerli testnet
        showQrModal: true,
      });

      await provider.enable();

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      setWalletProvider(provider);
      setWalletAddress(address);

      provider.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
      });

      provider.on("disconnect", () => {
        setWalletProvider(null);
        setWalletAddress(null);
      });

      toast.success("Wallet connected!");
      setPaymentStatus("idle");
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError("Failed to connect wallet. Try again.");
      setPaymentStatus("error");
    }
  };

  // 🔹 Handle payments (crypto & fiat simulation)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!amount) {
      setError("Please enter an amount");
      return;
    }
    3;

    try {
      if (selectedCurrency.type === "crypto" && paymentMethod === "wallet") {
        if (!walletProvider) {
          await connectWallet();
          return;
        }

        setPaymentStatus("sending");
        const ethersProvider = new ethers.BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();

        const tx = await signer.sendTransaction({
          to: campaign?.walletAddress,
          value: ethers.parseEther(amount),
        });

        setTxHash(tx.hash);
        await tx.wait();

        setPaymentStatus("success");
        toast.success("Payment processed successfully!");
      } else {
        // Fiat (simulate)
        setPaymentStatus("sending");
        await new Promise((res) => setTimeout(res, 2000));
        setPaymentStatus("success");
        toast.success(
          `Payment of ${formatAmount(amount, selectedCurrency)} ${
            selectedCurrency.id
          } processed successfully!`
        );
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "An error occurred");
      setPaymentStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError(null);
    setPaymentStatus("idle");
    setWalletProvider(null);
    setWalletAddress(null);
    setTxHash(null);
    onClose();
  };

  // Loading state component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
        {getStatusMessage()}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        This may take a few moments...
      </p>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        Payment Failed
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {error || "An error occurred while processing your payment."}
      </p>
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => setPaymentStatus("idle")}
          className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Don't render if not open
  if (!isOpen) return null;

  // Payment success screen
  if (paymentStatus === "success") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your contribution to {campaign?.title}. Your support
              means a lot!
            </p>

            {txHash && (
              <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Transaction Hash:
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(txHash);
                      toast.success("Transaction hash copied to clipboard");
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium flex items-center"
                  >
                    {`${txHash.substring(0, 6)}...${txHash.substring(
                      txHash.length - 4
                    )}`}
                    <Copy className="ml-1 h-3.5 w-3.5" />
                  </button>
                </div>
                <a
                  href={`https://goerli.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View on Etherscan <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Campaign
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const tweetText = `I just contributed to "${campaign?.title}" on @Fundloom! Check it out!`;
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        tweetText
                      )}`,
                      "_blank"
                    );
                  }}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Share on Twitter
                </button>
                <button
                  onClick={() => {
                    const linkedInText = `I just contributed to "${campaign?.title}" on Fundloom!`;
                    window.open(
                      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                        window.location.href
                      )}&title=${encodeURIComponent(
                        "Check out this campaign on Fundloom"
                      )}&summary=${encodeURIComponent(linkedInText)}`,
                      "_blank"
                    );
                  }}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  Share on LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading or error state if needed
  if (
    ["connecting", "approving", "sending", "confirming"].includes(paymentStatus)
  ) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
          <ErrorState />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Contribute to {campaign?.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your support helps make this campaign a success!
          {walletAddress && (
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
              Connected:{" "}
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </span>
          )}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Amount
              </label>
              {/* {gasEstimate && selectedCurrency.type === "crypto" && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Gas: {gasEstimate}
                </span>
              )} */}
            </div>

            <div className="flex rounded-md shadow-sm">
              {/* Currency Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)
                  }
                  className="inline-flex items-center px-4 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {selectedCurrency.icon}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>

                {isCurrencyDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        Cryptocurrency
                      </div>
                      {SUPPORTED_CURRENCIES.filter(
                        (c) => c.type === "crypto"
                      ).map((currency) => (
                        <button
                          key={currency.id}
                          type="button"
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                            selectedCurrency.id === currency.id
                              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span className="mr-2">{currency.icon}</span>
                          {currency.name}
                        </button>
                      ))}

                      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-700">
                        Fiat
                      </div>
                      {SUPPORTED_CURRENCIES.filter(
                        (c) => c.type === "fiat"
                      ).map((currency) => (
                        <button
                          key={currency.id}
                          type="button"
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                            selectedCurrency.id === currency.id
                              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span className="mr-2">{currency.icon}</span>
                          {currency.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`0.00 ${selectedCurrency.id}`}
                  className="block w-full px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                  step={
                    selectedCurrency.type === "fiat"
                      ? "0.01"
                      : "0.000000000000000001"
                  }
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ≈ $0.00 USD
              </span>
              <button
                type="button"
                onClick={() => setAmount("10")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                Use 10 {selectedCurrency.id}
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`p-3 border rounded-lg text-left ${
                  paymentMethod === "wallet"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                disabled={selectedCurrency.type === "fiat"}
              >
                <div className="flex items-center">
                  <div
                    className={`p-1.5 rounded-full mr-2 ${
                      paymentMethod === "wallet"
                        ? "bg-indigo-100 dark:bg-indigo-800/50"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <svg
                      className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedCurrency.type === "crypto"
                        ? "Crypto Wallet"
                        : "Bank Transfer"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedCurrency.type === "crypto"
                        ? "Connect your wallet"
                        : "Direct bank transfer (coming soon)"}
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-3 border rounded-lg text-left ${
                  paymentMethod === "card"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`p-1.5 rounded-full mr-2 ${
                      paymentMethod === "card"
                        ? "bg-indigo-100 dark:bg-indigo-800/50"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <svg
                      className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Credit/Debit Card
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedCurrency.type === "crypto"
                        ? `Buy ${selectedCurrency.id} with card`
                        : `Pay with card (${selectedCurrency.id})`}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {paymentMethod === "card" && (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="expiry"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Expiry
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cvv"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isProcessing ||
              (selectedCurrency.type === "crypto" &&
                paymentMethod === "wallet" &&
                !walletProvider)
            }
            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isProcessing ||
              (selectedCurrency.type === "crypto" &&
                paymentMethod === "wallet" &&
                !walletProvider)
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                {getStatusMessage()}
              </>
            ) : (
              <>
                {selectedCurrency.type === "fiat"
                  ? `Pay ${
                      amount ? formatAmount(amount, selectedCurrency) : ""
                    } ${selectedCurrency.id}`
                  : paymentMethod === "wallet"
                  ? `Contribute ${amount || ""} ${selectedCurrency.id}`
                  : `Buy ${selectedCurrency.id} with Card`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          {selectedCurrency.type === "crypto" &&
            paymentMethod === "wallet" &&
            !walletProvider && (
              <p className="mt-2 text-xs text-center text-amber-600 dark:text-amber-400">
                Please connect your wallet to continue
              </p>
            )}

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By contributing, you agree to our Terms of Service and Privacy
            Policy
          </p>
        </form>
      </div>
    </div>
  );
}
