const { ethers } = require("hardhat");
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying com conta:", deployer.address);

  const DrugBatch = await ethers.getContractFactory("DrugBatch");
  const drugBatch = await DrugBatch.deploy(deployer.address);
  await drugBatch.waitForDeployment();
  const dbAddr = await drugBatch.getAddress();
  console.log("DrugBatch deployed:", dbAddr);

  const RecallManager = await ethers.getContractFactory("RecallManager");
  const recallManager = await RecallManager.deploy(deployer.address);
  await recallManager.waitForDeployment();
  const rmAddr = await recallManager.getAddress();
  console.log("RecallManager deployed:", rmAddr);

  const fs = require("fs");
  const addresses = {
    DrugBatch:     dbAddr,
    RecallManager: rmAddr,
    network:       (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt:    new Date().toISOString()
  };
  fs.writeFileSync(
    "../backend/src/core/contract-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Enderecos salvos em backend/src/core/contract-addresses.json");
}
main().catch(e => { console.error(e); process.exit(1); });
