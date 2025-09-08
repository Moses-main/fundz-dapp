import React, { useState } from 'react';
import { getContract } from '../lib/ethereum';
import { CONTRACT_ADDRESS, FUNDLOOM_ABI } from '../lib/contracts';
import { ethers } from 'ethers';

export default function DonateETH({ signer }) {
  const [campaignId, setCampaignId] = useState('');
  const [amount, setAmount] = useState('0.01');
  const [status, setStatus] = useState('');

  const ensureConnected = () => { if (!signer) throw new Error('Please connect wallet'); };

  const handleDonate = async () => {
    try {
      ensureConnected();
      setStatus('Sending...');
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      const tx = await contract.donate(BigInt(campaignId), { value: ethers.parseEther(String(amount)) });
      await tx.wait();
      setStatus('Donation sent ✅');
    } catch (e) {
      console.error(e);
      setStatus(e.message || String(e));
    }
  };

  return (
    <div className='card'>
      <h3>Donate ETH</h3>
      <div><input placeholder='Campaign ID' value={campaignId} onChange={e=>setCampaignId(e.target.value)} /></div>
      <div><input placeholder='Amount (ETH)' value={amount} onChange={e=>setAmount(e.target.value)} /></div>
      <div style={{ marginTop: 8 }}><button onClick={handleDonate}>Donate ETH</button></div>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}