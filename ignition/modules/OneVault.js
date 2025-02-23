const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Default USDC address for Sonic testnet
const TEST_USDC = "0x1234567890123456789012345678901234567890";

module.exports = buildModule("OneVault", (m) => {
  try {
    // Get USDC address from parameters or use default
    const usdc = m.getParameter("usdc", TEST_USDC);

    // Get deployer account synchronously
    const deployer = m.getAccount(0);

    // Deploy Vault with explicit deployer address
    const vault = m.contract("contracts/Vault.sol:Vault", {
      args: [deployer, usdc],
      from: deployer,
    });

    // Deploy Executor with Vault reference
    const executor = m.contract("contracts/Executor.sol:Executor", {
      args: [vault],
      from: deployer,
    });

    return { vault, executor };
  } catch (error) {
    console.error("Deployment error:", error);
    throw error;
  }
});
