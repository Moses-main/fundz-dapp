const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const FundLoom = await hre.ethers.getContractFactory("FundLoom");
  const fundLoom = await FundLoom.deploy();
  await fundLoom.waitForDeployment();

  console.log("FundLoom deployed to:", await fundLoom.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
