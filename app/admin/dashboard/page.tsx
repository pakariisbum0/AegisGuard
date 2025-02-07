"use client";

import { Space_Grotesk } from "next/font/google";
import { Header } from "@/app/components/Header";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

// Mock data for pending approvals
const pendingApprovals = [
  {
    id: "1",
    department: "Department of Defense",
    type: "Budget Update",
    amount: "$50M",
    requestedDate: "2024-03-15",
    description: "Cybersecurity infrastructure enhancement",
    status: "Pending",
  },
  {
    id: "2",
    department: "NASA",
    type: "New Proposal",
    amount: "$120M",
    requestedDate: "2024-03-14",
    description: "Advanced propulsion systems research",
    status: "Under Review",
  },
];

interface ApprovalDetails {
  id: string;
  department: string;
  type: string;
  amount: string;
  description: string;
  status: string;
}

// Add this mock data near other data constants
const departmentPerformance = [
  {
    name: "Department of Defense",
    budget: 773.1,
    spent: 750.2,
    efficiency: 97.2,
    projects: 21345,
    trend: [65, 72, 78, 75, 82, 97.2],
  },
  {
    name: "NASA",
    budget: 24.5,
    spent: 22.8,
    efficiency: 94.5,
    projects: 12458,
    trend: [70, 68, 75, 82, 88, 94.5],
  },
  {
    name: "Dept. of Education",
    budget: 79.8,
    spent: 72.3,
    efficiency: 91.8,
    projects: 8765,
    trend: [60, 65, 70, 75, 85, 91.8],
  },
];

const efficiencyTrend = [
  { month: "Oct", avg: 82 },
  { month: "Nov", avg: 85 },
  { month: "Dec", avg: 87 },
  { month: "Jan", avg: 89 },
  { month: "Feb", avg: 92 },
  { month: "Mar", avg: 94.5 },
];

export default function AdminDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalDetails | null>(null);
  const [approvalNote, setApprovalNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleApprove = async (approval: ApprovalDetails) => {
    setSelectedApproval(approval);
    setShowApprovalModal(true);
  };

  const handleReject = (approval: ApprovalDetails) => {
    setSelectedApproval(approval);
    setShowRejectModal(true);
  };

  const processApproval = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Handle success
      setShowApprovalModal(false);
      setSelectedApproval(null);
      setApprovalNote("");
      // You would typically update the UI here
    } catch (error) {
      console.error("Failed to process approval:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-16 bg-gray-50 min-h-screen">
        {/* Admin Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                >
                  Super Admin Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage department requests and system settings
                </p>
              </div>
              <div className="flex gap-4">
                <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all duration-300">
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { label: "Pending Approvals", value: "12" },
              { label: "Departments", value: "45" },
              { label: "Total Budget Allocated", value: "$2.8T" },
              { label: "Active Proposals", value: "156" },
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

          {/* Pending Approvals Section */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2
                  className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                >
                  Pending Approvals
                </h2>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {pendingApprovals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {approval.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {approval.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {approval.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {approval.requestedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            approval.status === "Pending"
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {approval.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleApprove(approval)}
                            className="px-3 py-1 text-xs font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-300"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(approval)}
                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-all duration-300"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/admin/requests/${approval.id}`)
                            }
                            className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Overview */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            {/* Department Performance */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2
                  className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                >
                  Department Performance
                </h2>
                <Select defaultValue="6months">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Efficiency Chart */}
                <div className="border border-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Overall Efficiency Trend
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={efficiencyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#6B7280" }}
                          axisLine={{ stroke: "#E5E7EB" }}
                        />
                        <YAxis
                          tick={{ fill: "#6B7280" }}
                          axisLine={{ stroke: "#E5E7EB" }}
                          domain={[60, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="avg"
                          stroke="#000000"
                          strokeWidth={2}
                          dot={{ fill: "#000000" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Budget Utilization */}
                <div className="border border-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Budget Utilization
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentPerformance}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#6B7280", fontSize: 12 }}
                          axisLine={{ stroke: "#E5E7EB" }}
                          tickLine={false}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fill: "#6B7280" }}
                          axisLine={{ stroke: "#E5E7EB" }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar
                          dataKey="efficiency"
                          fill="#000000"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Department Rankings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Department Rankings
                </h3>
                {departmentPerformance
                  .sort((a, b) => b.efficiency - a.efficiency)
                  .map((dept, index) => (
                    <div
                      key={dept.name}
                      className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <h4 className="text-sm font-medium text-gray-900">
                            {dept.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Efficiency</p>
                            <p className="text-sm font-medium text-gray-900">
                              {dept.efficiency}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Budget Utilized
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              ${dept.spent}B / ${dept.budget}B
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Active Projects
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {dept.projects.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-black rounded-full h-2 transition-all duration-500"
                          style={{ width: `${dept.efficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2
                className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
              >
                System Alerts
              </h2>
              <div className="space-y-4">
                {[
                  {
                    type: "Warning",
                    message:
                      "Department of Defense approaching budget limit (95% utilized)",
                    time: "2 hours ago",
                  },
                  {
                    type: "Info",
                    message: "New department registration request pending",
                    time: "5 hours ago",
                  },
                ].map((alert, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border border-gray-100 hover:border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          alert.type === "Warning"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Approval Modal */}
      {showApprovalModal && selectedApproval && (
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Approve Request</DialogTitle>
              <DialogDescription>
                Review and approve the budget request from{" "}
                {selectedApproval.department}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">
                  Request Details
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedApproval.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedApproval.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Approval Note
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                  placeholder="Add any notes or comments..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={processApproval}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
              >
                {isProcessing ? (
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
                    Processing...
                  </>
                ) : (
                  "Confirm Approval"
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Modal - Similar structure to Approval Modal */}
      {showRejectModal && selectedApproval && (
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request
              </DialogDescription>
            </DialogHeader>
            {/* Similar content structure as approval modal */}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
