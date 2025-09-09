// CampaignsContainer.jsx
import React, { useState, useEffect } from "react";
import CampaignsPage from "../pages/CampaignsPage";
import { CONTRACT_ADDRESS } from "../lib/contracts"; // your contract address
import { getContract, makeSigner } from "../lib/ethereum"; // your helper functions
import { FUNDLOOM_ABI } from "../lib/contracts"; // make sure you have ABI as JSON

const CampaignsContainer = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Utility to convert on-chain data to frontend-friendly format
  const formatCampaign = (c) => ({
    id: c.id.toString(),
    title: c.name,
    description: `Target: ${c.targetAmount.toString()} Wei`, // placeholder
    raised: parseInt(c.raisedAmount.toString()), // convert BigNumber
    goal: parseInt(c.targetAmount.toString()),
    daysLeft: Math.max(
      0,
      Math.ceil((parseInt(c.deadline.toString()) - Date.now() / 1000) / 86400)
    ),
    creator: c.creator,
    isActive: c.isActive,
    totalDonors: parseInt(c.totalDonors.toString()),
    isFundsTransferred: c.isFundsTransferred,
    // optional placeholders
    image: null,
    category: "General",
    backers: parseInt(c.totalDonors.toString()),
    isNew: true,
  });

  const fetchCampaigns = async () => {
    try {
      const signer = await makeSigner();
      if (!signer) throw new Error("No signer available");

      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);

      // get all campaign IDs
      const ids = await contract.getAllCampaignIds();
      const campaignsRaw = await Promise.all(
        ids.map((id) => contract.getCampaign(id))
      );

      const formatted = campaignsRaw.map(formatCampaign);
      setCampaigns(formatted);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading)
    return <div className="text-center py-12">Loading campaigns...</div>;

  return <CampaignsPage campaigns={campaigns} />;
};

export default CampaignsContainer;
