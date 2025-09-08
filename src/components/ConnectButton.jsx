import React from 'react';
import { makeProvider, makeSigner } from '../lib/ethereum';

export default function ConnectButton({ onConnect, account, setProviderAndSigner }) {
  const handleConnect = async () => {
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      const provider = makeProvider();
      const signer = await makeSigner();
      const addr = signer ? await signer.getAddress() : null;
      setProviderAndSigner(provider, signer);
      onConnect && onConnect(addr);
    } catch (e) {
      alert(e.message || e);
    }
  };

  return (
    <div>
      <button onClick={handleConnect} style={{ padding: '8px 12px', borderRadius: 8, background: '#111827', color: 'white', border: 'none' }}>
        {account ? 'Connected' : 'Connect Wallet'}
      </button>
    </div>
  );
}