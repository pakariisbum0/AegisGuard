"use client";

import { Space_Grotesk } from "next/font/google";
import { Header } from "@/app/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateBudgetModal } from "@/app/components/UpdateBudgetModal";
import {
  DepartmentSystemActions,
  DepartmentDetails,
  Transaction,
} from "@/lib/contracts/actions";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet,
  BarChart3,
  RefreshCcw,
} from "lucide-react";
import { ProcessTransactionModal } from "@/app/components/ProcessTransactionModal";
import { CreateTransactionModal } from "@/app/components/CreateTransactionModal";

// import { useToast } from "@/components/ui/use-toast";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

// Add form state types
interface ProposalForm {
  title: string;
  amount: string;
  description: string;
  category: "development" | "research" | "infrastructure" | "operational";
}

interface BudgetUpdateForm {
  amount: string;
  reason: string;
  category: string;
}

// Add this interface near other interfaces
interface ProjectForm {
  title: string;
  description: string;
  amount: string;
  category: "development" | "research" | "infrastructure" | "operational";
  timeline: string;
  objectives: string;
}

// Add this mock data near other data constants
const budgetData = [
  { month: "Jan", allocated: 64.2, spent: 62.4 },
  { month: "Feb", allocated: 58.7, spent: 56.9 },
  { month: "Mar", allocated: 71.3, spent: 67.8 },
  { month: "Apr", allocated: 63.4, spent: 60.2 },
  { month: "May", allocated: 69.2, spent: 65.7 },
  { month: "Jun", allocated: 74.5, spent: 70.1 },
  { month: "Jul", allocated: 61.8, spent: 59.3 },
  { month: "Aug", allocated: 68.3, spent: 64.8 },
];

// Add this type definition
interface ActivityItem {
  type: string;
  amount: string;
  date: string;
  status: "Completed" | "Pending";
  txHash: string;
  category?: "transfer" | "budget" | "proposal";
  description?: string;
}

// Create a helper function to determine activity icon and color
const getActivityStyles = (activity: ActivityItem) => {
  const styles = {
    transfer: {
      icon: activity.type.toLowerCase().includes("incoming") ? (
        <ArrowDownRight size={18} />
      ) : (
        <ArrowUpRight size={18} />
      ),
      bgColor: activity.type.toLowerCase().includes("incoming")
        ? "bg-emerald-50 text-emerald-600"
        : "bg-blue-50 text-blue-600",
    },
    budget: {
      icon: <BarChart3 size={18} />,
      bgColor: "bg-purple-50 text-purple-600",
    },
    proposal: {
      icon: <RefreshCcw size={18} />,
      bgColor: "bg-amber-50 text-amber-600",
    },
  };

  return styles[activity.category || "transfer"];
};

