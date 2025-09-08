import React, { useState, useEffect } from "react";
import { getContract } from "../lib/ethereum";
import {
  CONTRACT_ADDRESS,
  FUNDLOOM_ABI,
  USDC_ADDRESS,
  ZERO_ADDRESS,
} from "../lib/contracts";
import { ethers } from "ethers";

export default function CampaignDetails({
  provider,
  campaignId: propCampaignId,
}) {
  const [campaign, setCampaign] = useState(null);
  const [ethBal, setEthBal] = useState("");
  const [usdcBal, setUsdcBal] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = async (id = propCampaignId) => {
    if (!id) return;

    try {
      setIsLoading(true);
      setStatus("Loading...");
      if (!provider) throw new Error("Provider not available");

      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, provider);
      const data = await contract.getCampaign(BigInt(id));

      setCampaign({
        id: data.id.toString(),
        name: data.name,
        creator: data.creator,
        charity: data.charity,
        targetAmount: data.targetAmount.toString(),
        raisedAmount: data.raisedAmount.toString(),
        deadline: Number(data.deadline),
        isActive: data.isActive,
        totalDonors: data.totalDonors.toString(),
        isFundsTransferred: data.isFundsTransferred,
      });

      try {
        const [ethBalance, usdcBalance] = await Promise.all([
          contract.getCampaignBalance(BigInt(id), ZERO_ADDRESS),
          contract.getCampaignBalance(BigInt(id), USDC_ADDRESS),
        ]);

        setEthBal(ethers.formatEther(ethBalance));
        setUsdcBal(ethers.formatUnits(usdcBalance, 6));
      } catch (balanceError) {
        console.error("Error fetching balances:", balanceError);
      }

      setStatus("Loaded ✅");
    } catch (e) {
      console.error("Error loading campaign:", e);
      setStatus(e.message || "Failed to load campaign");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propCampaignId) {
      handleLoad(propCampaignId);
    }
  }, [propCampaignId]);

  const formatAddress = (addr) => {
    if (!addr) return "N/A";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div
      className="card"
      style={{
        maxWidth: "600px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #eee",
        borderRadius: "8px",
      }}
    >
      <h3>Campaign Details {campaign && `#${campaign.id}`}</h3>

      {!propCampaignId && (
        <div style={{ marginBottom: "16px" }}>
          <input
            type="number"
            placeholder="Enter Campaign ID"
            onChange={(e) => handleLoad(e.target.value)}
            style={{ padding: "8px", width: "200px", marginRight: "8px" }}
          />
          <button
            onClick={handleLoad}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Loading..." : "Load"}
          </button>
        </div>
      )}

      <div style={{ color: "#666", marginBottom: "16px" }}>{status}</div>

      {campaign && (
        <div style={{ marginTop: 8 }}>
          <div style={{ borderTop: "1px solid #eee", paddingTop: "16px" }}>
            <h4 style={{ margin: "0 0 16px", color: "#333" }}>
              {campaign.name}
            </h4>

            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontWeight: "500", color: "#555" }}>
                Description
              </div>
              <div style={{ color: "#666", marginTop: "4px" }}>
                No description available
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <div style={{ fontWeight: "500", color: "#555" }}>Creator</div>
                <div style={{ color: "#666" }}>
                  {formatAddress(campaign.creator)}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: "500", color: "#555" }}>Charity</div>
                <div style={{ color: "#666" }}>
                  {formatAddress(campaign.charity)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontWeight: "500", color: "#555" }}>
                  Progress
                </span>
                <span style={{ color: "#4CAF50" }}>
                  {(
                    (Number(campaign.raisedAmount) /
                      Number(campaign.targetAmount)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(
                      100,
                      (Number(campaign.raisedAmount) /
                        Number(campaign.targetAmount)) *
                        100
                    )}%`,
                    backgroundColor: "#4CAF50",
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "4px",
                }}
              >
                <span style={{ fontSize: "0.9em", color: "#666" }}>
                  {ethers.formatEther(campaign.raisedAmount)} /{" "}
                  {ethers.formatEther(campaign.targetAmount)} ETH
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "500",
                    color: "#555",
                    fontSize: "0.9em",
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    color: campaign.isActive ? "#4CAF50" : "#f44336",
                    fontWeight: "500",
                    fontSize: "0.9em",
                  }}
                >
                  {campaign.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontWeight: "500",
                    color: "#555",
                    fontSize: "0.9em",
                  }}
                >
                  Deadline
                </div>
                <div style={{ color: "#666", fontSize: "0.9em" }}>
                  {formatDate(campaign.deadline)}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontWeight: "500",
                    color: "#555",
                    fontSize: "0.9em",
                  }}
                >
                  ETH Balance
                </div>
                <div style={{ color: "#666", fontSize: "0.9em" }}>
                  {ethBal} ETH
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontWeight: "500",
                    color: "#555",
                    fontSize: "0.9em",
                  }}
                >
                  USDC Balance
                </div>
                <div style={{ color: "#666", fontSize: "0.9em" }}>
                  {usdcBal} USDC
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontWeight: "500",
                    color: "#555",
                    fontSize: "0.9em",
                  }}
                >
                  Total Donors
                </div>
                <div style={{ color: "#666", fontSize: "0.9em" }}>
                  {campaign.totalDonors}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useState, useEffect } from 'react';
// import { getContract } from '../lib/ethereum';
// import { CONTRACT_ADDRESS, FUNDLOOM_ABI, USDC_ADDRESS, ZERO_ADDRESS } from '../lib/contracts';
// import { ethers } from 'ethers';

// export default function CampaignDetails({ provider, campaignId: propCampaignId }) {
//   const [campaign, setCampaign] = useState(null);
//   const [ethBal, setEthBal] = useState('');
//   const [usdcBal, setUsdcBal] = useState('');
//   const [status, setStatus] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLoad = async (id = propCampaignId) => {
//     if (!id) return;

//     try {
//       setIsLoading(true);
//       setStatus('Loading...');
//       if (!provider) throw new Error('Provider not available');

//       const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, provider);
//       const data = await contract.getCampaign(BigInt(id));

//       setCampaign({
//         id: data.id.toString(),
//         name: data.name,
//         creator: data.creator,
//         charity: data.charity,
//         targetAmount: data.targetAmount.toString(),
//         raisedAmount: data.raisedAmount.toString(),
//         deadline: Number(data.deadline),
//         isActive: data.isActive,
//         totalDonors: data.totalDonors.toString(),
//         isFundsTransferred: data.isFundsTransferred,
//         // description: data.description || 'No description available'
//       });

//       try {
//         const [ethBalance, usdcBalance] = await Promise.all([
//           contract.getCampaignBalance(BigInt(id), ZERO_ADDRESS),
//           contract.getCampaignBalance(BigInt(id), USDC_ADDRESS)
//         ]);

//         setEthBal(ethers.formatEther(ethBalance));
//         setUsdcBal(ethers.formatUnits(usdcBalance, 6));
//       } catch (balanceError) {
//         console.error('Error fetching balances:', balanceError);
//       }

//       setStatus('Loaded ✅');
//     } catch (e) {
//       console.error('Error loading campaign:', e);
//       setStatus(e.message || 'Failed to load campaign');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (propCampaignId) {
//       handleLoad(propCampaignId);
//     }
//   }, [propCampaignId]);

//   const formatAddress = (addr) => {
//     if (!addr) return 'N/A';
//     return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
//   };

//   const formatDate = (timestamp) => {
//     if (!timestamp) return 'N/A';
//     return new Date(timestamp * 1000).toLocaleString();
//   };

//   return (
//     <div className='card' style={{ maxWidth: '600px', margin: '20px 0' }}>
//       <h3>Campaign Details {campaign && `#${campaign.id}`}</h3>

//       {!propCampaignId && (
//         <div style={{ marginBottom: '16px' }}>
//           <input
//             type="number"
//             placeholder='Enter Campaign ID'
//             onChange={e => handleLoad(e.target.value)}
//             style={{ padding: '8px', width: '200px', marginRight: '8px' }}
//           />
//           <button
//             onClick={handleLoad}
//             disabled={isLoading}
//             style={{
//               padding: '8px 16px',
//               background: '#4CAF50',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               opacity: isLoading ? 0.6 : 1
//             }}
//           >
//             {isLoading ? 'Loading...' : 'Load'}
//           </button>
//         </div>
//       )}

//       <div style={{ color: '#666', marginBottom: '16px' }}>{status}</div>

//       {campaign && (
//         <div style={{ marginTop: 8 }}>
//           <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
//           <h4 style={{ margin: '0 0 16px', color: '#333' }}>{campaign.name}</h4>

//           <div style={{ marginBottom: '12px' }}>
//             <div style={{ fontWeight: '500', color: '#555' }}>Description</div>
//             <div style={{ color: '#666', marginTop: '4px' }}>{campaign.description}</div>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
//             <div>
//               <div style={{ fontWeight: '500', color: '#555' }}>Creator</div>
//               <div style={{ color: '#666' }}>{formatAddress(campaign.creator)}</div>
//             </div>
//             <div>
//               <div style={{ fontWeight: '500', color: '#555' }}>Charity</div>
//               <div style={{ color: '#666' }}>{formatAddress(campaign.charity)}</div>
//             </div>
//           </div>

//           <div style={{ marginBottom: '16px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
//               <span style={{ fontWeight: '500', color: '#555' }}>Progress</span>
//               <span style={{ color: '#4CAF50' }}>
//                 {((Number(campaign.raisedAmount) / Number(campaign.targetAmount)) * 100).toFixed(1)}%
//               </span>
//             </div>
//             <div style={{
//               height: '8px',
//               backgroundColor: '#e0e0e0',
//               borderRadius: '4px',
//               overflow: 'hidden'
//             }}>
//               <div
//                 style={{
//                   height: '100%',
//                   width: `${Math.min(100, (Number(campaign.raisedAmount) / Number(campaign.targetAmount)) * 100)}%`,
//                   backgroundColor: '#4CAF50',
//                   transition: 'width 0.3s ease'
//                 }}
//               ></div>
//             </div>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
//               <span style={{ fontSize: '0.9em', color: '#666' }}>
//                 {ethers.formatEther(campaign.raisedAmount)} / {ethers.formatEther(campaign.targetAmount)} ETH
//               </span>
//             </div>
//           </div>

//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
//             gap: '12px',
//             marginBottom: '16px'
//           }}>
//             <div>
//               <div style={{ fontWeight: '500', color: '#555', fontSize: '0.9em' }}>Status</div>
//               <div style={{
//                 color: campaign.isActive ? '#4CAF50' : '#f44336',
//                 fontWeight: '500',
//                 fontSize: '0.9em'
//               }}>
//                 {campaign.isActive ? 'Active' : 'Inactive'}
//               </div>
//             </div>
//             <div>
