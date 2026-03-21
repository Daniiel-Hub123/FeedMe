import { network } from "hardhat";

async function main() {
  const { ethers, networkName } = await network.connect();

  console.log(`Deploying to ${networkName}...`);

  const factory = await ethers.getContractFactory("CertificateRegistry");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});