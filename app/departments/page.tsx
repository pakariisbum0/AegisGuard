"use client";

import { Space_Grotesk } from "next/font/google";
import { Header } from "@/app/components/Header";
import { DepartmentCard } from "@/app/components/DepartmentCard";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { DepartmentSystemActions, Department } from "@/lib/contracts/actions";
import { setupNetwork } from "@/lib/contracts/network";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface Department {
  name: string;
  budget: string;
  spent: string;
  efficiency: string;
  projects: number;
  isActive: boolean;
  departmentHead: string;
  logoUri: string;
}

// Add this new component for the skeleton loading state
function DepartmentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gray-100 p-3 rounded-lg animate-pulse w-[56px] h-[56px]" />
        <div className="h-6 bg-gray-100 rounded w-48 animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg">
            <div className="h-4 bg-gray-100 rounded w-16 mb-2 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);
        const deps = await departmentSystem.fetchAllDepartments();

        // Get ETH/USD rate and convert budgets
        const ethRate = await departmentSystem.getEthToUsdRate();
        const departmentsWithUsd = await Promise.all(
          deps.map(async (dept) => {
            // Get all proposals for this department
            const proposals = await departmentSystem.getProposalsByDepartment(
              dept.departmentHead
            );

            // Count approved proposals as projects
            const approvedProjects = proposals.filter(
              (p: any) => Number(p.status) === 2 // 2 = APPROVED status
            ).length;

            return {
              ...dept,
              budgetUsd: await departmentSystem.convertEthToUsd(dept.budget),
              projects: approvedProjects, // Update projects count with approved proposals
            };
          })
        );

        setDepartments(departmentsWithUsd);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch departments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <>
      <Header />
      <main className="pt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1
              className={`text-3xl font-bold text-gray-900 ${spaceGrotesk.className}`}
            >
              All Departments
            </h1>
            <div className="flex items-center gap-4">
              <input
                type="search"
                placeholder="Search departments..."
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Categories</option>
                <option>Defense</option>
                <option>Science</option>
                <option>Education</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <DepartmentCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {departments.map((dept, i) => (
                <DepartmentCard
                  key={i}
                  name={dept.name}
                  budget={`${dept.budgetUsd}`}
                  projects={dept.projects.toString()}
                  utilization={dept.efficiency}
                  logo={dept.logoUri || "/images/default-department.png"}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
