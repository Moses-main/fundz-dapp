import React, { useState } from 'react';
import { getContract } from '../lib/ethereum';
import { USDC_ADDRESS, CONTRACT_ADDRESS, ERC20_ABI, FUNDLOOM_ABI } from '../lib/contracts';
import { ethers } from 'ethers';

export default function DonateUSDC({ signer }) {
  const [campaignId, setCampaignId] = useState('');
  const [approveAmt, setApproveAmt] = useState('5.0');
  const [donAmt, setDonAmt] = useState('1.0');
  const [status, setStatus] = useState('');

  const ensureConnected = () => { if (!signer) throw new Error('Please connect wallet'); };

  const handleApprove = async () => {
    try {
      ensureConnected();
      setStatus('Approving...');
      const token = getContract(USDC_ADDRESS, ERC20_ABI, signer);
      const amt = ethers.parseUnits(String(approveAmt), 6);
      const tx = await token.approve(CONTRACT_ADDRESS, amt);
      await tx.wait();
      setStatus('Approved ✅');
    } catch (e) {
      console.error(e);
      setStatus(e.message || String(e));
    }
  };

  const handleDonate = async () => {
    try {
      ensureConnected();
      setStatus('Donating USDC...');
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      const amt = ethers.parseUnits(String(donAmt), 6);
      const tx = await contract.donateERC20(BigInt(campaignId), USDC_ADDRESS, amt);
      await tx.wait();
      setStatus('USDC donated ✅');
    } catch (e) {
      console.error(e);
      setStatus(e.message || String(e));
    }
  };

  return (
    <div className='card'>
      <h3>Donate USDC</h3>
      <div><input placeholder='Campaign ID' value={campaignId} onChange={e=>setCampaignId(e.target.value)} /></div>
      <div style={{ marginTop: 6 }}>
        <input placeholder='Approve amount (USDC)' value={approveAmt} onChange={e=>setApproveAmt(e.target.value)} />
        <button onClick={handleApprove} style={{ marginLeft: 8 }}>Approve</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <input placeholder='Donate amount (USDC)' value={donAmt} onChange={e=>setDonAmt(e.target.value)} />
        <button onClick={handleDonate} style={{ marginLeft: 8 }}>Donate USDC</button>
      </div>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}