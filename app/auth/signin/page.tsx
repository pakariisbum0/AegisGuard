"use client";

import { Space_Grotesk } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import { DepartmentSystemActions, Department } from "@/lib/contracts/actions";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function SignIn() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("department");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);
        const deps = await departmentSystem.fetchAllDepartments();

        // Filter only active departments and sort by name
        const activeDeps = deps
          .filter((d) => d.isActive)
          .sort((a, b) => a.name.localeCompare(b.name));

        console.log("Active departments:", activeDeps);
        setDepartments(activeDeps);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch departments"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleMetaMaskConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      const { redirectPath } = await departmentSystem.authenticateUser(
        selectedRole as "admin" | "department",
        selectedRole === "department" ? selectedDepartment : undefined
      );

      router.push(redirectPath);
    } catch (error) {
      console.error("Failed to connect:", error);
      setError(error instanceof Error ? error.message : "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span
            className={`text-2xl font-bold text-gray-900 ${spaceGrotesk.className}`}
          >
            DOGE
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect your wallet to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <Select
                value={selectedRole}
                onValueChange={(value) => {
                  setSelectedRole(value);
                  setSelectedDepartment(""); // Reset department selection when role changes
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department">Department Head</SelectItem>
                  <SelectItem value="admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Selection */}
            {selectedRole === "department" && (
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department
                </label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                  disabled={isLoading || departments.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoading
                          ? "Loading departments..."
                          : departments.length === 0
                          ? "No departments available"
                          : "Select department"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.departmentHead} value={dept.name}>
                        <div className="flex items-center gap-2">
                          {dept.logoUri && (
                            <Image
                              src={dept.logoUri}
                              alt={dept.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          )}
                          <span>{dept.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Connect Button */}
            <div>
              <button
                onClick={handleMetaMaskConnect}
                disabled={
                  isConnecting ||
                  (selectedRole === "department" && !selectedDepartment) ||
                  isLoading
                }
                className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Image
                  src="/images/metamask-fox.svg"
                  alt="MetaMask"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                {isConnecting ? "Connecting..." : "Connect with MetaMask"}
              </button>
            </div>

            {/* Information Box */}
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    Authentication Required
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      You need to have a registered wallet address to access
                      your dashboard. Please contact your administrator if you
                      haven't been registered yet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
