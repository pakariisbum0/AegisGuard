"use client";

import { Space_Grotesk } from "next/font/google";
import { Header } from "@/app/components/Header";
import { useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import { setupNetwork } from "@/lib/contracts/network";
import { useDropzone } from "react-dropzone";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface DepartmentForm {
  name: string;
  description: string;
  initialBudget: string;
  walletAddress: string;
  logo?: File;
}

export default function AddDepartment() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DepartmentForm>({
    name: "",
    description: "",
    initialBudget: "",
    walletAddress: "",
  });

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.url) {
        throw new Error(data.error || "Upload failed");
      }

      console.log(data.url);
      // Return the Cloudinary URL
      return data.url;
    } catch (error) {
      console.error("Failed to upload logo:", error);
      throw new Error("Failed to upload logo");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setForm((prev) => ({ ...prev, logo: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask to continue");
      }

      // Setup network first
      await setupNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      // Get current user address and make them super admin
      const address = await signer.getAddress();

      console.log(address);

      // Since this is testnet, we'll make the first connected user a super admin
      try {
        await departmentSystem.addSuperAdmin(address);
      } catch (error) {
        // Ignore error if user is already admin
        console.log("User might already be admin:", error);
      }

      // Convert budget to wei
      const budgetInWei = DepartmentSystemActions.formatAmount(
        form.initialBudget
      );

      let logoUri = "";
      if (form.logo) {
        try {
          logoUri = await uploadToIPFS(form.logo);
        } catch (error) {
          setError("Failed to upload logo. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // Register department with logo
      const tx = await departmentSystem.registerDepartment(
        form.walletAddress,
        form.name,
        budgetInWei,
        form.walletAddress,
        logoUri
      );

      await tx;
      router.push("/departments");
    } catch (err) {
      console.error("Failed to add department:", err);
      setError(err instanceof Error ? err.message : "Failed to add department");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-16 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle className={spaceGrotesk.className}>
                Add New Department
              </CardTitle>
              <CardDescription>
                Register a new department on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Department of Defense"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Enter department description"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Initial Budget (ETH)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.000001"
                    value={form.initialBudget}
                    onChange={(e) =>
                      setForm({ ...form, initialBudget: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Department Wallet Address</Label>
                  <Input
                    id="wallet"
                    value={form.walletAddress}
                    onChange={(e) =>
                      setForm({ ...form, walletAddress: e.target.value })
                    }
                    placeholder="0x..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Department Logo</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${
                        isDragActive
                          ? "border-black bg-gray-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <input {...getInputProps()} />
                    {form.logo ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={URL.createObjectURL(form.logo)}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <p className="text-sm text-gray-600">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm text-gray-600">
                          {isDragActive
                            ? "Drop the logo here"
                            : "Click or drag logo to upload (max 5MB)"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Adding Department...
                      </>
                    ) : (
                      "Add Department"
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
