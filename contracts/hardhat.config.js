require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../backend/.env" });


module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun"
    }
  },
  networks: {
    // Rede local para desenvolvimento rápido
    localhost: {
      url:     "http://127.0.0.1:8545",
      chainId: 31337
    },
    // Polygon Amoy Testnet — blockchain pública, sempre online
    amoy: {
      url:      process.env.RPC_URL_AMOY ?? "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
               ? [process.env.DEPLOYER_PRIVATE_KEY]
               : [],
      chainId:  80002
    }
  },
  paths: {
    sources:   "./core",
    artifacts: "./artifacts",
    cache:     "./cache"
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY ?? ""
    },
    customChains: [{
      network:  "polygonAmoy",
      chainId:  80002,
      urls: {
        apiURL:    "https://api-amoy.polygonscan.com/api",
        browserURL:"https://amoy.polygonscan.com"
      }
    }]
  }
};

