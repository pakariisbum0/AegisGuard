import { ethers } from "ethers";
import BudgetControllerABI from "../../artifacts/contracts/BudgetController.sol/BudgetController.json";
import DepartmentRegistryABI from "../../artifacts/contracts/DepartmentRegistry.sol/DepartmentRegistry.json";
import ProposalManagerABI from "../../artifacts/contracts/ProposalManager.sol/ProposalManager.json";
import ActivityTrackerABI from "../../artifacts/contracts/ActivityTracker.sol/ActivityTracker.json";
import { setupNetwork } from "@/lib/contracts/network";
import GovernanceTokenABI from "../../artifacts/contracts/GovernanceToken.sol/GovernanceToken.json";
import BudgetDAOABI from "../../artifacts/contracts/BudgetDAO.sol/BudgetDAO.json";

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  DEPARTMENT_REGISTRY: "0x17E55fcaB581B9C09180D1C7E61aDc8CDBB770b5",
  GOVERNANCE_TOKEN: "0xb6046fe3C6610F09AE21468b3AD0FFE0a577FC80",
  ACTIVITY_TRACKER: "0xe828a04F34faa1CCa116927f02a43A951df32cD9",
  BUDGET_DAO: "0xE7e79aDF7e419F166ECcb3a4243622A9a4ED9489",
  PROPOSAL_MANAGER: "0x1c53520e84F5FB138b4AC1BDC1EF846D186cd4f7",
  BUDGET_CONTROLLER: "0xD62117BF59c242FCe383afcD6BaB176B060c5C11",
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

// Add these new interfaces
interface DepartmentMetrics {
  totalDepartments: number;
  totalBudgets: bigint;
  approvedProposals: number;
  totalProjects: number;
  pendingTransactions: number;
  pendingProposals: number;
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

// Add new interfaces
interface DAOProposal {
  id: number;
  department: string;
  proposedBudget: bigint;
  votesFor: bigint;
  votesAgainst: bigint;
  startTime: number;
  endTime: number;
  executed: boolean;
}

export class DepartmentSystemActions {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private departmentRegistry: ethers.Contract;
  private budgetController: ethers.Contract;
  private proposalManager: ethers.Contract;
  private activityTracker: ethers.Contract;
  private governanceToken: ethers.Contract;
  private budgetDAO: ethers.Contract;

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

    this.governanceToken = new ethers.Contract(
      CONTRACT_ADDRESSES.GOVERNANCE_TOKEN,
      GovernanceTokenABI.abi,
      signer
    );

    this.budgetDAO = new ethers.Contract(
      CONTRACT_ADDRESSES.BUDGET_DAO,
      BudgetDAOABI.abi,
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
    department: string,
    txType: TransactionType,
    amount: string,
    description: string
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const amountWei = ethers.parseEther(amount);

      // Convert TransactionType to number
      const txTypeIndex = Object.values(TransactionType).indexOf(txType);

      // Create transaction
      const tx = await this.budgetController.createTransaction(
        txTypeIndex,
        amountWei,
        description
      );
      const receipt = await tx.wait();

      // Update total spent
      await this.updateTotalSpent(department, amountWei);

      // Log activity
      await this.logActivity(
        department,
        txType,
        amountWei,
        description,
        receipt.hash,
        "Completed"
      );

      return receipt;
    } catch (error) {
      console.error("Failed to create transaction:", error);
      throw error;
    }
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
      const senderAddress = await this.signer.getAddress();

      // Validate budget before submitting
      const validation = await this.validateProjectBudget(
        senderAddress,
        amount
      );
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

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

  // Add new methods for metrics
  async getDepartmentMetrics(): Promise<DepartmentMetrics> {
    try {
      // Get all departments
      const departments = await this.fetchAllDepartments();

      // Get all proposals
      const allProposals = await Promise.all(
        departments.map(async (dept) =>
          this.getProposalsByDepartment(dept.departmentHead)
        )
      );

      // Calculate metrics
      const totalBudgets = departments.reduce(
        (acc, dept) => acc + BigInt(ethers.parseEther(dept.budget)),
        BigInt(0)
      );

      // Flatten all proposals into a single array
      const flattenedProposals = allProposals.flat();

      // Count approved proposals (status 2 = APPROVED)
      const approvedProposals = flattenedProposals.filter(
        (p) => Number(p.status) === 2
      ).length;

      // Count pending proposals (status 0 = PENDING)
      const pendingProposals = flattenedProposals.filter(
        (p) => Number(p.status) === 0 || Number(p.status) === 1 // PENDING or UNDER_REVIEW
      ).length;

      // Get all transactions
      const allTransactions = await Promise.all(
        departments.map((dept) =>
          this.getTransactionsByDepartment(dept.departmentHead)
        )
      );

      // Count pending transactions (status 0 = PENDING)
      const pendingTransactions = allTransactions
        .flat()
        .filter((tx) => Number(tx.status) === 0).length;

      // Active projects is same as approved proposals
      const totalProjects = approvedProposals;

      return {
        totalDepartments: departments.length,
        totalBudgets,
        approvedProposals,
        totalProjects,
        pendingTransactions,
        pendingProposals,
      };
    } catch (error) {
      console.error("Failed to get department metrics:", error);
      throw error;
    }
  }

