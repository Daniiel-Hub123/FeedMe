import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // ⚠️ Replace this with the MockUSDC address from your deployment
  const USDC_ADDRESS = process.env.USDC_CONTRACT_ADDRESS || "0x1964c5659102E332EF3a9C7317a7a83f7DA21888";
  
  const usdc = await ethers.getContractAt("MockUSDC", USDC_ADDRESS);
  
  // Mint 10,000 USDC (6 decimals) to the deployer wallet
  const amount = ethers.parseUnits("10000", 6);
  
  console.log(`Minting 10,000 USDC to ${deployer.address}...`);
  const tx = await usdc.mint(deployer.address, amount);
  await tx.wait();
  
  const balance = await usdc.balanceOf(deployer.address);
  console.log(`Balance: ${ethers.formatUnits(balance, 6)} USDC`);
  console.log("Done!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
