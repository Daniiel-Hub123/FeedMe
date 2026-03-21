import { BrowserProvider, JsonRpcSigner, ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Check if MetaMask is installed.
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum?.isMetaMask);
}

/**
 * Connect to MetaMask and return the signer + address.
 */
export async function connectWallet(): Promise<{
  address: string;
  signer: JsonRpcSigner;
  provider: BrowserProvider;
}> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install it first.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { address, signer, provider };
}

/**
 * Get the currently connected address (if any).
 */
export async function getConnectedAddress(): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

/**
 * Switch to Avalanche Fuji C-Chain testnet.
 */
export async function switchToFuji(): Promise<void> {
  if (!isMetaMaskInstalled()) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xa869" }], // 43113 in hex
    });
  } catch (error: any) {
    // If chain not added, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xa869",
            chainName: "Avalanche Fuji C-Chain",
            nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
            rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
            blockExplorerUrls: ["https://testnet.snowtrace.io"],
          },
        ],
      });
    }
  }
}

/**
 * Shorten an Ethereum address for display.
 */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
