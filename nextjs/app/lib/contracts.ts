import { ethers } from "ethers";

/**
 * Contract addresses (set these after deploying)
 */
export const CONTRACTS = {
  ESCROW: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "",
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || "",
};

/**
 * FeedbackEscrow ABI (relevant functions only)
 */
export const ESCROW_ABI = [
  "function createCampaign(string campaignId, uint256 endDate, uint256 numAspects, uint256 totalAmount) external",
  "function getCampaign(string campaignId) external view returns (tuple(address creator, uint256 totalDeposit, uint256 endDate, uint256 numAspects, uint8 status))",
  "function emergencyWithdraw(string campaignId) external",
  "event CampaignCreated(string indexed campaignId, address indexed creator, uint256 totalDeposit, uint256 endDate, uint256 numAspects)",
  "event PaymentDistributed(string indexed campaignId, address indexed wallet, uint256 amount, uint256 score, string aspect)",
];

/**
 * ERC-20 ABI (approve + balanceOf)
 */
export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

/**
 * USDC has 6 decimals.
 */
export const USDC_DECIMALS = 6;

/**
 * Parse a human-readable USDC amount to contract units.
 */
export function parseUSDC(amount: number): bigint {
  return ethers.parseUnits(amount.toString(), USDC_DECIMALS);
}

/**
 * Format USDC units to human-readable.
 */
export function formatUSDC(amount: bigint): string {
  return ethers.formatUnits(amount, USDC_DECIMALS);
}
