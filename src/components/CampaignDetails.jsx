import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User } from "lucide-react";
import { getCampaign, getCampaigns } from "../lib/campaignService";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";

const CampaignDetails = ({ account, signer, provider }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const campaignFromState = location.state?.campaign;

  const [campaign, setCampaign] = useState(campaignFromState || null);
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);

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
      setRelatedCampaigns(campaigns.filter(c => c.id !== id).slice(0, 3));
      
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
          {error || 'Failed to load campaign details'}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Campaigns
        </button>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
            <p className="mb-4">{campaign.description}</p>
            <div className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <User className="w-4 h-4" /> <span>{campaign.creator}</span>
              <Clock className="w-4 h-4" /> <span>{timeLeft}</span>
            </div>

            {loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Updating campaign details...
              </p>
            )}

            <form onSubmit={handleContribute} className="space-y-4 mt-6">
              <input
                type="number"
                placeholder="Amount in ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                type="submit"
                disabled={isContributing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                {isContributing ? "Processing..." : "Contribute Now"}
              </button>
            </form>
          </div>
        </div>

        {relatedCampaigns.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Related Campaigns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedCampaigns.map((rc) => (
                <motion.div
                  key={rc.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden cursor-pointer"
                  onClick={() =>
                    navigate(`/campaigns/${rc.id}`, { state: { campaign: rc } })
                  }
                  whileHover={{ y: -3 }}
                >
                  <div className="h-40 bg-gray-200 dark:bg-gray-700">
                    {rc.image && (
                      <img
                        src={rc.image}
                        alt={rc.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1">{rc.title}</h3>
                    <div className="text-sm text-gray-500">
                      {calculateTimeLeft(rc.deadline)}
                    </div>
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

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   ArrowLeft,
//   Calendar,
//   Clock,
//   User,
//   Share2,
//   Copy,
//   Twitter,
//   Linkedin,
// } from "lucide-react";
// import { getCampaign, getCampaigns } from "../lib/campaignService";
// import { formatEther } from "ethers";
// import { toast } from "react-hot-toast";

// const CampaignDetails = ({ account, signer }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   // const provider = location.state?.provider; // <- get provider from CampaignsPage

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [amount, setAmount] = useState("");
//   const [relatedCampaigns, setRelatedCampaigns] = useState([]);
//   const [isContributing, setIsContributing] = useState(false);

//   // Try to get the campaign from navigation state
//   const campaignFromState = location.state?.campaign;
//   const [campaign, setCampaign] = useState(campaignFromState || null);

//   useEffect(() => {
//     if (!campaign) fetchCampaign();
//   }, [id, signer, campaign]);

//   const fetchCampaign = async () => {
//     try {
//       setLoading(true);

//       // Use signer if available, otherwise fallback to window.ethereum
//       const providerToUse = signer || window.ethereum;
//       if (!providerToUse) throw new Error("Provider not available");

//       const campaignData = await getCampaign(id, providerToUse); // pass provider/signer
//       setCampaign(campaignData);

//       const campaigns = await getCampaigns(providerToUse); // fetch other campaigns
//       setRelatedCampaigns(campaigns.filter((c) => c.id !== id).slice(0, 3));
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load campaign details");
//       toast.error("Failed to load campaign details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleContribute = async (e) => {
//     e.preventDefault();
//     if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     if (!account) {
//       toast.error("Please connect your wallet first");
//       return;
//     }

//     try {
//       setIsContributing(true);
//       // Mock transaction, replace with your contract call
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       toast.success("Contribution successful!");
//       setAmount("");
//       await fetchCampaign();
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message || "Failed to contribute");
//     } finally {
//       setIsContributing(false);
//     }
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(window.location.href);
//     toast.success("Link copied!");
//   };

//   const shareOnTwitter = () => {
//     const text = `Check out "${campaign?.title}" on Fundloom! ${window.location.href}`;
//     window.open(
//       `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
//       "_blank"
//     );
//   };

//   const shareOnLinkedIn = () => {
//     const url = encodeURIComponent(window.location.href);
//     window.open(
//       `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
//       "_blank"
//     );
//   };

//   const calculateTimeLeft = (deadline) => {
//     if (!deadline) return "0 days";
//     const diff = new Date(deadline * 1000) - new Date();
//     return diff > 0
//       ? `${Math.ceil(diff / (1000 * 60 * 60 * 24))} days left`
//       : "Ended";
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   if (error || !campaign)
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center">
//         <p className="text-red-500 mb-4">{error || "Campaign not found"}</p>
//         <button
//           onClick={() => navigate(-1)}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           Go Back
//         </button>
//       </div>
//     );

//   const progress = (campaign.raised / campaign.goal) * 100;

//   const timeLeft = calculateTimeLeft(campaign.deadline);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
//       <div className="container mx-auto px-4 py-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mb-6"
//         >
//           <ArrowLeft className="h-5 w-5 mr-2" />
//           Back to Campaigns
//         </button>

//         <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
//           <div className="p-6">
//             <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
//             <p className="mb-4">{campaign.description}</p>
//             <div className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
//               <User className="w-4 h-4" /> <span>{campaign.creator}</span>
//               <Clock className="w-4 h-4" /> <span>{timeLeft}</span>
//             </div>

//             {/* Contribution Section */}
//             <form onSubmit={handleContribute} className="space-y-4 mt-6">
//               <input
//                 type="number"
//                 placeholder="Amount in ETH"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="w-full px-4 py-2 border rounded-lg"
//               />
//               <button
//                 type="submit"
//                 disabled={isContributing}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
//               >
//                 {isContributing ? "Processing..." : "Contribute Now"}
//               </button>
//             </form>
//           </div>
//         </div>

//         {/* Related Campaigns */}
//         {relatedCampaigns.length > 0 && (
//           <div className="mt-12">
//             <h2 className="text-2xl font-bold mb-4">Related Campaigns</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {relatedCampaigns.map((rc) => (
//                 <motion.div
//                   key={rc.id}
//                   className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden cursor-pointer"
//                   // onClick={() =>
//                   //   navigate(`/campaigns/${rc.id}`, { state: { provider } })
//                   // }
//                   onClick={() => navigate(`/campaigns/${rc.id}`)}
//                   whileHover={{ y: -3 }}
//                 >
//                   <div className="h-40 bg-gray-200 dark:bg-gray-700">
//                     {rc.image && (
//                       <img
//                         src={rc.image}
//                         alt={rc.title}
//                         className="w-full h-full object-cover"
//                       />
//                     )}
//                   </div>
//                   <div className="p-4">
//                     <h3 className="font-medium mb-1">{rc.title}</h3>
//                     <div className="text-sm text-gray-500">
//                       {calculateTimeLeft(rc.deadline)}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CampaignDetails;