  // Add method to update budget allocation
  async updateBudgetAllocation(
    departmentAddress: string,
    newAllocation: bigint
  ): Promise<void> {
    try {
      // Update budget in smart contract
      const tx = await this.budgetController.updateTotalAllocated(
        departmentAddress,
        newAllocation
      );
      await tx.wait();

      // Log the activity
      await this.logActivity(
        departmentAddress,
        "Budget Allocation Update",
        newAllocation,
        "Budget allocation updated by admin",
        tx.hash,
        "Completed"
      );
    } catch (error) {
      console.error("Failed to update budget allocation:", error);
      throw error;
    }
  }

  // Update the getDepartmentBudgetData method
  async getDepartmentBudgetData(departmentAddress: string): Promise<{
    allocated: bigint;
    spent: bigint;
    remaining: bigint;
    efficiency: number;
  }> {
    try {
      // Get department details which includes budget and spent
      const details = await this.departmentRegistry.getDepartmentDetails(
        departmentAddress
      );

      // Convert string values to BigInt
      const allocated = ethers.parseEther(details.budget.toString());
      const spent = ethers.parseEther(details.spent.toString());

      // Calculate remaining and efficiency
      const remaining = allocated - spent;
      const efficiency = Number(
        ((Number(spent) / Number(allocated)) * 100).toFixed(2)
      );

      return {
        allocated,
        spent,
        remaining,
        efficiency,
      };
    } catch (error) {
      console.error("Failed to get budget data:", error);
      throw error;
    }
  }

  // Update the validateProjectBudget method to handle potential string conversion
  async validateProjectBudget(
    departmentAddress: string,
    amount: string
  ): Promise<{
    isValid: boolean;
    availableBudget: string;
    message?: string;
  }> {
    try {
      const budgetInfo = await this.getDepartmentBudgetData(departmentAddress);
      let requestedAmount: bigint;

      try {
        requestedAmount = ethers.parseEther(amount);
      } catch (error) {
        return {
          isValid: false,
          availableBudget: ethers.formatEther(budgetInfo.remaining),
          message: "Invalid amount format",
        };
      }

      const availableBudget = budgetInfo.remaining;

      if (requestedAmount > availableBudget) {
        return {
          isValid: false,
          availableBudget: ethers.formatEther(availableBudget),
          message: `Insufficient budget. Available: ${ethers.formatEther(
            availableBudget
          )} ETH`,
        };
      }

      return {
        isValid: true,
        availableBudget: ethers.formatEther(availableBudget),
      };
    } catch (error) {
      console.error("Failed to validate project budget:", error);
      throw error;
    }
  }

  // Update the updateTotalSpent method to use the contract's existing functions
  async updateTotalSpent(
    departmentAddress: string,
    amount: bigint
  ): Promise<void> {
    try {
      // Get current department details
      const details = await this.departmentRegistry.getDepartmentDetails(
        departmentAddress
      );
      const currentSpent = ethers.parseEther(details.spent.toString());
      const newSpent = currentSpent + amount;

      // Update spent amount using the contract's updateDepartmentSpent function
      const tx = await this.departmentRegistry.updateDepartmentSpent(
        departmentAddress,
        newSpent
      );
      await tx.wait();

      // Log the activity
      await this.logActivity(
        departmentAddress,
        "Total Spent Update",
        amount,
        "Total spent updated after transaction",
        tx.hash,
        "Completed"
      );
    } catch (error) {
      console.error("Failed to update total spent:", error);
      throw error;
    }
  }

  // Add DAO-related methods

  // Get governance token balance
  async getGovernanceTokenBalance(address: string): Promise<string> {
    const balance = await this.governanceToken.balanceOf(address);
    return ethers.formatEther(balance);
  }

