"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import { DashboardContent } from "./DashboardContent";
import { Header } from "@/app/components/Header";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setLoading(true);
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);
        const address = await signer.getAddress();
        const isAdmin = await departmentSystem.isSuperAdmin(address);

        if (!isAdmin) {
          router.push("/auth/signin");
        }
      } catch (err) {
        console.error("Failed to verify admin:", err);
        setError(err instanceof Error ? err.message : "Failed to verify admin");
        router.push("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [router]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-16 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              {/* Add loading skeleton here */}
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="pt-16 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{error}</h2>
              <button
                onClick={() => router.push("/auth/signin")}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <DashboardContent />
    </>
  );
}
