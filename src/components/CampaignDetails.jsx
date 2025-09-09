import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Target, Users, Share2, Copy, Globe, Calendar, DollarSign, ArrowUpRight } from "lucide-react";
import { getCampaign, getCampaigns } from "../lib/campaignService";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import PaymentModal from "./PaymentModal";

const CampaignDetails = ({ account, signer, provider }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const campaignFromState = location.state?.campaign;

  const [campaign, setCampaign] = useState(campaignFromState || null);
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Get the provider to use for contract calls
  const getProvider = async () => {
    if (provider) return provider;
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    throw new Error("No Ethereum provider found");
  };

  // Fetch campaign details
  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const providerToUse = await getProvider();
      const campaignData = await getCampaign(id, providerToUse);
      setCampaign(campaignData);

      // Fetch related campaigns
      const campaigns = await getCampaigns(providerToUse);
      setRelatedCampaigns(campaigns.filter((c) => c.id !== id).slice(0, 3));
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign details");
      toast.error("Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have campaign in state, we can show it immediately
    // but still fetch fresh data in the background
    if (campaignFromState) {
      setCampaign(campaignFromState);
    }

    // Always fetch fresh data
    fetchCampaign();

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [id, signer, provider]);

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsContributing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace with real contract call
      toast.success("Contribution successful!");
      setAmount("");
      await fetchCampaign();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to contribute");
    } finally {
      setIsContributing(false);
    }
  };

  const calculateTimeLeft = (deadline) => {
    if (!deadline) return "0 days";
    const diff = new Date(deadline * 1000) - new Date();
    return diff > 0
      ? `${Math.ceil(diff / (1000 * 60 * 60 * 24))} days left`
      : "Ended";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 text-lg mb-4">
          {error || "Failed to load campaign details"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Back to Campaigns
        </button>
      </div>
    );
  }

  const progress = (campaign.raised / campaign.goal) * 100;
  const timeLeft = calculateTimeLeft(campaign.deadline);

  // return (
  //   <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
  //     <div className="container mx-auto px-4 py-6">
  //       <button
  //         onClick={() => navigate(-1)}
  //         className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mb-6"
  //       >
  //         <ArrowLeft className="h-5 w-5 mr-2" />
  //         Back to Campaigns
  //       </button>

  //       <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
  //         <div className="p-6">
  //           <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
  //           <p className="mb-4">{campaign.description}</p>
  //           <div className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
  //             <User className="w-4 h-4" /> <span>{campaign.creator}</span>
  //             <Clock className="w-4 h-4" /> <span>{timeLeft}</span>
  //           </div>

  //           {loading && (
  //             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
  //               Updating campaign details...
  //             </p>
  //           )}

  //           <form onSubmit={handleContribute} className="space-y-4 mt-6">
  //             <input
  //               type="number"
  //               placeholder="Amount in ETH"
  //               value={amount}
  //               onChange={(e) => setAmount(e.target.value)}
  //               className="w-full px-4 py-2 border rounded-lg"
  //             />
  //             <button
  //               type="submit"
  //               disabled={isContributing}
  //               className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
  //             >
  //               {isContributing ? "Processing..." : "Contribute Now"}
  //             </button>
  //           </form>
  //         </div>
  //       </div>

  //       {relatedCampaigns.length > 0 && (
  //         <div className="mt-12">
  //           <h2 className="text-2xl font-bold mb-4">Related Campaigns</h2>
  //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  //             {relatedCampaigns.map((rc) => (
  //               <motion.div
  //                 key={rc.id}
  //                 className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden cursor-pointer"
  //                 onClick={() =>
  //                   navigate(`/campaigns/${rc.id}`, { state: { campaign: rc } })
  //                 }
  //                 whileHover={{ y: -3 }}
  //               >
  //                 <div className="h-40 bg-gray-200 dark:bg-gray-700">
  //                   {rc.image && (
  //                     <img
  //                       src={rc.image}
  //                       alt={rc.title}
  //                       className="w-full h-full object-cover"
  //                     />
  //                   )}
  //                 </div>
  //                 <div className="p-4">
  //                   <h3 className="font-medium mb-1">{rc.title}</h3>
  //                   <div className="text-sm text-gray-500">
  //                     {calculateTimeLeft(rc.deadline)}
  //                   </div>
  //                 </div>
  //               </motion.div>
  //             ))}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
  // Replace the return statement with this updated UI
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        campaign={selectedCampaign || campaign}
        account={account}
        signer={signer}
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Campaigns
        </button>

        {/* Main campaign card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Campaign header with image */}
          <div className="relative h-64 md:h-80 w-full bg-gray-200 dark:bg-gray-700">
            {campaign.image ? (
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {campaign.category || "General"}
                </span>
                <span className="text-sm text-white/90">{timeLeft}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {campaign.title}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Main content */}
              <div className="lg:col-span-2">
                {/* Campaign creator */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-medium">Created by</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {campaign.creator?.slice(0, 8)}...
                      {campaign.creator?.slice(-4)}
                    </div>
                  </div>
                </div>

                {/* Campaign description */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">
                    About this campaign
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    {campaign.description?.split("\n").map((paragraph, i) => (
                      <p key={i} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Campaign details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Campaign Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Start Date
                        </div>
                        <div>
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Goal
                        </div>
                        <div>{campaign.goal} ETH</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Raised
                        </div>
                        <div>{campaign.raised} ETH</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Backers
                        </div>
                        <div>{campaign.backersCount || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Contribution card */}
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                  <h3 className="text-xl font-bold mb-4">
                    Contribute to this campaign
                  </h3>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        {((campaign.raised / campaign.goal) * 100).toFixed(1)}%
                        Funded
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {campaign.raised} ETH of {campaign.goal} ETH
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (campaign.raised / campaign.goal) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Contribution form */}
                  <button
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Contribute Now
                  </button>

                  {/* Share buttons */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Share this campaign
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const text = `Check out "${campaign.title}" on Fundloom! ${window.location.href}`;
                          window.open(
                            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              text
                            )}`,
                            "_blank"
                          );
                        }}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Share on Twitter"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          window.open(
                            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
                            "_blank"
                          );
                        }}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Share on LinkedIn"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied to clipboard!");
                        }}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Copy link"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related campaigns */}
        {relatedCampaigns.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCampaigns.map((relatedCampaign) => (
                <motion.div
                  key={relatedCampaign.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  whileHover={{ y: -4 }}
                  onClick={() =>
                    navigate(`/campaigns/${relatedCampaign.id}`, {
                      state: { campaign: relatedCampaign },
                    })
                  }
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    {relatedCampaign.image ? (
                      <img
                        src={relatedCampaign.image}
                        alt={relatedCampaign.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="font-medium text-white line-clamp-1">
                        {relatedCampaign.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {relatedCampaign.category || "General"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {calculateTimeLeft(relatedCampaign.deadline)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (relatedCampaign.raised / relatedCampaign.goal) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{relatedCampaign.raised} ETH</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {(
                          (relatedCampaign.raised / relatedCampaign.goal) * 100
                        ).toFixed(0)}%
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(relatedCampaign);
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Contribute
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;
