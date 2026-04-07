const fs = require("node:fs");
const path = require("node:path");
const hre = require("hardhat");

async function main() {
  const NewsVerification = await hre.ethers.getContractFactory("NewsVerification");
  const contract = await NewsVerification.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const artifact = await hre.artifacts.readArtifact("NewsVerification");
  const outputDir = path.join(__dirname, "..", "deployments");
  const outputFile = path.join(outputDir, `${hre.network.name}.json`);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    outputFile,
    JSON.stringify(
      {
        network: hre.network.name,
        contractAddress: address,
        abi: artifact.abi
      },
      null,
      2
    )
  );

  console.log(`NewsVerification deployed to ${address}`);
  console.log(`ABI written to ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
