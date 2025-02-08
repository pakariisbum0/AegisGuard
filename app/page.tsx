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

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function Home() {
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        // Fetch metrics and departments in parallel
        const [departmentMetrics, deps] = await Promise.all([
          departmentSystem.getDepartmentMetrics(),
          departmentSystem.fetchAllDepartments(),
        ]);

        // Process departments with USD values
        const departmentsWithUsd = await Promise.all(
          deps.slice(0, 4).map(async (dept) => {
            const proposals = await departmentSystem.getProposalsByDepartment(
              dept.departmentHead
            );
            const approvedProjects = proposals.filter(
              (p: any) => Number(p.status) === 2
            ).length;

            return {
              name: dept.name,
              budget: await departmentSystem.convertEthToUsd(dept.budget),
              projects: approvedProjects,
              utilization: dept.efficiency + "%",
              logo: dept.logoUri || "/images/default-department.png",
            };
          })
        );

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

  console.log("metrics", metrics);
  const stats = [
    {
      label: "Total Budget",
      value: metrics
        ? `$${((Number(metrics.totalBudgets) / 1e18) * 3000).toLocaleString(
            "en-US",
            {
              maximumFractionDigits: 0,
            }
          )}`
        : "Loading...",
      change: "+12.3%",
      trend: "up",
    },
    {
      label: "Departments",
      value: metrics ? `${metrics.totalDepartments}+` : "Loading...",
      change: "+2",
      trend: "up",
    },
    {
      label: "Active Projects",
      value: metrics ? metrics.approvedProposals.toString() : "Loading...",
      change: "-234",
      trend: "down",
    },
    {
      label: "Pending Proposals",
      value: metrics ? metrics.pendingProposals.toString() : "Loading...",
      change: metrics ? `+${metrics.pendingProposals}` : "+0",
      trend: "up",
      subtitle: "Awaiting Review",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
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
                <button className="text-gray-700 bg-gray-50 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                  Learn More
                </button>
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
                  {stat.change && (
                    <div className="mt-2 flex items-center">
                      {stat.trend === "up" ? (
                        <span className="text-emerald-600 text-sm bg-emerald-50 px-2 py-0.5 rounded-full">
                          ↑ {stat.change}
                        </span>
                      ) : (
                        <span className="text-red-600 text-sm bg-red-50 px-2 py-0.5 rounded-full">
                          ↓ {stat.change}
                        </span>
                      )}
                    </div>
                  )}
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
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      View Details →
                    </button>
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
              {[
                {
                  department: "Department of Education",
                  amount: "$75M",
                  status: "Under Review",
                  submittedDate: "2024-03-10",
                  category: "Infrastructure",
                  description:
                    "Modernization of educational facilities and digital learning platforms across 500 schools.",
                  progress: 65,
                },
                {
                  department: "NASA",
                  amount: "$120M",
                  status: "Pending",
                  submittedDate: "2024-03-12",
                  category: "Research",
                  description:
                    "Advanced propulsion systems research and development for deep space exploration missions.",
                  progress: 30,
                },
              ].map((proposal) => (
                <ProposalCard key={proposal.department} {...proposal} />
              ))}
            </div>
          </div>

          {/* 5. AI Monitoring Section */}
          <div className="py-16">
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <h2
                className={`text-2xl font-bold text-gray-900 mb-4 ${spaceGrotesk.className}`}
              >
                AI-Powered Monitoring
              </h2>
              <p className="text-gray-600 mb-8">
                Our AI system continuously monitors transactions for anomalies
                and ensures spending compliance.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Transactions Monitored", value: "1.2M+" },
                  { label: "Anomalies Detected", value: "142" },
                  { label: "Accuracy Rate", value: "99.9%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                  >
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
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
