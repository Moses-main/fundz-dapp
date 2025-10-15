import { ethers } from "ethers";

export function makeProvider() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
}

export async function makeSigner() {
  const provider = makeProvider();
  if (!provider) return null;
  // request accounts if not already
  try {
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  } catch (e) {
    return null;
  }
}

export function getContract(address, abi, signerOrProvider) {
  return new ethers.Contract(address, abi, signerOrProvider);
}
