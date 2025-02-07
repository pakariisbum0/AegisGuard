require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Replace file reading with environment variable
const privateKey = process.env.WALLET_PRIVATE_KEY_FLOW;

/** @type import('hardhat/config').HardhatUserConfig */
// npx hardhat ignition deploy ./ignition/modules/TherapyConsent.js --network baseSepolia
module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
      chainId: 4202,
    },
    Flow: {
      url: "https://testnet.evm.nodes.onflow.org",
      accounts: [privateKey],
      gasPrice: 1000000000,
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  allowUnlimitedContractSize: true,
  throwOnTransactionFailures: true,
  throwOnCallFailures: true,
  loggingEnabled: true,
};
