"use client";

import { useState } from "react";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import { Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import { toast } from "sonner";
import { ethers } from "ethers";

export function CreateProposalForm({
  departments,
  onProposalCreated,
}: {
  departments: Department[];
  onProposalCreated?: () => void;
}) {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment || !amount) return;

    try {
      setSubmitting(true);
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      const amountInWei = ethers.parseEther(amount);

      const tx = await departmentSystem.createBudgetProposal(
        selectedDepartment,
        amountInWei.toString()
      );

      console.log("Proposal creation transaction:", tx);
      await tx.wait(); // Wait for transaction to be mined

      toast.success("Proposal created successfully");
      setSelectedDepartment("");
      setAmount("");

      // Add a small delay before refreshing to ensure the blockchain has updated
      setTimeout(() => {
        onProposalCreated?.();
      }, 2000);
    } catch (error) {
      console.error("Failed to create proposal:", error);
      toast.error("Failed to create proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  departments.length === 0
                    ? "No departments available"
                    : "Select department"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem
                  key={dept.departmentHead}
                  value={dept.departmentHead}
                >
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposed Budget (ETH)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting || !selectedDepartment || !amount}
        className="w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Proposal...
          </>
        ) : (
          "Create Proposal"
        )}
      </Button>
    </form>
  );
}
