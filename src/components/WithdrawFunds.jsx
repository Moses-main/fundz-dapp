import React, { useState } from 'react';
import { getContract } from '../lib/ethereum';
import { CONTRACT_ADDRESS, FUNDLOOM_ABI, USDC_ADDRESS } from '../lib/contracts';

export default function WithdrawFunds({ signer }) {
  const [campaignId, setCampaignId] = useState('');
  const [status, setStatus] = useState('');

  const ensureConnected = () => { if (!signer) throw new Error('Please connect wallet'); };

  const handleWithdrawETH = async () => {
    try {
      ensureConnected();
      setStatus('Withdrawing ETH...');
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      const tx = await contract.withdraw(BigInt(campaignId));
      await tx.wait();
      setStatus('Withdrawn ETH ✅');
    } catch (e) {
      console.error(e);
      setStatus(e.message || String(e));
    }
  };

  const handleWithdrawUSDC = async () => {
    try {
      ensureConnected();
      setStatus('Withdrawing USDC...');
      const contract = getContract(CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
      const tx = await contract.withdrawToken(BigInt(campaignId), USDC_ADDRESS);
      await tx.wait();
      setStatus('Withdrawn USDC ✅');
    } catch (e) {
      console.error(e);
      setStatus(e.message || String(e));
    }
  };

  return (
    <div className='card'>
      <h3>Withdraw / WithdrawToken</h3>
      <div><input placeholder='Campaign ID' value={campaignId} onChange={e=>setCampaignId(e.target.value)} /></div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleWithdrawETH}>Withdraw ETH</button>
        <button onClick={handleWithdrawUSDC} style={{ marginLeft: 8 }}>Withdraw USDC</button>
      </div>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}