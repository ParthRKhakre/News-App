require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { RPC_URL, PRIVATE_KEY, MUMBAI_RPC_URL, SEPOLIA_RPC_URL } = process.env;

const sharedAccounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL || RPC_URL || "",
      accounts: sharedAccounts
    },
    mumbai: {
      url: MUMBAI_RPC_URL || RPC_URL || "",
      accounts: sharedAccounts
    }
  }
};
