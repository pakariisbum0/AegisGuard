const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const {
  updateContractAddresses,
} = require("../../scripts/update-contract-addresses");

module.exports = buildModule("DepartmentSystem", (m) => {
  const deployer = m.getAccount(0);

  const departmentRegistry = m.contract("DepartmentRegistry", [], {
    from: deployer,
  });
  const proposalManager = m.contract("ProposalManager", [departmentRegistry], {
    from: deployer,
  });
  const budgetController = m.contract(
    "BudgetController",
    [departmentRegistry],
    { from: deployer }
  );

  const activityTracker = m.contract("ActivityTracker", [departmentRegistry], {
    from: deployer,
  });

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

  return {
    departmentRegistry,
    proposalManager,
    budgetController,
    activityTracker,
  };
});
