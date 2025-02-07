const fs = require("fs");
const path = require("path");

// Path to the generated contract addresses file
const addressesFilePath = path.join(__dirname, "../src/contractAddresses.ts");

// Function to update the contract addresses file
function updateContractAddresses(addresses) {
  const content = `// Auto-generated file. Do not edit manually.
  export const CONTRACT_ADDRESSES = {
    DEPARTMENT_REGISTRY: "${addresses.departmentRegistry}",
    BUDGET_CONTROLLER: "${addresses.budgetController}",
    PROPOSAL_MANAGER: "${addresses.proposalManager}",
  } as const;
  `;
  fs.writeFileSync(addressesFilePath, content);
  console.log("Contract addresses have been updated in contractAddresses.ts");
}

module.exports = { updateContractAddresses };