  // Create a new budget proposal
  async createBudgetProposal(
    department: string,
    amount: string
  ): Promise<ethers.ContractTransaction> {
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await this.budgetDAO.proposeBudget(department, amountWei);
      return tx.wait();
    } catch (error) {
      console.error("Failed to create budget proposal:", error);
      throw error;
    }
  }

  // Check if user has voted on a proposal
  async hasVoted(proposalId: number, address: string): Promise<boolean> {
    try {
      // Get the proposal details first to verify it exists
      const proposal = await this.budgetDAO.getProposalDetails(proposalId);
      if (!proposal) return false;

      // Check if the address has voted
      const hasVoted = await this.budgetDAO.hasVoted(proposalId, address);
      return hasVoted;
    } catch (error) {
      console.error("Failed to check voting status:", error);
      return false; // Return false on error to allow voting attempt
    }
  }

  // Vote on a proposal
  async voteOnProposal(proposalId: number, support: boolean): Promise<any> {
    try {
      const tx = await this.budgetDAO.vote(proposalId, support);
      await tx.wait();

      // After successful vote, check if the proposal can be executed
      const proposal = await this.budgetDAO.getProposalDetails(proposalId);
      const now = Math.floor(Date.now() / 1000);

      // If voting period is over and proposal passed, execute it
      if (now > proposal.endTime && proposal.votesFor > proposal.votesAgainst) {
        try {
          const executeTx = await this.budgetDAO.executeProposal(proposalId);
          await executeTx.wait();
          console.log("Proposal executed successfully");
        } catch (error) {
          console.error("Failed to execute proposal:", error);
        }
      }

      return tx;
    } catch (error) {
      console.error("Failed to vote on proposal:", error);
      throw error;
    }
  }

  // Get proposal details
  async getProposalDetails(proposalId: number): Promise<DAOProposal> {
    try {
      const proposal = await this.budgetDAO.getProposalDetails(proposalId);
      return {
        id: proposalId,
        department: proposal.department,
        proposedBudget: proposal.proposedBudget,
        votesFor: proposal.votesFor,
        votesAgainst: proposal.votesAgainst,
        startTime: Number(proposal.startTime),
        endTime: Number(proposal.endTime),
        executed: proposal.executed,
      };
    } catch (error) {
      console.error("Failed to get proposal details:", error);
      throw error;
    }
  }

  // Get all active proposals
  async getActiveProposals(): Promise<DAOProposal[]> {
    try {
      const count = await this.budgetDAO.proposalCount();
      console.log("Total proposal count:", count);

      const proposals: DAOProposal[] = [];
      const now = Math.floor(Date.now() / 1000);

      // Iterate through all proposals
      for (let i = 1; i <= Number(count); i++) {
        try {
          const proposal = await this.budgetDAO.getProposalDetails(i);
          console.log(`Proposal ${i}:`, proposal);

          // Only include non-executed proposals that haven't ended
          if (!proposal.executed && Number(proposal.endTime) > now) {
            proposals.push({
              id: i,
              department: proposal.department,
              proposedBudget: proposal.proposedBudget,
              votesFor: proposal.votesFor,
              votesAgainst: proposal.votesAgainst,
              startTime: Number(proposal.startTime),
              endTime: Number(proposal.endTime),
              executed: proposal.executed,
            });
          }
        } catch (error) {
          console.error(`Failed to fetch proposal ${i}:`, error);
        }
      }

      console.log("Active proposals:", proposals);
      return proposals;
    } catch (error) {
      console.error("Failed to get active proposals:", error);
      throw error;
    }
  }

  // Get user's voting power
  async getVotingPower(address: string): Promise<string> {
    try {
      const balance = await this.governanceToken.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get voting power:", error);
      throw error;
    }
  }

  // Helper method to format proposal data for AI analysis
  async getProposalDataForAI(proposalId: number): Promise<any> {
    try {
      const proposal = await this.getProposalDetails(proposalId);
      const department = await this.getDepartmentDetails(proposal.department);

      return {
        proposalId: proposalId,
        department: department.name,
        currentBudget: ethers.formatEther(department.budget),
        proposedBudget: ethers.formatEther(proposal.proposedBudget),
        departmentEfficiency: department.efficiency,
        votingPower: {
          for: ethers.formatEther(proposal.votesFor),
          against: ethers.formatEther(proposal.votesAgainst),
        },
        timeline: {
          start: new Date(proposal.startTime * 1000).toISOString(),
          end: new Date(proposal.endTime * 1000).toISOString(),
        },
      };
    } catch (error) {
      console.error("Failed to get proposal data for AI:", error);
      throw error;
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
