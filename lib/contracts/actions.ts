import { ethers } from "ethers";
import BudgetControllerABI from "../../artifacts/contracts/BudgetController.sol/BudgetController.json";
import DepartmentRegistryABI from "../../artifacts/contracts/DepartmentRegistry.sol/DepartmentRegistry.json";
import ProposalManagerABI from "../../artifacts/contracts/ProposalManager.sol/ProposalManager.json";
import ActivityTrackerABI from "../../artifacts/contracts/ActivityTracker.sol/ActivityTracker.json";
import { setupNetwork } from "@/lib/contracts/network";

// Contract addresses from deployment
const CONTRACT_ADDRESSES = {
  DEPARTMENT_REGISTRY: "0x68de061DDf89dD58bea442eA033D0E1983ad0880",
  BUDGET_CONTROLLER: "0x372b4c6649C2F8D586a52d78d84f276FCfE16a8c",
  PROPOSAL_MANAGER: "0x6832C283e812a611422F026Dee8F198664C33Fe9",
  ACTIVITY_TRACKER: "0x3Bc23103bd1862F8E8EA02104d7b39B30f487f10",
} as const;

export enum TransactionType {
  BUDGET_ALLOCATION = "BUDGET_ALLOCATION",
  PROJECT_FUNDING = "PROJECT_FUNDING",
  BUDGET_UPDATE = "BUDGET_UPDATE",
  EXPENSE = "EXPENSE",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type ProposalStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface Department {
  name: string;
  budget: string;
  spent: string;
  efficiency: string;
  projects: number;
  isActive: boolean;
  departmentHead: string;
  logoUri: string;
}

export interface DepartmentTransaction {
  description: string;
  amount: string;
  date: string;
  status: string;
  ethAmount: string;
}

export interface DepartmentProposal {
  title: string;
  amount: string;
  status: string;
  submittedDate: string;
  ethAmount: string;
}

export interface DepartmentDetails {
  name: string;
  budget: {
    eth: string;
    usd: string;
  };
  projects: number;
  utilization: string;
  logo: string;
  departmentHead: string;
  address: string;
  activeProposals: {
    title: string;
    amount: string;
    status: string;
    submittedDate: string;
  }[];
  recentActivity: {
    type: string;
    amount: string;
    date: string;
    status: string;
    txHash: string;
  }[];
}

// Add this interface for price API responses
interface PriceResponse {
  success: boolean;
  price: number;
}

// Add these interfaces near other interfaces
export interface Transaction {
  id: string;
  department: string;
  type: TransactionType;
  amount: string;
  description: string;
  status: TransactionStatus;
  timestamp: string;
  from?: string;
  to?: string;
}

// Add this interface to match the contract's transaction functions
// interface IBudgetController {
//   createTransaction(
//     txType: number,
//     amount: bigint,
//     description: string
//   ): Promise<ethers.ContractTransactionResponse>;
//   getTransactionsByDepartment(department: string): Promise<
//     Array<{
//       id: bigint;
//       department: string;
//       txType: number;
//       amount: bigint;
//       description: string;
//       status: number;
//       timestamp: bigint;
//     }>
//   >;
// }

export class DepartmentSystemActions {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private departmentRegistry: ethers.Contract;
  private budgetController: ethers.Contract;
  private proposalManager: ethers.Contract;
  private activityTracker: ethers.Contract;

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
    ) as IBudgetController & ethers.Contract;

    this.proposalManager = new ethers.Contract(
      CONTRACT_ADDRESSES.PROPOSAL_MANAGER,
      ProposalManagerABI.abi,
      signer
    );

    this.activityTracker = new ethers.Contract(
      CONTRACT_ADDRESSES.ACTIVITY_TRACKER,
      ActivityTrackerABI.abi,
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

  async processTransaction(
    transactionId: number,
    notes: string = ""
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      // Get transaction details first
      const transaction = await this.budgetController.getTransaction(
        transactionId
      );

      // Validate transaction status
      if (transaction.status !== 0) {
        // 0 = PENDING
        throw new Error("Transaction is not in pending status");
      }

      // Process the transaction
      const tx = await this.budgetController.processTransaction(transactionId);

      // Log the activity
      await this.logActivity(
        transaction.department,
        `Process Transaction #${transactionId}`,
        transaction.amount,
        notes || transaction.description,
        tx.hash,
        "Completed"
      );

      return tx;
    } catch (error) {
      console.error("Failed to process transaction:", error);
      throw error;
    }
  }

