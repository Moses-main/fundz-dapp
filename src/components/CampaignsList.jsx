import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../lib/ethereum";
import {
  CONTRACT_ADDRESS,
  FUNDLOOM_ABI,
  USDC_ADDRESS,
  ZERO_ADDRESS,
} from "../lib/contracts";

const CampaignCard = ({ campaign, onSelect }) => {
  const deadlineDate = new Date(Number(campaign.deadline) * 1000);
  const isActive = campaign.isActive && deadlineDate > new Date();
  const progress =
    (Number(campaign.raisedAmount) / Number(campaign.targetAmount)) * 100;

  return (
    <div className="campaign-card" onClick={() => onSelect(campaign.id)}>
      <h3>{campaign.name || `Campaign #${campaign.id}`}</h3>
      <p>{campaign.description || "No description provided"}</p>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
        <span className="progress-text">
          {ethers.formatEther(campaign.raisedAmount)} ETH raised of{" "}
          {ethers.formatEther(campaign.targetAmount)} ETH
        </span>
      </div>

      <div className="campaign-meta">
        <span className={`status ${isActive ? "active" : "ended"}`}>
          {isActive ? "Active" : "Ended"}
        </span>
        <span className="deadline">
          {isActive ? "Ends " : "Ended "}
          {deadlineDate.toLocaleDateString()}
        </span>
      </div>

      <div className="campaign-owner">
        <small>
          Created by:{" "}
          {`${campaign.creator.slice(0, 6)}...${campaign.creator.slice(-4)}`}
        </small>
      </div>
    </div>
  );
};

export default function CampaignsList({ provider, onSelectCampaign }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      // Use the provider if available, otherwise create a default provider
      const currentProvider = provider || new ethers.InfuraProvider('sepolia');

      try {
        setLoading(true);
        setError("");

        const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, currentProvider);
        const campaignIds = await contract.getAllCampaignIds();
        const campaignsList = [];

        for (let id of campaignIds) {
          try {
            const data = await contract.getCampaign(id);
            campaignsList.push({
              id: id.toString(),
              name: data.name,
              // ❌ contract has no description field, remove or set default
              description: "No description provided",
              creator: data.creator,
              targetAmount: data.targetAmount.toString(),
              raisedAmount: data.raisedAmount.toString(),
              deadline: Number(data.deadline),
              isActive: data.isActive,
              totalDonors: data.totalDonors.toString(),
            });
          } catch (err) {
            console.error(`Error fetching campaign ${id}:`, err);
          }
        }

        setCampaigns(campaignsList);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to load campaigns. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();

    // Set up polling to refresh campaigns every 30 seconds
    const interval = setInterval(fetchCampaigns, 30000);
    return () => clearInterval(interval);
  }, [provider]);

  if (loading && campaigns.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="no-campaigns">
        No campaigns found. Be the first to create one!
      </div>
    );
  }

  return (
    <div className="campaigns-grid">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onSelect={onSelectCampaign}
        />
      ))}
    </div>
  );
}

// Add some basic styling
const styles = `
  .campaigns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px 0;
  }
  
  .campaign-card {
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    background: white;
  }
  
  .campaign-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .campaign-card h3 {
    margin: 0 0 8px;
    color: #1a1a1a;
  }
  
  .campaign-card p {
    color: #666;
    font-size: 14px;
    margin: 0 0 12px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .progress-container {
    height: 24px;
    background: #f0f0f0;
    border-radius: 12px;
    margin: 12px 0;
    overflow: hidden;
    position: relative;
  }
  
  .progress-bar {
    height: 100%;
    background: #4caf50;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    text-shadow: 0 0 2px rgba(0,0,0,0.5);
  }
  
  .campaign-meta {
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
    font-size: 13px;
  }
  
  .status {
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
  }
  
  .status.active {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  .status.ended {
    background: #ffebee;
    color: #d32f2f;
  }
  
  .deadline {
    color: #666;
  }
  
  .campaign-owner {
    color: #888;
    font-size: 12px;
    margin-top: 8px;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #1976d2;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    background: #ffebee;
    border-left: 4px solid #d32f2f;
    padding: 16px;
    margin: 20px 0;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .error-message button {
    background: #d32f2f;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .error-message button:hover {
    background: #b71c1c;
  }
  
  .no-campaigns {
    text-align: center;
    padding: 40px 20px;
    color: #666;
    background: #f9f9f9;
    border-radius: 8px;
    margin: 20px 0;
  }
`;

// Add styles to the document
const styleElement = document.createElement("style");
styleElement.textContent = styles;
document.head.appendChild(styleElement);
