import { ethers } from "ethers";
import BudgetControllerABI from "../../artifacts/contracts/BudgetController.sol/BudgetController.json";
import DepartmentRegistryABI from "../../artifacts/contracts/DepartmentRegistry.sol/DepartmentRegistry.json";
import ProposalManagerABI from "../../artifacts/contracts/ProposalManager.sol/ProposalManager.json";

// Contract addresses from deployment
const CONTRACT_ADDRESSES = {
  DEPARTMENT_REGISTRY: "0xD6060261Df228ACFA52197E449349dbF5443e979",
  BUDGET_CONTROLLER: "0x27c98C6Bb9Fc79Df5b14419538dAd0594851Ed4f",
  PROPOSAL_MANAGER: "0xe07CC12Ef3fa7922377Bb0D1B6f8194d16aeF938",
} as const;

export type TransactionType =
  | "BUDGET_ALLOCATION"
  | "PROJECT_FUNDING"
  | "BUDGET_UPDATE"
  | "EXPENSE";
export type ProposalStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export class DepartmentSystemActions {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private departmentRegistry: ethers.Contract;
  private budgetController: ethers.Contract;
  private proposalManager: ethers.Contract;

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;

    this.departmentRegistry = new ethers.Contract(
      CONTRACT_ADDRESSES.DEPARTMENT_REGISTRY,
      DepartmentRegistryABI.abi,
      signer
    );

    this.budgetController = new ethers.Contract(
      CONTRACT_ADDRESSES.BUDGET_CONTROLLER,
      BudgetControllerABI.abi,
      signer
    );

    this.proposalManager = new ethers.Contract(
      CONTRACT_ADDRESSES.PROPOSAL_MANAGER,
      ProposalManagerABI.abi,
      signer
    );
  }

  // Department Registry Actions
  async registerDepartment(
    departmentAddress: string,
    name: string,
    initialBudget: bigint,
    departmentHead: string,
    logoUri: string
  ): Promise<ethers.ContractTransaction> {
    if (!this.departmentRegistry.registerDepartment) {
      throw new Error("Contract method 'registerDepartment' not found");
    }

    const tx = await this.departmentRegistry.registerDepartment(
      departmentAddress,
      name,
      initialBudget,
      departmentHead,
      logoUri
    );

    const receipt = await tx.wait();
    return receipt;
  }

  async getDepartmentDetails(departmentAddress: string) {
    return this.departmentRegistry.getDepartmentDetails(departmentAddress);
  }

  async getAllDepartments() {
    return this.departmentRegistry.getAllDepartments();
  }

  // Budget Controller Actions
  async createTransaction(
    txType: TransactionType,
    amount: bigint,
    description: string
  ) {
    const typeIndex = [
      "BUDGET_ALLOCATION",
      "PROJECT_FUNDING",
      "BUDGET_UPDATE",
      "EXPENSE",
    ].indexOf(txType);
    const tx = await this.budgetController.createTransaction(
      typeIndex,
      amount,
      description
    );
    return tx.wait();
  }

  async processTransaction(transactionId: number) {
    const tx = await this.budgetController.processTransaction(transactionId);
    return tx.wait();
  }

  async getTransactionsByDepartment(department: string) {
    return this.budgetController.getTransactionsByDepartment(department);
  }

  // Proposal Manager Actions
  async submitProposal(
    title: string,
    amount: bigint,
    description: string,
    category: string
  ) {
    const tx = await this.proposalManager.submitProposal(
      title,
      amount,
      description,
      category
    );
    return tx.wait();
  }

  async reviewProposal(proposalId: number, newStatus: ProposalStatus) {
    const statusIndex = [
      "PENDING",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
    ].indexOf(newStatus);
    const tx = await this.proposalManager.reviewProposal(
      proposalId,
      statusIndex
    );
    return tx.wait();
  }

  async getProposalsByDepartment(department: string) {
    return this.proposalManager.getProposalsByDepartment(department);
  }

  async addProposalComment(proposalId: number, comment: string) {
    const tx = await this.proposalManager.addProposalComment(
      proposalId,
      comment
    );
    return tx.wait();
  }

  // Helper method to format amounts
  static formatAmount(amount: number | string): bigint {
    return ethers.parseEther(amount.toString());
  }

  // Add these new methods
  async isSuperAdmin(address: string): Promise<boolean> {
    return this.departmentRegistry.isSuperAdmin(address);
  }

  async getDeployerAdmin(): Promise<string> {
    const filter = this.departmentRegistry.filters.SystemPaused();
    const events = await this.departmentRegistry.queryFilter(
      filter,
      0,
      "latest"
    );
    if (events.length > 0) {
      return events[0].args?.admin;
    }
    throw new Error("No deployer admin found");
  }

  // Modified addSuperAdmin to only allow existing admins
  async addSuperAdmin(address: string) {
    const tx = await this.departmentRegistry.addSuperAdmin(address);
    const receipt = await tx.wait();
    return receipt;
  }
}

// Example usage:
/*
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const departmentSystem = new DepartmentSystemActions(provider, signer);

// Register a department
const amount = DepartmentSystemActions.formatAmount("100");
await departmentSystem.registerDepartment(
    "0x...",
    "Engineering",
    amount,
    "0x...",
    "https://example.com/logo.png"
);

// Submit a proposal
const proposalAmount = DepartmentSystemActions.formatAmount("10");
await departmentSystem.submitProposal(
    "New Project",
    proposalAmount,
    "Project description",
    "Development"
);
*/
