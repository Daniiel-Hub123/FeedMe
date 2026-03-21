import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // 1. Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // 2. Define addresses
  const backendWallet = deployer.address; // In production, use a dedicated backend wallet
  const treasuryWallet = deployer.address; // In production, use a dedicated treasury wallet

  // 3. Deploy FeedbackEscrow
  const FeedbackEscrow = await ethers.getContractFactory("FeedbackEscrow");
  const escrow = await FeedbackEscrow.deploy(usdcAddress, backendWallet, treasuryWallet);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("FeedbackEscrow deployed to:", escrowAddress);

  // 4. Summary
  console.log("\n=== Deployment Summary ===");
  console.log("MockUSDC:       ", usdcAddress);
  console.log("FeedbackEscrow: ", escrowAddress);
  console.log("Backend Wallet: ", backendWallet);
  console.log("Treasury Wallet:", treasuryWallet);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