export default function DepartmentDashboard({
  params,
}: {
  params: { department: string };
}) {
  const { toast } = useToast();
  const [departmentData, setDepartmentData] =
    useState<DepartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [showBudgetUpdate, setShowBudgetUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalForm, setProposalForm] = useState<ProposalForm>({
    title: "",
    amount: "",
    description: "",
    category: "development",
  });
  const [budgetForm, setBudgetForm] = useState<BudgetUpdateForm>({
    amount: "",
    reason: "",
    category: "operational",
  });
  const [formErrors, setFormErrors] = useState<Partial<ProposalForm>>({});
  const [isUpdateBudgetModalOpen, setIsUpdateBudgetModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    title: "",
    description: "",
    amount: "",
    category: "development",
    timeline: "",
    objectives: "",
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isProcessTransactionModalOpen, setIsProcessTransactionModalOpen] =
    useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>(
    []
  );
  const [isCreateTransactionModalOpen, setIsCreateTransactionModalOpen] =
    useState(false);

  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        setLoading(true);
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);
        const details = await departmentSystem.getDepartmentDetailsBySlug(
          params.department
        );
        setDepartmentData(details);
      } catch (err) {
        console.error("Failed to fetch department details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch department details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentDetails();
  }, [params.department]);

  useEffect(() => {
    const fetchPendingTransactions = async () => {
      if (departmentData) {
        try {
          const { provider, signer } =
            await DepartmentSystemActions.connectWallet();
          const departmentSystem = new DepartmentSystemActions(
            provider,
            signer
          );
          const pending = await departmentSystem.getPendingTransactions(
            departmentData.address
          );
          setPendingTransactions(pending);
        } catch (error) {
          console.error("Failed to fetch pending transactions:", error);
        }
      }
    };

    fetchPendingTransactions();
  }, [departmentData]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-16 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              {/* Add loading skeleton here */}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !departmentData) {
    return (
      <>
        <Header />
        <main className="pt-16 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {error || "Department not found"}
              </h2>
              <button
                onClick={() => router.push("/departments")}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                ← Back to Departments
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Add validation function
  const validateProposalForm = (form: ProposalForm) => {
    const errors: Partial<Record<keyof ProposalForm, string>> = {};

    if (!form.title.trim()) {
      errors.title = "Title is required";
    }

    if (!form.amount.trim()) {
      errors.amount = "Amount is required";
    } else if (!/^\d*\.?\d+$/.test(form.amount)) {
      errors.amount = "Invalid amount format. Please enter a valid number";
    }

    if (!form.description.trim()) {
      errors.description = "Description is required";
    }

    if (!form.category) {
      errors.category = "Category is required";
    }

    return errors;
  };

  // Add form submission handler
  const handleProposalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateProposalForm(proposalForm);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        // Submit the proposal to the blockchain
        const tx = await departmentSystem.submitProposal(
          proposalForm.title,
          proposalForm.amount,
          proposalForm.description,
          proposalForm.category
        );

        // Log the activity
        await departmentSystem.logActivity(
          departmentData.address,
          "New Proposal",
          DepartmentSystemActions.formatAmount(proposalForm.amount),
          proposalForm.description,
          tx.hash,
          "Pending"
        );

        toast({
          title: "Proposal Submitted",
          description: "Your proposal has been successfully submitted.",
          variant: "default",
        });

        // Reset form and close modal
        setProposalForm({
          title: "",
          amount: "",
          description: "",
          category: "development",
        });
        setShowNewProposal(false);

        // Refresh department data
        const updatedDetails =
          await departmentSystem.getDepartmentDetailsBySlug(params.department);
        setDepartmentData(updatedDetails);
      } catch (error) {
        console.error("Failed to submit proposal:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to submit proposal",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateBudget = () => {
    setIsUpdateBudgetModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpdateBudgetModalOpen(false);
  };

  // Add this function to handle successful budget updates
  const handleBudgetUpdateSuccess = async () => {
    handleCloseModal();
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);
      const details = await departmentSystem.getDepartmentDetailsBySlug(
        params.department
      );
      setDepartmentData(details);

      toast({
        title: "Budget Updated",
        description: "Department budget has been successfully updated.",
        variant: "default",
        duration: 5000,
      });
    } catch (err) {
      console.error("Failed to refresh department details:", err);
      // Since the update likely succeeded but refresh failed
      toast({
        title: "Budget Updated",
        description:
          "Budget updated successfully. Please refresh to see the latest changes.",
        variant: "default", // Keep default since it's still a success case
        duration: 5000,
      });
    }
  };

  // Add this handler function
  const handleProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      await departmentSystem.submitProposal(
        projectForm.title,
        DepartmentSystemActions.formatAmount(projectForm.amount),
        JSON.stringify({
          description: projectForm.description,
          timeline: projectForm.timeline,
          objectives: projectForm.objectives,
        }),
        projectForm.category
      );

      toast({
        title: "Project Created",
        description: "Your project has been successfully submitted for review.",
        variant: "default",
        duration: 5000,
      });

      setIsNewProjectModalOpen(false);
      setProjectForm({
        title: "",
        description: "",
        amount: "",
        category: "development",
        timeline: "",
        objectives: "",
      });

      // Refresh department data
      const details = await departmentSystem.getDepartmentDetailsBySlug(
        params.department
      );
      setDepartmentData(details);
    } catch (err) {
      console.error("Failed to create project:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create project",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the Recent Activity section in the component
  const RecentActivity = () => {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 max-w-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
          >
            Recent Activity
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              Completed
            </span>
            <span className="w-px h-4 bg-gray-200" />
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              Pending
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {departmentData.recentActivity?.map((activity: ActivityItem, i) => {
            const styles = getActivityStyles(activity);

            return (
              <div
                key={i}
                className="group p-4 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
              >
                <div className="flex items-start gap-4">
                  {/* Icon Column */}
                  <div
                    className={`p-2 rounded-full shrink-0 ${styles.bgColor}`}
                  >
                    {styles.icon}
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Status Row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-medium text-gray-900 truncate">
                        {activity.type}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          activity.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {activity.status === "Completed" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                        {activity.status}
                      </span>
                    </div>

                    {/* Amount Row */}
                    <div className="text-sm font-medium text-gray-900 mb-1.5">
                      {activity.amount}
                    </div>

                    {/* Wallet Info Row */}
                    {(activity.from || activity.to) && (
                      <div className="flex items-center gap-2 mb-1.5 text-sm text-gray-500">
                        <Wallet size={14} className="shrink-0" />
                        <span className="truncate">
                          {activity.from && (
                            <span className="inline-flex items-center gap-1">
                              From: {activity.from.slice(0, 6)}...
                              {activity.from.slice(-4)}
                            </span>
                          )}
                          {activity.to && (
                            <span className="inline-flex items-center gap-1">
                              {activity.from && " • "}
                              To: {activity.to.slice(0, 6)}...
                              {activity.to.slice(-4)}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Transaction Info Row */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="shrink-0" />
                        <span>{activity.date}</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <a
                        href={`https://etherscan.io/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors group-hover:underline"
                      >
                        <span className="truncate">
                          {activity.txHash.slice(0, 6)}...
                          {activity.txHash.slice(-4)}
                        </span>
                        <ExternalLink
                          size={12}
                          className="shrink-0 opacity-50 group-hover:opacity-100"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) || (
            <div className="text-center py-12 px-4">
              <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No Recent Activity
              </h3>
              <p className="text-sm text-gray-500">
                New transactions and updates will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add this modal component near the end of the file
  const NewProjectModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
          >
            Create New Project
          </h2>
          <button
            onClick={() => setIsNewProjectModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={projectForm.title}
              onChange={(e) =>
                setProjectForm({ ...projectForm, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select
              value={projectForm.category}
              onValueChange={(value: ProjectForm["category"]) =>
                setProjectForm({ ...projectForm, category: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (ETH)
            </label>
            <input
              type="text"
              value={projectForm.amount}
              onChange={(e) =>
                setProjectForm({ ...projectForm, amount: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount in ETH"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeline
            </label>
            <input
              type="text"
              value={projectForm.timeline}
              onChange={(e) =>
                setProjectForm({ ...projectForm, timeline: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3 months, Q4 2024"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter project description"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectives
            </label>
            <textarea
              value={projectForm.objectives}
              onChange={(e) =>
                setProjectForm({ ...projectForm, objectives: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter project objectives"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Add this handler
  const handleProcessTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsProcessTransactionModalOpen(true);
  };

  // Add this success handler
  const handleTransactionProcessed = async () => {
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);
      const details = await departmentSystem.getDepartmentDetailsBySlug(
        params.department
      );
      setDepartmentData(details);

      toast({
        title: "Transaction Processed",
        description: "The transaction has been successfully processed.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to refresh department details:", error);
      toast({
        title: "Transaction Processed",
        description:
          "Transaction processed successfully. Please refresh to see the latest changes.",
        variant: "default",
      });
    }
  };

  // Add this section to your dashboard UI
  const PendingTransactions = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <h2
        className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
      >
        Pending Transactions
      </h2>
      <div className="space-y-4">
        {pendingTransactions.length > 0 ? (
          pendingTransactions.map((tx) => (
            <div key={tx.id} className="p-4 border border-gray-100 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {tx.type} #{tx.id}
                  </h3>
                  <p className="text-sm text-gray-500">{tx.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTransaction(tx);
                    setIsProcessTransactionModalOpen(true);
                  }}
                  className="px-3 py-1 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                >
                  Process
                </button>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">{tx.amount} ETH</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No pending transactions</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <main className="pt-16 bg-gray-50 min-h-screen">
        {/* Department Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <Image
                    src={departmentData.logo}
                    alt={departmentData.name}
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h1
                    className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                  >
                    {departmentData.name}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    Connected as: {departmentData.address}
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Switch Account
                </button>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Project
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Budget", value: departmentData.budget.usd },
              {
                label: "Active Projects",
                value: departmentData.projects.toString(),
              },
              { label: "Budget Utilized", value: departmentData.utilization },
              {
                label: "Pending Proposals",
                value: (
                  departmentData.activeProposals?.filter((p) =>
                    ["pending", "review"].includes(p.status.toLowerCase())
                  )?.length || 0
                ).toString(),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Budget & Charts */}
            <div className="col-span-2 space-y-8">
              {/* Budget Overview */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                  >
                    Budget Overview
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-black" />
                      <span className="text-gray-600">Allocated</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className="text-gray-600">Spent</span>
                    </div>
                    <Select defaultValue="8months">
                      <SelectTrigger className="w-[180px] text-sm border-gray-200 bg-white">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8months">Last 8 Months</SelectItem>
                        <SelectItem value="12months">Last 12 Months</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={budgetData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#6B7280" }}
                        axisLine={{ stroke: "#E5E7EB" }}
                      />
                      <YAxis
                        tick={{ fill: "#6B7280" }}
                        axisLine={{ stroke: "#E5E7EB" }}
                        tickFormatter={(value) => `$${value}B`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value) => [`$${value}B`, ""]}
                      />
                      <Bar
                        dataKey="allocated"
                        fill="#000000"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="spent"
                        fill="#9CA3AF"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Total Allocated",
                      value: "$531.4B",
                      change: "+2.3%",
                      trend: "up",
                    },
                    {
                      label: "Total Spent",
                      value: "$507.2B",
                      change: "+1.8%",
                      trend: "up",
                    },
                    {
                      label: "Efficiency Rate",
                      value: "95.4%",
                      change: "+0.5%",
                      trend: "up",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                    >
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-lg font-semibold text-gray-900">
                          {stat.value}
                        </p>
                        <span
                          className={`text-xs font-medium ${
                            stat.trend === "up"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Projects */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                  >
                    Active Projects
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {departmentData.activeProposals?.map((project, i) => (
                    <div
                      key={i}
                      className="p-4 border border-gray-100 rounded-lg hover:border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Submitted {project.submittedDate}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-50 text-yellow-600">
                          {project.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Budget</span>
                        <span className="font-medium text-gray-900">
                          {project.amount}
                        </span>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No active projects</p>}
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Actions */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2
                  className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
                >
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      name: "New Project",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      ),
                      action: () => setIsNewProjectModalOpen(true),
                    },
                    {
                      name: "Update Budget",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ),
                      action: handleUpdateBudget,
                    },
                    {
                      name: "New Proposal",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      ),
                      action: () => setShowNewProposal(true),
                    },

                    {
                      name: "Create Transaction",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      ),
                      action: () => setIsCreateTransactionModalOpen(true),
                    },
                  ].map((action) => (
                    <button
                      key={action.name}
                      onClick={action.action}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                    >
                      <span className="p-1.5 rounded-md bg-gray-50">
                        {action.icon}
                      </span>
                      {action.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <RecentActivity />

              {/* Pending Transactions */}
              <PendingTransactions />
            </div>
          </div>
        </div>
      </main>

      {/* Add modal for new proposal */}
      {showNewProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Create New Proposal
              </h2>
              <button
                onClick={() => setShowNewProposal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleProposalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) =>
                    setProposalForm({ ...proposalForm, title: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.title ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter proposal title"
                  disabled={isSubmitting}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={proposalForm.category}
                  onValueChange={(value: ProposalForm["category"]) =>
                    setProposalForm({ ...proposalForm, category: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={`w-full ${
                      formErrors.category ? "border-red-300" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="infrastructure">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (ETH)
                </label>
                <input
                  type="text"
                  value={proposalForm.amount}
                  onChange={(e) =>
                    setProposalForm({ ...proposalForm, amount: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.amount ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter amount in ETH"
                  disabled={isSubmitting}
                />
                {formErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={proposalForm.description}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      description: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.description
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  rows={4}
                  placeholder="Enter proposal description"
                  disabled={isSubmitting}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewProposal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Create Proposal"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Budget Update Modal */}
      {showBudgetUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Update Budget
              </h2>
              <button
                onClick={() => setShowBudgetUpdate(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  value={budgetForm.amount}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={budgetForm.category}
                  onValueChange={(value) =>
                    setBudgetForm({ ...budgetForm, category: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="infrastructure">
                      Infrastructure
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Update
                </label>
                <textarea
                  value={budgetForm.reason}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter reason for budget update"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBudgetUpdate(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all duration-300"
                >
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Update Budget Modal */}
      {departmentData && (
        <UpdateBudgetModal
          isOpen={isUpdateBudgetModalOpen}
          onClose={handleCloseModal}
          departmentAddress={departmentData.departmentHead}
          departmentName={departmentData.name}
          currentBudget={departmentData.budget.eth}
          onSuccess={handleBudgetUpdateSuccess}
        />
      )}

      {/* Add New Project Modal */}
      {isNewProjectModalOpen && <NewProjectModal />}

      {/* Add Process Transaction Modal */}
      {isProcessTransactionModalOpen && selectedTransaction && (
        <ProcessTransactionModal
          isOpen={isProcessTransactionModalOpen}
          onClose={() => {
            setIsProcessTransactionModalOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          onSuccess={() => {
            handleTransactionProcessed();
            setIsProcessTransactionModalOpen(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {/* Add Create Transaction Modal */}
      {departmentData && (
        <CreateTransactionModal
          isOpen={isCreateTransactionModalOpen}
          onClose={() => setIsCreateTransactionModalOpen(false)}
          departmentAddress={departmentData.address}
          onSuccess={async () => {
            // Refresh pending transactions
            const { provider, signer } =
              await DepartmentSystemActions.connectWallet();
            const departmentSystem = new DepartmentSystemActions(
              provider,
              signer
            );
            const pending = await departmentSystem.getPendingTransactions(
              departmentData.address
            );
            setPendingTransactions(pending);
          }}
        />
      )}
    </>
  );
}
