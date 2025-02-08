"use client";

import { useState, useEffect } from "react";
import { Space_Grotesk } from "next/font/google";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface AdminStats {
  totalDepartments: number;
  totalBudgetAllocated: string;
  pendingApprovals: number;
  totalProjects: number;
  pendingProposals: number;
  approvedProposals: number;
}

interface PendingApproval {
  id: string;
  department: string;
  type: string;
  amount: string;
  description: string;
  timestamp: string;
  departmentName: string;
  departmentLogo: string;
}

interface PendingProposal {
  id: string;
  department: string;
  title: string;
  amount: string;
  description: string;
  timeline: string;
  objectives: string;
  submittedDate: string;
  category: string;
  departmentName: string;
  departmentLogo: string;
}

export function DashboardContent() {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    []
  );
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        // Fetch all departments
        const departments = await departmentSystem.fetchAllDepartments();
        console.log("=== Admin Dashboard Data Fetch ===");
        console.log("All departments:", departments);

        // Calculate total budget in USD
        const totalBudgetEth = departments.reduce(
          (sum, dept) => sum + parseFloat(dept.budget),
          0
        );
        const totalBudgetUsd = await departmentSystem.convertEthToUsd(
          totalBudgetEth.toString()
        );

        // Fetch ALL pending transactions from ALL departments
        console.log("=== Fetching Pending Transactions ===");
        const allPendingTransactions = await Promise.all(
          departments.map(async (dept) => {
            console.log(`Fetching transactions for department: ${dept.name}`);
            const transactions = await departmentSystem.getPendingTransactions(
              dept.departmentHead
            );
            console.log(
              `Found ${transactions.length} pending transactions for ${dept.name}`
            );
            return transactions.map((tx) => ({
              ...tx,
              departmentName: dept.name,
              departmentLogo: dept.logoUri,
            }));
          })
        );

        console.log(
          "All pending transactions before flat:",
          allPendingTransactions
        );
        const flatPendingTransactions = allPendingTransactions.flat();
        console.log("Flattened pending transactions:", flatPendingTransactions);

        // Fetch ALL pending proposals from ALL departments
        console.log("=== Fetching Pending Proposals ===");
        const allPendingProposals = await Promise.all(
          departments.map(async (dept) => {
            console.log(`Fetching proposals for department: ${dept.name}`);
            const proposals = await departmentSystem.getProposalsByDepartment(
              dept.departmentHead
            );
            console.log(`Found ${proposals.length} proposals for ${dept.name}`);
            return proposals
              .filter((p) => {
                console.log(`Proposal status for ${dept.name}:`, p.status);
                return p.status === "PENDING";
              })
              .map((p) => ({
                id: p.id.toString(),
                department: dept.departmentHead,
                departmentName: dept.name,
                departmentLogo: dept.logoUri,
                title: p.title,
                amount: p.amount,
                description: p.description,
                timeline: p.timeline,
                objectives: p.objectives,
                submittedDate: p.submittedDate,
                category: p.category,
              }));
          })
        );

        console.log("All pending proposals before flat:", allPendingProposals);
        const flatPendingProposals = allPendingProposals.flat();
        console.log("Flattened pending proposals:", flatPendingProposals);

        // Calculate total projects across all departments
        const totalProjects = departments.reduce(
          (sum, dept) => sum + dept.projects,
          0
        );

        // Count approved proposals across all departments
        const allApprovedProposals = await Promise.all(
          departments.map(async (dept) => {
            console.log(`Checking approved proposals for ${dept.name}`);
            const proposals = await departmentSystem.getProposalsByDepartment(
              dept.departmentHead
            );
            console.log(`Raw proposals for ${dept.name}:`, proposals);

            const approved = proposals.filter((p) => {
              console.log(`Proposal status check:`, {
                id: p.id,
                status: p.status,
                isApproved: p.status === "APPROVED",
              });
              return p.status === "APPROVED";
            });

            console.log(
              `Found ${approved.length} approved proposals for ${dept.name}`
            );
            return approved;
          })
        );

        const totalApprovedProposals = allApprovedProposals.flat().length;
        console.log("Total approved proposals:", totalApprovedProposals);

        setStats({
          totalDepartments: departments.length,
          totalBudgetAllocated: totalBudgetUsd,
          pendingApprovals: flatPendingTransactions.length,
          totalProjects: totalProjects,
          pendingProposals: flatPendingProposals.length,
          approvedProposals: totalApprovedProposals,
        });

        setPendingApprovals(flatPendingTransactions);
        setPendingProposals(flatPendingProposals);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [toast]);

  const handleApprove = async (approvalId: string) => {
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      await departmentSystem.processTransaction(Number(approvalId));

      toast({
        title: "Success",
        description: "Transaction approved successfully",
      });

      // Refresh data
      const pending = pendingApprovals.filter((p) => p.id !== approvalId);
      setPendingApprovals(pending);
      setStats((prev) =>
        prev ? { ...prev, pendingApprovals: prev.pendingApprovals - 1 } : null
      );
    } catch (error) {
      console.error("Failed to approve transaction:", error);
      toast({
        title: "Error",
        description: "Failed to approve transaction",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (approvalId: string) => {
    // Implement rejection logic
    toast({
      title: "Not Implemented",
      description: "Rejection functionality coming soon",
      variant: "default",
    });
  };

  const handleApproveProposal = async (proposalId: string) => {
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      await departmentSystem.reviewProposal(Number(proposalId), "APPROVED");

      toast({
        title: "Success",
        description: "Proposal approved successfully",
      });

      // Refresh data
      const remaining = pendingProposals.filter((p) => p.id !== proposalId);
      setPendingProposals(remaining);
      setStats((prev) =>
        prev ? { ...prev, pendingProposals: prev.pendingProposals - 1 } : null
      );
    } catch (error) {
      console.error("Failed to approve proposal:", error);
      toast({
        title: "Error",
        description: "Failed to approve proposal",
        variant: "destructive",
      });
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      await departmentSystem.reviewProposal(Number(proposalId), "REJECTED");

      toast({
        title: "Success",
        description: "Proposal rejected successfully",
      });

      // Refresh data
      const remaining = pendingProposals.filter((p) => p.id !== proposalId);
      setPendingProposals(remaining);
      setStats((prev) =>
        prev ? { ...prev, pendingProposals: prev.pendingProposals - 1 } : null
      );
    } catch (error) {
      console.error("Failed to reject proposal:", error);
      toast({
        title: "Error",
        description: "Failed to reject proposal",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="pt-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1
          className={`text-3xl font-bold text-gray-900 mb-8 ${spaceGrotesk.className}`}
        >
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {stats &&
            [
              {
                label: "Total Departments",
                value: stats.totalDepartments,
                icon: <Building2 className="w-6 h-6" />,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Total Budgets",
                value: stats.totalBudgetAllocated,
                icon: <BarChart3 className="w-6 h-6" />,
                color: "bg-green-50 text-green-600",
              },
              {
                label: "Approved Proposals",
                value: stats.approvedProposals,
                icon: <CheckCircle2 className="w-6 h-6" />,
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                label: "Total Projects",
                value: stats.totalProjects,
                icon: <Users className="w-6 h-6" />,
                color: "bg-purple-50 text-purple-600",
              },
              {
                label: "Pending Transactions",
                value: stats.pendingApprovals,
                icon: <Clock className="w-6 h-6" />,
                color: "bg-yellow-50 text-yellow-600",
              },
              {
                label: "Pending Proposals",
                value: stats.pendingProposals,
                icon: <AlertCircle className="w-6 h-6" />,
                color: "bg-orange-50 text-orange-600",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Pending Proposals Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2
            className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
          >
            Pending Proposals
          </h2>
          <div className="space-y-4">
            {pendingProposals.length > 0 ? (
              pendingProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <Image
                          src={proposal.departmentLogo}
                          alt={proposal.departmentName}
                          width={48}
                          height={48}
                          className="rounded-lg border border-gray-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900">
                          {proposal.title}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Description:</span>{" "}
                            {proposal.description}
                          </p>
                          {proposal.timeline && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Timeline:</span>{" "}
                              {proposal.timeline}
                            </p>
                          )}
                          {proposal.objectives && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Objectives:</span>{" "}
                              {proposal.objectives}
                            </p>
                          )}
                          <div className="flex gap-4">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Department:</span>{" "}
                              {proposal.departmentName}
                            </p>
                            {proposal.category && (
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">Category:</span>{" "}
                                {proposal.category}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(
                              proposal.submittedDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveProposal(proposal.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve Proposal"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRejectProposal(proposal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject Proposal"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Requested Amount</span>
                    <span className="font-medium text-gray-900">
                      {proposal.amount} ETH
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No Pending Proposals
                </h3>
                <p className="text-sm text-gray-500">
                  All proposals have been reviewed
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
          <h2
            className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
          >
            Pending Transactions
          </h2>
          <div className="space-y-4">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <Image
                          src={approval.departmentLogo}
                          alt={approval.departmentName}
                          width={48}
                          height={48}
                          className="rounded-lg border border-gray-100"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {approval.type}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {approval.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Department: {approval.departmentName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium text-gray-900">
                      {approval.amount} ETH
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No Pending Transactions
                </h3>
                <p className="text-sm text-gray-500">
                  All transactions have been processed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
