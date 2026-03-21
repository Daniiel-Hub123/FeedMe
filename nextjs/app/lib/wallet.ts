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
 * Switch to Sepolia testnet.
 */
export async function switchToSepolia(): Promise<void> {
  if (!isMetaMaskInstalled()) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // Sepolia chainId
    });
  } catch (error: any) {
    // If chain not added, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia Testnet",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
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
