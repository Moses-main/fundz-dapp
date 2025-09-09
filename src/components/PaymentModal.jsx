import { useState, useEffect } from "react";
import React from "react";
import {
  X,
  ArrowRight,
  Copy,
  Check,
  Share2,
  Twitter,
  Linkedin,
} from "lucide-react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

export default function PaymentModal({
  isOpen,
  onClose,
  campaign,
  account,
  signer,
}) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate a fake transaction hash for demo
      const fakeTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTxHash(fakeTxHash);
      setPaymentSuccess(true);

      // Reset form after success
      setAmount("");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareOnTwitter = () => {
    const text = `I just contributed to "${campaign?.title}" on Fundloom! Join me in supporting this amazing cause.`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${
        window.location.href
      }`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank"
    );
  };

  if (!isOpen) return null;

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thank You!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your contribution of {amount} {currency} to "{campaign?.title}"
              was successful!
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Transaction:
                </span>
                <div className="flex items-center">
                  <span className="text-sm font-mono mr-2">
                    {txHash.slice(0, 6)}...{txHash.slice(-4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(txHash)}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Share this campaign
              </h4>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={shareOnTwitter}
                  className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Contribute to {campaign?.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your support helps make this campaign a success!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {currency === "ETH" ? "Ξ" : currency === "USDC" ? "$" : "₿"}
                </span>
              </div>
              <input
                type="number"
                id="amount"
                min="0.000000000000000001"
                step="0.000000000000000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 dark:text-gray-300 sm:text-sm rounded-r-md"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Min. contribution: {campaign.minContribution || "0.01"} ETH
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`flex items-center justify-center p-3 rounded-lg border ${
                  paymentMethod === "wallet"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span className="text-sm font-medium">Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center justify-center p-3 rounded-lg border ${
                  paymentMethod === "card"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span className="text-sm font-medium">Credit/Debit Card</span>
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
            disabled={isProcessing}
            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isProcessing ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Contribute {amount ? `${amount} ${currency}` : ""}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By contributing, you agree to our Terms of Service and Privacy
            Policy
          </p>
        </form>
      </div>
    </div>
  );
}