  async getTransactionsByDepartment(department: string) {
    return this.budgetController.getTransactionsByDepartment(department);
  }

  // Proposal Manager Actions
  async submitProposal(
    title: string,
    amount: string,
    description: string,
    category: string
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const amountWei = DepartmentSystemActions.formatAmount(amount);
      const tx = await this.proposalManager.submitProposal(
        title,
        amountWei,
        JSON.stringify({
          description,
          category,
          timestamp: Date.now(),
        }),
        category
      );
      return tx;
    } catch (error) {
      console.error("Failed to submit proposal:", error);
      throw error;
    }
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

  // Add this new method
  async fetchAllDepartments(): Promise<Department[]> {
    try {
      // Get all department addresses
      const departmentAddresses = await this.getAllDepartments();

      // Fetch details for each department
      const departmentDetails = await Promise.all(
        departmentAddresses.map(async (address) => {
          const details = await this.getDepartmentDetails(address);
          return {
            name: details.name,
            budget: ethers.formatEther(details.budget),
            spent: ethers.formatEther(details.spent),
            efficiency: `${details.efficiency}%`,
            projects: Number(details.projects),
            isActive: details.isActive,
            departmentHead: details.departmentHead,
            logoUri: details.logoUri,
          };
        })
      );

      return departmentDetails;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  }

  // Add these new authentication methods
  static async connectWallet() {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Please install MetaMask to continue");
    }

    await setupNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    return { provider, signer };
  }

