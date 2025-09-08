import React, { useState } from "react";
import { getContract } from "../lib/ethereum";
import { CONTRACT_ADDRESS, FUNDLOOM_ABI } from "../lib/contracts";
import { ethers } from "ethers";


export default function CampaignForm({ signer, account, onCreated }) {
  const [name, setName] = useState("");
  const [charity, setCharity] = useState("");
  const [target, setTarget] = useState("0.1");
  const [duration, setDuration] = useState("604800");
  const [status, setStatus] = useState("");

  const ensureConnected = () => {
    if (!signer) throw new Error("Please connect wallet");
  };

  const handleCreate = async () => {
    try {
      ensureConnected();
      setStatus("Creating...");
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      const charityAddr = charity && charity.length ? charity : account;
      const tx = await contract.createCampaign(
        name,
        charityAddr,
        ethers.parseEther(String(target)),
        BigInt(duration)
      );
      await tx.wait();
      setStatus("Created ✅");
      onCreated && onCreated();
    } catch (e) {
      console.error(e);
      setStatus(e.message || String(e));
    }
  };

  return (
    <div className="card">
      <h3>Create Campaign</h3>
      <div>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Charity (optional)"
          value={charity}
          onChange={(e) => setCharity(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Target in ETH"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>
      <div>
        <input
          placeholder="Duration (seconds)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleCreate}>Create</button>
      </div>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}
