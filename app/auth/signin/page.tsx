"use client";

import { Space_Grotesk } from "next/font/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function SignIn() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleMetaMaskConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, just redirect to a demo department dashboard
      router.push("/dashboard/department-of-defense");
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
          Department Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect your wallet to access your department dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Department Selection */}
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700"
              >
                Department
              </label>
              <select
                id="department"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option>Department of Defense</option>
                <option>NASA</option>
                <option>Department of Education</option>
                <option>Department of Health & Human Services</option>
              </select>
            </div>

            {/* MetaMask Connect Button */}
            <div>
              <button
                onClick={handleMetaMaskConnect}
                disabled={isConnecting}
                className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
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
                      your department dashboard. Please contact your
                      administrator if you haven't been registered yet.
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
