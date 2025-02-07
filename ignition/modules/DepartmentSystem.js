const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DepartmentSystem", (m) => {
  // Deploy DepartmentRegistry first
  const departmentRegistry = m.contract("DepartmentRegistry");

  // Deploy other contracts
  const proposalManager = m.contract("ProposalManager", [departmentRegistry]);
  const budgetController = m.contract("BudgetController", [departmentRegistry]);

  // Add contracts as super admins
  m.call(departmentRegistry, "addSuperAdmin", [budgetController], {
    id: "addBudgetControllerAsSuperAdmin",
  });

  m.call(departmentRegistry, "addSuperAdmin", [proposalManager], {
    id: "addProposalManagerAsSuperAdmin",
  });

  // Verify deployer is super admin
  m.call(departmentRegistry, "isSuperAdmin", [m.deployer], {
    id: "verifySuperAdmin",
  });

  return {
    departmentRegistry,
    proposalManager,
    budgetController,
  };
});
