const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Default USDC addresses
const MAINNET_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const TEST_USDC = "0x1234567890123456789012345678901234567890";

module.exports = buildModule("OneVault", (m) => {
  // Get deployment parameters with defaults
  const usdc = m.getParameter("usdc", TEST_USDC);
  const owner = m.getParameter("owner", m.getAccount(0));

  // Deploy Vault first
  const vault = m.contract("Vault", [owner, usdc], {
    from: owner,
    gasLimit: 5000000,
  });

  // Deploy Executor with Vault reference
  const executor = m.contract("Executor", [vault], {
    from: owner,
    gasLimit: 4000000,
  });

  return { vault, executor };
});
