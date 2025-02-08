"use client";

import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import { Header } from "@/app/components/Header";
import { useState, useEffect } from "react";
import {
  DepartmentSystemActions,
  DepartmentDetails,
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
import { Wallet, Building2, BarChart3, FileCheck } from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

// Add the formatTimeAgo helper
const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Add the status color helper
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

// Add this skeleton component at the top of the file
function DepartmentDetailsSkeleton() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="bg-gray-100 p-4 rounded-xl animate-pulse w-[96px] h-[96px]" />
              <div className="space-y-2">
                <div className="h-8 bg-gray-100 rounded w-64 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="w-40 h-10 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-gray-100"
            >
              <div className="h-4 bg-gray-100 rounded w-24 mb-2 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded w-32 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            {/* Budget Breakdown Skeleton */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-6 bg-gray-100 rounded w-48 mb-6 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4"
                  >
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-100 rounded w-40 animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-100 rounded w-24 animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-6 bg-gray-100 rounded w-32 mb-6 animate-pulse" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Add this component inside the DepartmentPage component
const BudgetOverview = ({ department }: { department: DepartmentDetails }) => {
  // Calculate monthly budget data
  const calculateMonthlyData = () => {
    const currentDate = new Date();
    const months = [];
    const usdRate = 3000; // Using the same rate as formatUsdValue

    // Get total budget and spent values in USD
    const totalBudgetUsd = Number(
      department.budget.usd.replace(/[^0-9.-]+/g, "")
    );
    const totalSpentUsd =
      (totalBudgetUsd * Number(department.utilization.replace("%", ""))) / 100;

    // Only show February data
    for (let i = 7; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleString("default", { month: "short" });

      months.push({
        month: monthName,
        allocated: monthName === "Feb" ? totalBudgetUsd : 0, // Only show budget for February
        spent: monthName === "Feb" ? totalSpentUsd : 0, // Only show spent for February
      });
    }
    return months;
  };

  const data = calculateMonthlyData();

  return (
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
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [
                `$${new Intl.NumberFormat("en-US").format(value)}`,
                "",
              ]}
            />
            <Bar
              dataKey="allocated"
              fill="#111827"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            {/* <Bar
              dataKey="spent"
              fill="#9CA3AF"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            /> */}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Allocated",
            value: department.budget.usd,
          },
          {
            label: "Total Spent",
            value: `$0.0`,
          },
          {
            label: "Efficiency Rate",
            value: department.utilization,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-50 rounded-lg p-4 border border-gray-100"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DepartmentPage({
  params,
}: {
  params: { slug: string };
}) {
  const [department, setDepartment] = useState<DepartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        // Fetch both department details and metrics
        const [details, departmentMetrics] = await Promise.all([
          departmentSystem.getDepartmentDetailsBySlug(params.slug),
          departmentSystem.getDepartmentMetrics(),
        ]);

        setDepartment(details);
        setMetrics(departmentMetrics);
      } catch (err) {
        console.error("Failed to fetch department data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch department data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-16 bg-gray-50">
          <DepartmentDetailsSkeleton />
        </main>
      </>
    );
  }

  if (error || !department) {
    return (
      <>
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h1 className="text-lg font-medium text-red-800">Error</h1>
              <p className="text-red-600">{error || "Department not found"}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-16 bg-gray-50 min-h-screen">
        {/* Department Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <p className="text-gray-500">Fiscal Year 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              {
                label: "Total Budget",
                value: department.budget.usd,
                icon: Wallet,
              },
              {
                label: "Active Projects",
                value: metrics?.approvedProposals || "0",
                icon: Building2,
              },
              {
                label: "Budget Utilized",
                value: department.utilization,
                icon: BarChart3,
              },
              {
                label: "Pending Proposals",
                value: metrics?.pendingProposals || "0",
                icon: FileCheck,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <stat.icon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Budget & Projects */}
            <div className="col-span-2 space-y-8">
              {/* Budget Overview */}
              <BudgetOverview department={department} />

              {/* Active Projects */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                  >
                    Active Projects
                  </h2>
                </div>
                <div className="space-y-4">
                  {department.activeProposals.map((project, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Submitted {formatTimeAgo(project.submittedDate)}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Amount:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {project.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Activity */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2
                  className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
                >
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {department.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.amount}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(activity.date)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            activity.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {activity.status}
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
    </>
  );
}
