const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to network:", hre.network.name);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy PublisherRegistry
  console.log("\nDeploying PublisherRegistry...");
  const PublisherRegistry = await hre.ethers.getContractFactory("contracts/PublisherRegistry.sol:PublisherRegistry");
  const publisherRegistry = await PublisherRegistry.deploy();
  await publisherRegistry.waitForDeployment();
  const publisherRegistryAddress = await publisherRegistry.getAddress();
  console.log("PublisherRegistry deployed to:", publisherRegistryAddress);

  // Deploy BatchAnchor
  console.log("\nDeploying BatchAnchor...");
  const BatchAnchor = await hre.ethers.getContractFactory("BatchAnchor");
  const batchAnchor = await BatchAnchor.deploy(publisherRegistryAddress);
  await batchAnchor.waitForDeployment();
  const batchAnchorAddress = await batchAnchor.getAddress();
  console.log("BatchAnchor deployed to:", batchAnchorAddress);

  // Verify contracts on Etherscan (if on testnet/mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nVerifying contracts on block explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: publisherRegistryAddress,
        constructorArguments: [],
      });
      console.log("PublisherRegistry verified!");
    } catch (error) {
      console.log("PublisherRegistry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: batchAnchorAddress,
        constructorArguments: [publisherRegistryAddress],
      });
      console.log("BatchAnchor verified!");
    } catch (error) {
      console.log("BatchAnchor verification failed:", error.message);
    }
  }

  console.log("\nDeployment complete!");
  console.log("\nContract addresses:");
  console.log("PublisherRegistry:", publisherRegistryAddress);
  console.log("BatchAnchor:", batchAnchorAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