  async authenticateUser(
    role: "admin" | "department",
    departmentName?: string
  ) {
    try {
      const userAddress = await this.signer.getAddress();

      if (role === "admin") {
        const isAdmin = await this.isSuperAdmin(userAddress);
        if (!isAdmin) {
          throw new Error("You are not authorized as a super admin");
        }
        return { isAuthenticated: true, redirectPath: "/admin/dashboard" };
      } else {
        if (!departmentName) {
          throw new Error("Please select a department");
        }

        const departments = await this.fetchAllDepartments();
        const department = departments.find((d) => d.name === departmentName);

        if (!department) {
          throw new Error("Department not found");
        }

        if (
          department.departmentHead.toLowerCase() !== userAddress.toLowerCase()
        ) {
          throw new Error("You are not authorized for this department");
        }

        return {
          isAuthenticated: true,
          redirectPath: `/dashboard/${departmentName
            .toLowerCase()
            .replace(/ /g, "-")}`,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async fetchActiveDepartments(): Promise<Department[]> {
    try {
      const departments = await this.fetchAllDepartments();
      const activeDepartments = departments.filter((d) => d.isActive);
      console.log("Active departments:", activeDepartments); // Debug log
      return activeDepartments;
    } catch (error) {
      console.error("Error fetching active departments:", error);
      throw error;
    }
  }

  // Updated ETH to USD conversion method
  private async getEthToUsdRate(): Promise<number> {
    const apis = [
      {
        url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        handler: async (response: any): Promise<PriceResponse> => ({
          success: true,
          price: response.ethereum?.usd || 0,
        }),
      },
      {
        url: "https://api.coinbase.com/v2/prices/ETH-USD/spot",
        handler: async (response: any): Promise<PriceResponse> => ({
          success: true,
          price: parseFloat(response.data?.amount) || 0,
        }),
      },
      {
        url: "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
        handler: async (response: any): Promise<PriceResponse> => ({
          success: true,
          price: response.USD || 0,
        }),
      },
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        if (!response.ok) continue;

        const data = await response.json();
        const result = await api.handler(data);

        if (result.success && result.price > 0) {
          console.log(`ETH/USD Rate: $${result.price}`);
          return result.price;
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${api.url}:`, error);
        continue;
      }
    }

    // Fallback price if all APIs fail
    console.warn("Using fallback ETH price");
    return 3000;
  }

  private async convertEthToUsd(ethAmount: string): Promise<string> {
    try {
      const rate = await this.getEthToUsdRate();
      const usdAmount = parseFloat(ethAmount) * rate;

      // Format with proper currency notation
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdAmount);
    } catch (error) {
      console.error("Error converting ETH to USD:", error);
      // Return a formatted fallback calculation
      const fallbackRate = 3000;
      const usdAmount = parseFloat(ethAmount) * fallbackRate;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdAmount);
    }
  }

  async getDepartmentDetailsBySlug(slug: string): Promise<DepartmentDetails> {
    try {
      const network = await this.provider.getNetwork();
      console.log("Current network:", network); // Debug log

      // Get all departments and find the one matching the slug
      const departments = await this.fetchAllDepartments();
      const department = departments.find(
        (d) => d.name.toLowerCase().replace(/ /g, "-") === slug
      );

      if (!department) {
        throw new Error(`Department with slug '${slug}' not found`);
      }

      console.log("Found department:", department); // Debug log

      // Get transactions and proposals with error handling
      let transactions = [];
      let proposals = [];
      try {
        transactions = await this.getTransactionsByDepartment(
          department.departmentHead
        );
        console.log("Fetched transactions:", transactions); // Debug log
      } catch (error) {
        console.warn("Failed to fetch transactions:", error);
      }

      try {
        proposals = await this.getProposalsByDepartment(
          department.departmentHead
        );
        console.log("Fetched proposals:", proposals); // Debug log
      } catch (error) {
        console.warn("Failed to fetch proposals:", error);
      }

      // Get ETH/USD rate
      const ethRate = await this.getEthToUsdRate();
      console.log("ETH/USD Rate:", ethRate); // Debug log

      // Format transactions
      const formattedTransactions = transactions.map((tx: any) => ({
        description: tx.description || "",
        ethAmount: ethers.formatEther(tx.amount || 0),
        amount: this.convertEthToUsd(ethers.formatEther(tx.amount || 0)),
        date: new Date(Number(tx.timestamp || 0) * 1000).toISOString(),
        status: tx.status || "Pending",
      }));

      // Format proposals
      const formattedProposals = proposals.map((p: any) => ({
        title: p.title || "",
        ethAmount: ethers.formatEther(p.amount || 0),
        amount: this.convertEthToUsd(ethers.formatEther(p.amount || 0)),
        status:
          ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"][p.status] ||
          "PENDING",
        submittedDate: new Date(Number(p.timestamp || 0) * 1000).toISOString(),
      }));

      // Get recent activities with error handling
      let recentActivities = [];
      try {
        recentActivities = await this.getRecentActivities(
          department.departmentHead
        );
        console.log("Fetched activities:", recentActivities); // Debug log
      } catch (error) {
        console.warn("Failed to fetch recent activities:", error);
      }

      // Format and return department details
      return {
        name: department.name,
        budget: {
          eth: `${department.budget} ETH`,
          usd: await this.convertEthToUsd(department.budget),
        },
        projects: department.projects,
        utilization: department.efficiency,
        logo: department.logoUri,
        departmentHead: department.departmentHead,
        address: department.departmentHead,
        activeProposals: formattedProposals,
        recentActivity: recentActivities,
      };
    } catch (error) {
      console.error("Error in getDepartmentDetailsBySlug:", error);
      throw new Error(`Failed to fetch department details: ${error.message}`);
    }
  }

  async logActivity(
    department: string,
    activityType: string,
    amount: bigint,
    description: string,
    txHash: string,
    status: "Completed" | "Pending"
  ): Promise<void> {
    try {
      const tx = await this.activityTracker.logActivity(
        department,
        activityType,
        amount,
        description,
        txHash,
        status
      );
      await tx.wait();
    } catch (error) {
      console.error("Failed to log activity:", error);
      throw error;
    }
  }

  async updateDepartmentBudget(
    departmentAddress: string,
    newBudgetEth: string,
    description: string = "Budget Update"
  ): Promise<ethers.ContractTransaction> {
    try {
      const newBudgetWei = ethers.parseEther(newBudgetEth);
      const tx = await this.departmentRegistry.updateBudget(
        departmentAddress,
        newBudgetWei
      );
      const receipt = await tx.wait();

      // Log the activity
      await this.logActivity(
        departmentAddress,
        "BUDGET_UPDATE",
        newBudgetWei,
        description,
        receipt.hash,
        "Completed"
      );

      // Create a transaction record in BudgetController
      await this.budgetController.createTransaction(
        2, // TransactionType.BUDGET_UPDATE
        newBudgetWei,
        description
      );

      // Fetch updated department details to confirm the change
      const updatedDetails = await this.getDepartmentDetails(departmentAddress);
      console.log("Budget updated successfully:", {
        department: departmentAddress,
        newBudget: ethers.formatEther(updatedDetails.budget),
        txHash: receipt.hash,
      });

      return receipt;
    } catch (error) {
      console.error("Failed to update department budget:", error);
      throw error;
    }
  }

  // Add a helper method to validate budget updates
  async validateBudgetUpdate(
    departmentAddress: string,
    newBudgetEth: string
  ): Promise<{
    isValid: boolean;
    currentBudget: string;
    difference: string;
    message?: string;
  }> {
    try {
      const details = await this.getDepartmentDetails(departmentAddress);
      const currentBudgetEth = ethers.formatEther(details.budget);
      const difference =
        parseFloat(newBudgetEth) - parseFloat(currentBudgetEth);

      // Add your validation rules here
      if (parseFloat(newBudgetEth) <= 0) {
        return {
          isValid: false,
          currentBudget: currentBudgetEth,
          difference: difference.toString(),
          message: "Budget must be greater than 0",
        };
      }

      // You can add more validation rules as needed

      return {
        isValid: true,
        currentBudget: currentBudgetEth,
        difference: difference.toString(),
      };
    } catch (error) {
      console.error("Budget validation failed:", error);
      throw error;
    }
  }

  // Add method to fetch recent activities
  async getRecentActivities(department: string, limit: number = 10) {
    try {
      const activities = await this.activityTracker.getRecentActivities(
        department,
        limit
      );
      return activities.map((activity: any) => ({
        type: activity.activityType,
        amount: ethers.formatEther(activity.amount),
        date: new Date(Number(activity.timestamp) * 1000).toISOString(),
        status: activity.status,
        txHash: activity.txHash,
        description: activity.description,
      }));
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
      return [];
    }
  }

  async getTransactionDetails(transactionId: number): Promise<Transaction> {
    try {
      const tx = await this.budgetController.getTransaction(transactionId);
      return {
        id: transactionId.toString(),
        department: tx.department,
        type: TransactionType[tx.txType],
        amount: ethers.formatEther(tx.amount),
        description: tx.description || "",
        status: TransactionStatus[tx.status],
        timestamp: tx.timestamp.toString(),
      };
    } catch (error) {
      console.error("Failed to get transaction details:", error);
      throw error;
    }
  }

  async getPendingTransactions(department: string): Promise<Transaction[]> {
    try {
      const transactions =
        await this.budgetController.getTransactionsByDepartment(department);
      return transactions
        .filter((tx: any) => tx.status === 0) // Filter PENDING transactions
        .map((tx: any) => ({
          id: tx.id.toString(),
          department: tx.department,
          type: TransactionType[tx.txType],
          amount: ethers.formatEther(tx.amount),
          description: tx.description,
          status: TransactionStatus[tx.status],
          timestamp: new Date(Number(tx.timestamp) * 1000).toISOString(),
          from: tx.department,
          to: tx.department, // In real implementation, this would be the recipient
        }));
    } catch (error) {
      console.error("Failed to get pending transactions:", error);
      throw error;
    }
  }

  // Add this method to DepartmentSystemActions class
  async createPendingTransaction(
    department: string,
    type: TransactionType,
    amount: string,
    description: string
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const senderAddress = await this.signer.getAddress();

      // Check if sender is a department head in the registry
      const isDepartmentHead = await this.departmentRegistry.departmentHeads(
        senderAddress
      );

      if (!isDepartmentHead) {
        throw new Error("Only department heads can create transactions");
      }

      // Get department details
      const departmentDetails =
        await this.departmentRegistry.getDepartmentDetails(department);

      // Verify sender is the head of this specific department
      if (
        departmentDetails.departmentHead.toLowerCase() !==
        senderAddress.toLowerCase()
      ) {
        throw new Error("You are not the head of this department");
      }

      const amountWei = ethers.parseEther(amount);

      // Convert TransactionType to number index
      let txTypeIndex: number;
      switch (type) {
        case TransactionType.BUDGET_ALLOCATION:
          txTypeIndex = 0;
          break;
        case TransactionType.PROJECT_FUNDING:
          txTypeIndex = 1;
          break;
        case TransactionType.BUDGET_UPDATE:
          txTypeIndex = 2;
          break;
        case TransactionType.EXPENSE:
          txTypeIndex = 3;
          break;
        default:
          throw new Error("Invalid transaction type");
      }

      // Call createTransaction instead of submitTransaction
      const tx = await this.budgetController.createTransaction(
        txTypeIndex,
        amountWei,
        description
      );

      return tx;
    } catch (error) {
      console.error("Failed to create transaction:", error);
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
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
