const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const {
  updateContractAddresses,
} = require("../../scripts/update-contract-addresses");
const { ethers } = require("ethers");

module.exports = buildModule("DepartmentSystem", (m) => {
  const deployer = m.getAccount(0);

  // Deploy base contracts
  const departmentRegistry = m.contract("DepartmentRegistry", [], {
    from: deployer,
  });

  // Deploy governance token
  const governanceToken = m.contract("GovernanceToken", [], {
    from: deployer,
  });

  // Deploy BudgetDAO first (we'll link it later)
  const budgetDAO = m.contract(
    "BudgetDAO",
    [
      governanceToken,
      "0x0000000000000000000000000000000000000000",
      departmentRegistry,
    ],
    { from: deployer }
  );

  // Now deploy other contracts with proper references
  const budgetController = m.contract(
    "BudgetController",
    [departmentRegistry, budgetDAO],
    { from: deployer }
  );

  const proposalManager = m.contract("ProposalManager", [departmentRegistry], {
    from: deployer,
  });

  const activityTracker = m.contract("ActivityTracker", [departmentRegistry], {
    from: deployer,
  });

  // Update BudgetDAO with correct BudgetController address
  m.call(budgetDAO, "setBudgetController", [budgetController], {
    id: "updateBudgetDAOController",
    from: deployer,
  });

  // Set up permissions
  m.call(departmentRegistry, "addSuperAdmin", [budgetController], {
    id: "addBudgetControllerAsSuperAdmin",
    from: deployer,
  });

  m.call(departmentRegistry, "addSuperAdmin", [proposalManager], {
    id: "addProposalManagerAsSuperAdmin",
    from: deployer,
  });

  m.call(departmentRegistry, "addSuperAdmin", [activityTracker], {
    id: "addActivityTrackerAsSuperAdmin",
    from: deployer,
  });

  m.call(departmentRegistry, "addSuperAdmin", [budgetDAO], {
    id: "addBudgetDAOAsSuperAdmin",
    from: deployer,
  });

  // Mint initial governance tokens to deployer
  m.call(governanceToken, "mint", [deployer, ethers.parseEther("1000000")], {
    id: "mintInitialTokens",
    from: deployer,
  });

  return {
    departmentRegistry,
    proposalManager,
    budgetController,
    activityTracker,
    governanceToken,
    budgetDAO,
  };
});
