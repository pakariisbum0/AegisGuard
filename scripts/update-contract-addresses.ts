import fs from "fs";
import path from "path";

export function updateContractAddresses(addresses: {
  DEPARTMENT_REGISTRY: string;
  BUDGET_CONTROLLER: string;
  PROPOSAL_MANAGER: string;
}) {
  try {
    // Get the project root directory
    const projectRoot = path.resolve(__dirname, "..");

    // Construct the path to actions.ts
    const actionsPath = path.join(
      projectRoot,
      "lib",
      "contracts",
      "actions.ts"
    );

    // Check if file exists
    if (!fs.existsSync(actionsPath)) {
      throw new Error(`File not found: ${actionsPath}`);
    }

    // Read the file content
    let content = fs.readFileSync(actionsPath, "utf8");

    // Update contract addresses
    const addressUpdates = {
      DEPARTMENT_REGISTRY: addresses.DEPARTMENT_REGISTRY,
      BUDGET_CONTROLLER: addresses.BUDGET_CONTROLLER,
      PROPOSAL_MANAGER: addresses.PROPOSAL_MANAGER,
    };

    // Replace each address in the content
    Object.entries(addressUpdates).forEach(([key, value]) => {
      const regex = new RegExp(`${key}: "0x[a-fA-F0-9]+"`, "g");
      content = content.replace(regex, `${key}: "${value}"`);
    });

    // Write the updated content back to the file
    fs.writeFileSync(actionsPath, content);
    console.log("✅ Contract addresses updated in actions.ts");
    console.log("Updated addresses:", addressUpdates);
  } catch (error) {
    console.error("❌ Error updating contract addresses:", error);
    throw error;
  }
}
