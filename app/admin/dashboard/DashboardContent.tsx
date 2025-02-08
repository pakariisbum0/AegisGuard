"use client";

import { Space_Grotesk } from "next/font/google";
import {
  Building2,
  Wallet,
  CheckCircle2,
  FolderGit2,
  Clock,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import {
  DepartmentSystemActions,
  DepartmentMetrics,
} from "@/lib/contracts/actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface Department {
  name: string;
  budget: string;
  spent: string;
  efficiency: string;
  projects: number;
  departmentHead: string;
  logoUri: string;
}

interface MetricCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    trend: "up" | "down";
  };
  prefix?: string;
  suffix?: string;
}

interface PendingProposal {
  id: string;
  title: string;
  department: string;
  departmentLogo: string;
  amount: string;
  status: string;
  submittedDate: string;
}

interface PendingTransaction {
  id: string;
  department: string;
  type: string;
  amount: string;
  description: string;
  status: string;
  timestamp: string;
}

export function DashboardContent() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usdRate, setUsdRate] = useState<number>(0);
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>(
    []
  );
  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([]);
  const [processingProposals, setProcessingProposals] = useState<Set<string>>(
    new Set()
  );

  const formatDate = (timestamp: number): string => {
    try {
      const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        // Fetch both metrics and departments in parallel
        const [departmentMetrics, departmentList] = await Promise.all([
          departmentSystem.getDepartmentMetrics(),
          departmentSystem.fetchAllDepartments(),
        ]);

        console.log("departmentMetrics", departmentMetrics);
        setMetrics(departmentMetrics);
        setDepartments(departmentList);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to fetch dashboard data");
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    const fetchUsdRate = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);
        const rate = await departmentSystem.getEthToUsdRate();
        setUsdRate(rate);
      } catch (error) {
        console.error("Failed to fetch USD rate:", error);
      }
    };

    fetchUsdRate();
  }, []);

  // Add a function to update metrics
  const updateMetrics = (
    pendingProps: PendingProposal[],
    pendingTxs: PendingTransaction[]
  ) => {
    if (metrics) {
      setMetrics({
        ...metrics,
        pendingProposals: pendingProps.length,
        pendingTransactions: pendingTxs.length,
      });
    }
  };

  // Update the fetchPendingItems function to track all proposal statuses
  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        // Get all departments first
        const allDepartments = await departmentSystem.fetchAllDepartments();

        // Track counts for different proposal statuses
        let pendingCount = 0;
        let approvedCount = 0;

        // Fetch proposals for each department
        const proposals = await Promise.all(
          allDepartments.map(async (dept) => {
            const deptProposals =
              await departmentSystem.getProposalsByDepartment(
                dept.departmentHead
              );

            // Map and count proposals
            return deptProposals.map((p: any) => {
              const status = [
                "PENDING",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
              ][p.status];

              // Count pending and approved proposals
              if (status === "PENDING" || status === "UNDER_REVIEW")
                pendingCount++;
              if (status === "APPROVED") approvedCount++;

              return {
                id: p.id.toString(),
                title: p.title,
                department: dept.name,
                departmentLogo: dept.logoUri,
                amount: ethers.formatEther(p.amount),
                status,
                submittedDate: formatDate(Number(p.timestamp)),
              };
            });
          })
        );

        const transactions = await Promise.all(
          allDepartments.map(async (dept) => {
            const deptTransactions =
              await departmentSystem.getTransactionsByDepartment(
                dept.departmentHead
              );
            return deptTransactions.map((tx: any) => ({
              id: tx.id.toString(),
              department: dept.name,
              type: [
                "BUDGET_ALLOCATION",
                "PROJECT_FUNDING",
                "BUDGET_UPDATE",
                "EXPENSE",
              ][tx.txType],
              amount: ethers.formatEther(tx.amount),
              description: tx.description,
              status: ["PENDING", "COMPLETED", "FAILED"][tx.status],
              timestamp: formatDate(Number(tx.timestamp)),
            }));
          })
        );

        // Filter pending items
        const pendingProps = proposals
          .flat()
          .filter((p) => p.status === "PENDING" || p.status === "UNDER_REVIEW");
        const pendingTxs = transactions
          .flat()
          .filter((tx) => tx.status === "PENDING");

        setPendingProposals(pendingProps);
        setPendingTransactions(pendingTxs);

        // Update metrics with accurate counts
        if (metrics) {
          setMetrics({
            ...metrics,
            pendingProposals: pendingCount,
            approvedProposals: approvedCount,
            pendingTransactions: pendingTxs.length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch pending items:", error);
      }
    };

    fetchPendingItems();
  }, []);

  const formatUsdValue = (ethValue: string | number) => {
    const value = Number(ethValue) * usdRate;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDepartmentValue = (ethValue: string) => {
    const usdValue = formatUsdValue(ethValue);
    return {
      eth: `${Number(ethValue).toFixed(2)} ETH`,
      usd: usdValue,
    };
  };

  const getMetricsData = (): MetricCard[] => [
    {
      label: "Total Departments",
      value: metrics?.totalDepartments || 0,
      icon: Building2,
    },
    {
      label: "Total Budget",
      value: metrics
        ? formatUsdValue(ethers.formatEther(metrics.totalBudgets))
        : "$0",
      icon: Wallet,
    },
    {
      label: "Approved Proposals",
      value: metrics?.approvedProposals || 0,
      icon: CheckCircle2,
    },
    {
      label: "Active Projects",
      value: metrics?.totalProjects || 0,
      icon: FolderGit2,
    },
    {
      label: "Pending Transactions",
      value: metrics?.pendingTransactions || 0,
      icon: Clock,
    },
    {
      label: "Pending Proposals",
      value: metrics?.pendingProposals || 0,
      icon: FileCheck,
    },
  ];

  const MetricsOverview = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {getMetricsData().map((metric) => (
        <div
          key={metric.label}
          className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-gray-50">
              <metric.icon className="w-5 h-5 text-gray-600" />
            </div>
            {metric.change && (
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  metric.change.trend === "up"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {metric.change.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {metric.change.value}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-gray-900">
                {metric.prefix && <span>{metric.prefix}</span>}
                {metric.value}
              </p>
              {metric.suffix && (
                <span className="text-xs text-gray-500">{metric.suffix}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const DepartmentOverview = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
        >
          Department Overview
        </h2>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View All →
        </button>
      </div>
      <div className="space-y-4">
        {departments.map((dept, index) => {
          const budget = formatDepartmentValue(dept.budget);
          const spent = formatDepartmentValue(dept.spent);

          return (
            <div
              key={index}
              className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={dept.logoUri}
                      alt={dept.name}
                      className="w-8 h-8 rounded"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-500">
                      Head: {dept.departmentHead.slice(0, 6)}...
                      {dept.departmentHead.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium text-gray-900">{budget.usd}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Spent</p>
                    <p className="font-medium text-gray-900">{spent.usd}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Efficiency</p>
                    <p className="font-medium text-gray-900">
                      {dept.efficiency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Projects</p>
                    <p className="font-medium text-gray-900">{dept.projects}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const PendingProposalsList = () => (
    <div className="space-y-4">
      {pendingProposals.length > 0 ? (
        pendingProposals.map((proposal) => (
          <div
            key={proposal.id}
            className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all duration-200 bg-white"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                  <Image
                    src={proposal.departmentLogo}
                    alt={proposal.department}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {proposal.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      From: {proposal.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleProposalAction(proposal.id, "APPROVED")
                      }
                      disabled={processingProposals.has(
                        `${proposal.id}-approve`
                      )}
                      className="p-2 text-emerald-600 border-2 border-emerald-600 rounded-full hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingProposals.has(`${proposal.id}-approve`) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleProposalAction(proposal.id, "REJECTED")
                      }
                      disabled={processingProposals.has(
                        `${proposal.id}-reject`
                      )}
                      className="p-2 text-red-600 border-2 border-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingProposals.has(`${proposal.id}-reject`) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatUsdValue(proposal.amount)}
                      <span className="text-gray-500 text-xs ml-1">
                        ({proposal.amount} ETH)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No pending proposals</p>
        </div>
      )}
    </div>
  );

  const PendingTransactionsList = () => (
    <div className="space-y-4">
      {pendingTransactions.length > 0 ? (
        pendingTransactions.map((tx) => (
          <div
            key={tx.id}
            className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">
                  {tx.type} #{tx.id}
                </h3>
                <p className="text-sm text-gray-500">
                  From: {tx.department} • {tx.timestamp}
                </p>
              </div>
              <button
                onClick={() => handleTransactionProcess(tx.id)}
                className="px-3 py-1 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
              >
                Process
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium">{tx.amount} ETH</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{tx.description}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No pending transactions</p>
      )}
    </div>
  );

  // Update handleProposalAction to use separate loading states
  const handleProposalAction = async (
    proposalId: string,
    action: "APPROVED" | "REJECTED"
  ) => {
    const loadingKey = `${proposalId}-${
      action === "APPROVED" ? "approve" : "reject"
    }`;

    try {
      setProcessingProposals((prev) => new Set([...prev, loadingKey]));

      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      await departmentSystem.reviewProposal(Number(proposalId), action);

      // Update proposals list
      const updatedProposals = pendingProposals.filter(
        (p) => p.id !== proposalId
      );
      setPendingProposals(updatedProposals);

      // Fetch updated metrics after action
      const updatedMetrics = await departmentSystem.getDepartmentMetrics();
      setMetrics(updatedMetrics);

      toast({
        title: "Success",
        description: `Proposal ${action.toLowerCase()} successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()} proposal:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()} proposal`,
        variant: "destructive",
      });
    } finally {
      setProcessingProposals((prev) => {
        const next = new Set(prev);
        next.delete(loadingKey);
        return next;
      });
    }
  };

  // Update handleTransactionProcess to update metrics after processing
  const handleTransactionProcess = async (transactionId: string) => {
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      await departmentSystem.processTransaction(Number(transactionId));

      // Update transactions list
      const updatedTransactions = pendingTransactions.filter(
        (tx) => tx.id !== transactionId
      );
      setPendingTransactions(updatedTransactions);

      // Update metrics
      updateMetrics(pendingProposals, updatedTransactions);

      toast({
        title: "Success",
        description: "Transaction processed successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to process transaction:", error);
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1
          className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
        >
          Admin Dashboard
        </h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
            New Department
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Generate Report
          </button>
        </div>
      </div>

      <MetricsOverview />

      {/* Activity and Proposals Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2
            className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
          >
            Pending Proposals
          </h2>
          <PendingProposalsList />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2
            className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
          >
            Pending Transactions
          </h2>
          <PendingTransactionsList />
        </div>
      </div>

      {/* Department Overview */}
      <DepartmentOverview />
    </div>
  );
}
