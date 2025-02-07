const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DepartmentSystem", async (m) => {
  // Deploy DepartmentRegistry first
  const departmentRegistry = m.contract("DepartmentRegistry");

  // Deploy ProposalManager with DepartmentRegistry address
  const proposalManager = m.contract("ProposalManager", [
    m.getAddress(departmentRegistry),
  ]);

  // Deploy BudgetController with DepartmentRegistry address
  const budgetController = m.contract("BudgetController", [
    m.getAddress(departmentRegistry),
  ]);

  // Add initialization steps
  const deployer = await m.getDeployer();

  // Add BudgetController as super admin in DepartmentRegistry
  m.call(departmentRegistry, "addSuperAdmin", [m.getAddress(budgetController)]);

  // Add ProposalManager as super admin in DepartmentRegistry
  m.call(departmentRegistry, "addSuperAdmin", [m.getAddress(proposalManager)]);

  return {
    departmentRegistry,
    proposalManager,
    budgetController,
  };
});
