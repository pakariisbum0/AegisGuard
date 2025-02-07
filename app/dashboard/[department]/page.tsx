"use client";

import { Space_Grotesk } from "next/font/google";
import { Header } from "@/app/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

// Mock data - this would come from your API/database
const departmentData = {
  "department-of-defense": {
    name: "Department of Defense",
    budget: "$773.1B",
    projects: "21,345",
    utilization: "98.2%",
    logo: "/images/dod-logo.png",
    address: "0x1234...5678",
    recentActivity: [
      {
        type: "Budget Allocation",
        amount: "$50M",
        date: "2024-03-15",
        status: "Completed",
        txHash: "0x1234...5678",
      },
      {
        type: "Project Funding",
        amount: "$25M",
        date: "2024-03-14",
        status: "Pending",
        txHash: "0x8765...4321",
      },
    ],
    activeProposals: [
      {
        title: "Cybersecurity Enhancement",
        amount: "$50M",
        status: "Under Review",
        submittedDate: "2024-03-10",
      },
      {
        title: "AI Defense Systems",
        amount: "$75M",
        status: "Pending",
        submittedDate: "2024-03-08",
      },
    ],
  },
};

// Add form state types
interface ProposalForm {
  title: string;
  amount: string;
  description: string;
}

interface BudgetUpdateForm {
  amount: string;
  reason: string;
  category: string;
}

export default function DepartmentDashboard({
  params,
}: {
  params: { department: string };
}) {
  const department = departmentData[params.department];
  const router = useRouter();
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [showBudgetUpdate, setShowBudgetUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalForm, setProposalForm] = useState<ProposalForm>({
    title: "",
    amount: "",
    description: "",
  });
  const [budgetForm, setBudgetForm] = useState<BudgetUpdateForm>({
    amount: "",
    reason: "",
    category: "operational",
  });
  const [formErrors, setFormErrors] = useState<Partial<ProposalForm>>({});

  if (!department) {
    return <div>Department not found</div>;
  }

  // Add validation function
  const validateProposalForm = () => {
    const errors: Partial<ProposalForm> = {};
    if (!proposalForm.title.trim()) {
      errors.title = "Title is required";
    }
    if (!proposalForm.amount.trim()) {
      errors.amount = "Amount is required";
    } else if (!/^\$?\d+(\.\d{1,2})?(M|B|T)?$/.test(proposalForm.amount)) {
      errors.amount = "Invalid amount format";
    }
    if (!proposalForm.description.trim()) {
      errors.description = "Description is required";
    }
    return errors;
  };

  // Add form submission handler
  const handleProposalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateProposalForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Handle success
        setShowNewProposal(false);
        // Reset form
        setProposalForm({ title: "", amount: "", description: "" });
      } catch (error) {
        console.error("Failed to submit proposal:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

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
                    src={department.logo}
                    alt={department.name}
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h1
                    className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                  >
                    {department.name}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    Connected as: {department.address}
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
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
                  onClick={() => setShowNewProposal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow"
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
                  New Proposal
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Budget", value: department.budget },
              { label: "Active Projects", value: department.projects },
              { label: "Budget Utilized", value: department.utilization },
              {
                label: "Pending Proposals",
                value: department.activeProposals.length.toString(),
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
                  <select className="text-sm border-gray-300 rounded-md">
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>Last Year</option>
                  </select>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Budget Chart Coming Soon</p>
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
                  {department.activeProposals.map((project, i) => (
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
                  ))}
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
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      name: "Create New Proposal",
                      icon: (
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
                      ),
                      action: () => setShowNewProposal(true),
                      color: "text-blue-600 hover:bg-blue-50 border-blue-100",
                    },
                    {
                      name: "Review Requests",
                      icon: (
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      ),
                      action: () =>
                        router.push(`/dashboard/${params.department}/requests`),
                      color:
                        "text-yellow-600 hover:bg-yellow-50 border-yellow-100",
                    },
                    {
                      name: "Generate Report",
                      icon: (
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
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      ),
                      action: () =>
                        router.push(`/dashboard/${params.department}/reports`),
                      color:
                        "text-emerald-600 hover:bg-emerald-50 border-emerald-100",
                    },
                    {
                      name: "Update Budget",
                      icon: (
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ),
                      action: () => setShowBudgetUpdate(true),
                      color:
                        "text-purple-600 hover:bg-purple-50 border-purple-100",
                    },
                  ].map((action) => (
                    <button
                      key={action.name}
                      onClick={action.action}
                      className={`flex items-center gap-3 p-4 text-sm font-medium border rounded-lg transition-all duration-300 ${action.color}`}
                    >
                      {action.icon}
                      {action.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2
                  className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
                >
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {department.recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className="p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.date}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            activity.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-yellow-50 text-yellow-600"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          Tx: {activity.txHash}
                        </span>
                        <span className="font-medium text-gray-900">
                          {activity.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  Amount
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
                  placeholder="Enter amount (e.g., $1.5M)"
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
                <select
                  value={budgetForm.category}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="operational">Operational</option>
                  <option value="development">Development</option>
                  <option value="research">Research</option>
                  <option value="infrastructure">Infrastructure</option>
                </select>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
