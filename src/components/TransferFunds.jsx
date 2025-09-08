import React, { useState } from 'react';
import { getContract } from '../lib/ethereum';
import { CONTRACT_ADDRESS, FUNDLOOM_ABI, USDC_ADDRESS } from '../lib/contracts';

export default function TransferFunds({ signer }) {
  const [campaignId, setCampaignId] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');

  const ensureConnected = () => { if (!signer) throw new Error('Please connect wallet'); };

  const handleTransferETH = async () => {
    try {
      ensureConnected();
      setStatus('Transferring ETH...');
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      const tx = await contract.transferFunds(BigInt(campaignId), to);
      await tx.wait();
      setStatus('Transferred ETH ✅');
    } catch (e) {
      console.error(e);
      setStatus(e.message || String(e));
    }
  };

  const handleTransferUSDC = async () => {
    try {
      ensureConnected();
      setStatus('Transferring USDC...');
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      const tx = await contract.transferTokenFunds(BigInt(campaignId), USDC_ADDRESS, to);
      await tx.wait();
      setStatus('Transferred USDC ✅');
    } catch (e) {
      console.error(e);
      setStatus(e.message || String(e));
    }
  };

  return (
    <div className='card'>
      <h3>Transfer Funds</h3>
      <div><input placeholder='Campaign ID' value={campaignId} onChange={e=>setCampaignId(e.target.value)} /></div>
      <div><input placeholder='Recipient address' value={to} onChange={e=>setTo(e.target.value)} /></div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleTransferETH}>Transfer ETH</button>
        <button onClick={handleTransferUSDC} style={{ marginLeft: 8 }}>Transfer USDC</button>
      </div>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}