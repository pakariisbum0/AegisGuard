"use client";

import { Space_Grotesk } from "next/font/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

  const handleMetaMaskConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Route based on selected role
      if (selectedRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard/department-of-defense");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
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
                onValueChange={(value) => setSelectedRole(value)}
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

            {/* Department Selection - Only show for department role */}
            {selectedRole === "department" && (
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department
                </label>
                <Select defaultValue="dod">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dod">Department of Defense</SelectItem>
                    <SelectItem value="nasa">NASA</SelectItem>
                    <SelectItem value="education">
                      Department of Education
                    </SelectItem>
                    <SelectItem value="health">
                      Department of Health & Human Services
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* MetaMask Connect Button */}
            <div>
              <button
                onClick={handleMetaMaskConnect}
                disabled={isConnecting}
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
