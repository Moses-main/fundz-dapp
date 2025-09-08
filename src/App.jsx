import React, { useState } from "react";
import ConnectButton from "./components/ConnectButton";
import CampaignForm from "./components/CampaignForm";
import DonateETH from "./components/DonateETH";
import DonateUSDC from "./components/DonateUSDC";
import CampaignDetails from "./components/CampaignDetails";
import CampaignsList from "./components/CampaignsList";
import WithdrawFunds from "./components/WithdrawFunds";
import TransferFunds from "./components/TransferFunds";
import { makeProvider, makeSigner } from "./lib/ethereum";

export default function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const onConnect = (addr) => {
    setAccount(addr);
  };

  const setProviderAndSigner = (p, s) => {
    setProvider(p);
    setSigner(s);
    if (s && !account) {
      s.getAddress()
        .then((a) => setAccount(a))
        .catch(() => {});
    }
  };

  const [selectedCampaign, setSelectedCampaign] = useState(null);

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>FundLoom dApp (Sepolia)</h1>
        <ConnectButton
          onConnect={onConnect}
          account={account}
          setProviderAndSigner={setProviderAndSigner}
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <h2>All Campaigns</h2>
        <CampaignsList
          provider={provider}
          onSelectCampaign={(campaignId) => setSelectedCampaign(campaignId)}
        />
      </div>

      <div style={{ margin: "40px 0" }}>
        <h2>Campaign Actions</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <CampaignForm
            signer={signer}
            account={account}
            onCreated={() => {
              /* refresh if needed */
            }}
          />
          <CampaignDetails provider={provider} campaignId={selectedCampaign} />
          <DonateETH signer={signer} campaignId={selectedCampaign} />
          <DonateUSDC signer={signer} campaignId={selectedCampaign} />
          <WithdrawFunds signer={signer} campaignId={selectedCampaign} />
          <TransferFunds signer={signer} campaignId={selectedCampaign} />
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: 13, color: "#555" }}>
        <div className="text-red-400">
          Connected to FundLoom contract:{" "}
          {/* <code>{process.env.REACT_APP_CONTRACT_ADDRESS || "Not set"}</code> */}
        </div>
      </div>
    </div>
  );
}
