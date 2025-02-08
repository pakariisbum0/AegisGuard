"use client";

import { Space_Grotesk } from "next/font/google";
import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import { formatDistanceToNow, formatDistance } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  DollarSign,
  Building2,
  Activity,
  Calendar,
  Search,
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

type ActivityType = "all" | "proposals" | "budgets" | "departments";

type Activity = {
  department: string;
  departmentLogo: string;
  type: string;
  description: string;
  date: string;
  status: string;
  txHash: string;
  amount?: string;
};

type StatCard = {
  label: string;
  value: number;
  icon: React.ElementType;
  description: string;
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [selectedType, setSelectedType] = useState<ActivityType>("all");
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        const departments = await departmentSystem.fetchAllDepartments();

        const allActivities = await Promise.all(
          departments.map(async (dept) => {
            const details = await departmentSystem.getDepartmentDetailsBySlug(
              dept.name.toLowerCase().replace(/ /g, "-")
            );
            return details.recentActivity.map((activity) => ({
              ...activity,
              department: dept.name,
              departmentLogo: dept.logoUri || "/images/default-department.png",
              amount: activity.amount
                ? `$${Number(activity.amount).toLocaleString()}`
                : undefined,
            }));
          })
        );

        const flattenedActivities = allActivities
          .flat()
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        setActivities(flattenedActivities);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch activities"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    let filtered = [...activities];

    // Filter by type with more precise matching
    if (selectedType !== "all") {
      filtered = filtered.filter((activity) => {
        switch (selectedType) {
          case "proposals":
            return activity.type.toLowerCase().includes("proposal");
          case "budgets":
            return activity.type.toLowerCase().includes("budget");
          case "departments":
            return (
              activity.type.toLowerCase().includes("department") ||
              activity.type.toLowerCase().includes("efficiency")
            );
          default:
            return true;
        }
      });
    }

    // Filter by time range
    if (timeRange !== "all") {
      const now = new Date().getTime();
      const ranges = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      filtered = filtered.filter(
        (activity) =>
          now - new Date(activity.date).getTime() <=
          ranges[timeRange as keyof typeof ranges]
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchString = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.department.toLowerCase().includes(searchString) ||
          activity.type.toLowerCase().includes(searchString) ||
          activity.description.toLowerCase().includes(searchString) ||
          activity.status.toLowerCase().includes(searchString)
      );
    }

    setFilteredActivities(filtered);
  }, [searchTerm, activities, selectedType, timeRange]);

  const stats: StatCard[] = [
    {
      label: "Total Activities",
      value: activities.length,
      icon: Activity,
      description: "All activities across departments",
    },
    {
      label: "Active Proposals",
      value: activities.filter((a) => a.type.toLowerCase().includes("proposal"))
        .length,
      icon: FileText,
      description: "Proposals in review",
    },
    {
      label: "Budget Changes",
      value: activities.filter((a) => a.type.toLowerCase().includes("budget"))
        .length,
      icon: DollarSign,
      description: "Budget updates and allocations",
    },
    {
      label: "Active Departments",
      value: new Set(activities.map((a) => a.department)).size,
      icon: Building2,
      description: "Departments with recent activity",
    },
  ];

  const formatActivityDate = (date: string) => {
    const activityDate = new Date(date);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - activityDate.getTime()) / 36e5;

    if (diffHours < 24) {
      return formatDistance(activityDate, now, { addSuffix: true });
    }

    return activityDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Enhanced Header Section */}
          <div className="flex flex-col gap-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1
                  className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
                >
                  Federal Activities Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                  Real-time overview of all federal department activities
                </p>
              </div>
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by department, type, or status..."
                  className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl">
              <Tabs
                defaultValue="all"
                value={selectedType}
                onValueChange={(value) =>
                  setSelectedType(value as ActivityType)
                }
                className="w-full md:w-auto"
              >
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="all">All Activities</TabsTrigger>
                  <TabsTrigger value="proposals">Proposals</TabsTrigger>
                  <TabsTrigger value="budgets">Budget Changes</TabsTrigger>
                  <TabsTrigger value="departments">
                    Department Updates
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm bg-transparent focus:outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="day">Last 24 Hours</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Activity Cards */}
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden">
                      <Image
                        src={activity.departmentLogo}
                        alt={activity.department}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/departments/${activity.department
                            .toLowerCase()
                            .replace(/ /g, "-")}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {activity.department}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">
                            {activity.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              activity.status === "Completed"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {activity.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatActivityDate(activity.date)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{activity.description}</p>
                    {activity.amount && (
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        Amount: {activity.amount}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <span className="text-sm text-gray-400">
                        Tx: {activity.txHash.slice(0, 6)}...
                        {activity.txHash.slice(-4)}
                      </span>
                      <a
                        href={`https://evm-testnet.flowscan.io/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View Transaction →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">
                  {searchTerm
                    ? "No activities found matching your search"
                    : "No activities found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
