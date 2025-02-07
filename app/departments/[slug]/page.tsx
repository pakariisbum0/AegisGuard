"use client";

import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import { Header } from "@/app/components/Header";
import { useState, useEffect } from "react";
import {
  DepartmentSystemActions,
  DepartmentDetails,
} from "@/lib/contracts/actions";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

// Add this interface for our quick actions
interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

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

export default function DepartmentPage({
  params,
}: {
  params: { slug: string };
}) {
  const [department, setDepartment] = useState<DepartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);
        const details = await departmentSystem.getDepartmentDetailsBySlug(
          params.slug
        );
        setDepartment(details);
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
  }, [params.slug]);

  // Update the loading state to use the skeleton
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
            <h1 className="text-2xl font-bold text-gray-900">
              {error || "Department not found"}
            </h1>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-16 bg-gray-50">
        {/* Hero Section with Department Info */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-start">
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
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Budget", value: department.budget.usd },
              { label: "Active Projects", value: department.projects },
              { label: "Budget Utilized", value: department.utilization },
              {
                label: "Pending Proposals",
                value: department.proposals
                  .filter((p) =>
                    ["pending", "review"].some((status) =>
                      p.status.toLowerCase().includes(status)
                    )
                  )
                  .length.toString(),
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300"
              >
                <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Budget & Performance */}
            <div className="col-span-2 space-y-8">
              {/* Budget Breakdown */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2
                  className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
                >
                  Budget Breakdown
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      category: "Personnel",
                      amount: "$245.8B",
                      percentage: "31.8%",
                      change: "+2.3%",
                      trend: "up",
                    },
                    {
                      category: "Operations & Maintenance",
                      amount: "$198.2B",
                      percentage: "25.6%",
                      change: "+1.8%",
                      trend: "up",
                    },
                    {
                      category: "Research & Development",
                      amount: "$140.5B",
                      percentage: "18.2%",
                      change: "-0.5%",
                      trend: "down",
                    },
                  ].map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.category}
                        </h3>
                        <span
                          className={`text-sm ${
                            item.trend === "up"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.trend === "up" ? "↑" : "↓"} {item.change} from
                          FY2023
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {item.amount}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.percentage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Projects */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                  >
                    Key Projects
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View All Projects →
                  </button>
                </div>
                <div className="space-y-4">
                  {department.proposals.map((project, i) => (
                    <div
                      key={i}
                      className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted on{" "}
                            {new Date(
                              project.submittedDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 text-xs rounded-full bg-emerald-50 text-emerald-600">
                          {project.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Budget</span>
                        <span className="font-medium text-gray-900">
                          {project.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Metrics */}
            <div className="space-y-8">
              {/* Performance Metrics */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h2
                  className={`text-xl font-bold text-gray-900 mb-6 ${spaceGrotesk.className}`}
                >
                  Performance
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      metric: "Budget Efficiency",
                      value: "94.5%",
                      target: "90%",
                      status: "Above Target",
                    },
                    {
                      metric: "Project Completion",
                      value: "87.2%",
                      target: "85%",
                      status: "On Target",
                    },
                    {
                      metric: "Resource Utilization",
                      value: "91.8%",
                      target: "95%",
                      status: "Below Target",
                    },
                  ].map((metric) => (
                    <div key={metric.metric} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-500">
                          {metric.metric}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {metric.value}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Target: {metric.target}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            metric.status === "Above Target"
                              ? "bg-emerald-50 text-emerald-600"
                              : metric.status === "On Target"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {metric.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                  >
                    Recent Activity
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {department.transactions.map((tx, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {tx.description}
                        </p>
                        <p className="text-sm text-gray-500">{tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{tx.amount}</p>
                        <p className="text-sm text-emerald-600">{tx.status}</p>
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
