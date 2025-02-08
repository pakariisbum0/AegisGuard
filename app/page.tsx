"use client";

import Image from "next/image";
import { Inter, Space_Grotesk } from "next/font/google";
import { ProposalCard } from "./components/ProposalCard";
import { DepartmentCard } from "./components/DepartmentCard";
import { Header } from "./components/Header";
import { useState, useEffect } from "react";
import {
  DepartmentSystemActions,
  DepartmentMetrics,
} from "@/lib/contracts/actions";
import { Building2, Wallet, FolderGit2, FileCheck } from "lucide-react";
import { ethers } from "ethers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function Home() {
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [latestProposals, setLatestProposals] = useState<any[]>([]);
  console.log("latestProposals", latestProposals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usdRate, setUsdRate] = useState<number>(3000); // Default to 3000 but will be updated

  const formatUsdValue = (ethValue: string | number) => {
    const value = Number(ethValue) * usdRate;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getProposalStatus = (status: number): string => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Under Review";
      case 2:
        return "Approved";
      case 3:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getProposalProgress = (status: number): number => {
    switch (status) {
      case 0:
        return 25;
      case 1:
        return 50;
      case 2:
        return 100;
      case 3:
        return 0;
      default:
        return 0;
    }
  };

  const formatTimestamp = (timestamp: number | string | undefined): string => {
    try {
      if (!timestamp) return new Date().toISOString();

      // If it's a string, try to convert to number
      const timestampNum =
        typeof timestamp === "string" ? Number(timestamp) : timestamp;

      // Check if we need to multiply by 1000 (if timestamp is in seconds instead of milliseconds)
      const date =
        timestampNum > 1e10
          ? new Date(timestampNum)
          : new Date(timestampNum * 1000);

      // Validate the date
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }

      return date.toISOString();
    } catch (error) {
      console.warn("Error formatting timestamp:", timestamp, error);
      return new Date().toISOString();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        // Fetch metrics and departments first
        const [departmentMetrics, deps] = await Promise.all([
          departmentSystem.getDepartmentMetrics(),
          departmentSystem.fetchAllDepartments(),
        ]);

        console.log("deps", deps);
        // Process departments with USD values
        const departmentsWithUsd = await Promise.all(
          deps.slice(0, 4).map(async (dept) => {
            // Get proposals for each department
            const proposals = await departmentSystem.getProposalsByDepartment(
              dept.departmentHead
            );
            const approvedProjects = proposals.filter(
              (p: any) => Number(p.status) === 2
            ).length;

            // Get the latest proposals while we're iterating through departments
            const processedProposals = proposals
              .map((proposal: any) => {
                try {
                  let parsedDescription = "No description provided";
                  let category = proposal.category || "Infrastructure";
                  let parsedStatus = Number(proposal.status || 0);
                  let timeline = "";
                  let objectives = "";

                  try {
                    if (
                      typeof proposal.description === "string" &&
                      proposal.description.startsWith("{")
                    ) {
                      const parsed = JSON.parse(proposal.description);
                      parsedDescription =
                        parsed.description || "No description provided";
                      timeline = parsed.timeline || "";
                      objectives = parsed.objectives || "";
                      // Use category from JSON if available
                      if (parsed.category) category = parsed.category;
                    }
                  } catch (e) {
                    console.warn(
                      "Failed to parse proposal description JSON:",
                      e
                    );
                  }

                  return {
                    department: dept.name,
                    departmentLogo:
                      dept.logoUri || "/images/default-department.png",
                    amount: formatUsdValue(ethers.formatEther(proposal.amount)),
                    status: getProposalStatus(parsedStatus),
                    submittedDate: formatTimestamp(proposal.timestamp),
                    category: category,
                    description: parsedDescription,
                    timeline: timeline,
                    objectives: objectives,
                  };
                } catch (error) {
                  console.warn("Error processing proposal:", proposal, error);
                  return null;
                }
              })
              .filter(
                (proposal): proposal is NonNullable<typeof proposal> =>
                  proposal !== null
              )
              .sort(
                (a, b) =>
                  new Date(b.submittedDate).getTime() -
                  new Date(a.submittedDate).getTime()
              );

            return {
              name: dept.name,
              budget: await departmentSystem.convertEthToUsd(dept.budget),
              projects: approvedProjects,
              utilization: dept.efficiency + "%",
              logo: dept.logoUri || "/images/default-department.png",
              proposals: processedProposals,
            };
          })
        );

        // Collect all proposals from departments and get the latest 2
        const allProposals = departmentsWithUsd
          .flatMap((dept) => dept.proposals)
          .sort(
            (a: any, b: any) =>
              new Date(b.submittedDate).getTime() -
              new Date(a.submittedDate).getTime()
          )
          .slice(0, 2);

        // Get recent activity
        const allActivity = await Promise.all(
          deps.map((dept) =>
            departmentSystem.getDepartmentDetailsBySlug(
              dept.name.toLowerCase().replace(/ /g, "-")
            )
          )
        );

        const recentActivities = allActivity
          .flatMap((dept) => dept.recentActivity)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 2);

        setLatestProposals(allProposals);
        setMetrics(departmentMetrics);
        setDepartments(departmentsWithUsd);
        setRecentActivity(recentActivities);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  console.log("metrics", metrics);
  const stats = [
    {
      label: "Total Budget",
      value: metrics
        ? formatUsdValue(ethers.formatEther(metrics.totalBudgets))
        : "$0",
      icon: Wallet,
    },
    {
      label: "Total Departments",
      value: metrics?.totalDepartments || "0",
      icon: Building2,
    },

    {
      label: "Active Projects",
      value: metrics?.totalProjects || "0",
      icon: FolderGit2,
    },
    {
      label: "Approved Proposals",
      value: metrics?.approvedProposals || "0",
      icon: FileCheck,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          {/* Hero Section Skeleton */}
          <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-xl" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto max-w-md" />
                <div className="flex gap-4 justify-center">
                  <div className="w-28 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="w-28 h-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Stats Section Skeleton */}
            <div className="py-16 border-b">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Departments Section Skeleton */}
            <div className="py-16 border-b">
              <div className="flex justify-between items-center mb-12">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 border border-gray-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Section Skeleton */}
            <div className="py-16 border-b">
              <div className="flex justify-between items-center mb-12">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </div>
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                      </div>
                      <div className="w-24">
                        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Proposals Section Skeleton */}
            <div className="py-16 border-b">
              <div className="flex justify-between items-center mb-12">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 border border-gray-100"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2" />
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
                        </div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2" />
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      <Header />
      <main className="pt-16">
        {/* Simplified Hero - Remove background image for cleaner look */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1
                className={`text-4xl sm:text-5xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Federal Spending
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                  Transparency Portal
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Track and analyze government spending with real-time insights
              </p>
              <div className="flex gap-4 justify-center">
                <button className="bg-black text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                  Get Started
                </button>
                <Link
                  href="/about"
                  className="text-gray-700 bg-gray-50 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Add consistent max-width container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 1. Stats Section */}
          <div className="py-16 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-6 hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 to-violet-500/20" />
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <stat.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    {stat.change && (
                      <span
                        className={`text-${
                          stat.trend === "up" ? "emerald" : "red"
                        }-600 text-sm bg-${
                          stat.trend === "up" ? "emerald" : "red"
                        }-50 px-2 py-0.5 rounded-full`}
                      >
                        {stat.trend === "up" ? "↑" : "↓"} {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <span className="text-sm text-gray-500">
                        {stat.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Departments Section */}
          <div className="py-16 border-b">
            <div className="flex justify-between items-center mb-12">
              <h2
                className={`text-2xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Departments
              </h2>
              <a
                href="/departments"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Departments →
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {departments.map((dept, i) => (
                <DepartmentCard key={i} {...dept} />
              ))}
            </div>
          </div>

          {/* 3. Recent Activity Section */}
          <div className="py-16 border-b">
            <div className="flex justify-between items-center mb-12">
              <h2
                className={`text-2xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Recent Activity
              </h2>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Activity →
              </a>
            </div>

            {/* Show only 2 most recent transactions */}
            <div className="space-y-6">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500/20 to-violet-500/20" />
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.type}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {`$${(Number(item.amount) * 3000).toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 0,
                          }
                        )}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          item.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-sm text-gray-400">
                        Tx: {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                      </span>
                    </div>
                    <a
                      href={`https://evm-testnet.flowscan.io/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Latest Proposals Section */}
          <div className="py-16 border-b">
            <div className="flex justify-between items-center mb-12">
              <h2
                className={`text-2xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                Latest Proposals
              </h2>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Proposals →
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {latestProposals.map((proposal, index) => (
                <ProposalCard
                  key={index}
                  department={proposal.department}
                  departmentLogo={proposal.departmentLogo}
                  amount={proposal.amount}
                  status={proposal.status}
                  submittedDate={proposal.submittedDate}
                  category={proposal.category}
                  description={proposal.description}
                  timeline={proposal.timeline}
                  objectives={proposal.objectives}
                />
              ))}
              {latestProposals.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">No proposals found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <span
                className={`text-xl font-bold text-gray-900 ${spaceGrotesk.className}`}
              >
                DOGE
              </span>
              <p className="mt-2 text-sm text-gray-500">
                Department of Government Efficiency
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Links</h3>
              <ul className="space-y-3 text-sm text-gray-500">
                {["About", "Privacy", "Terms", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-500">
                {["FOIA", "Accessibility", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
