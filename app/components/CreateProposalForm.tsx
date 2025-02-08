"use client";

import { useState } from "react";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import { Department } from "@/lib/types";

export function CreateProposalForm({
  departments,
}: {
  departments: Department[];
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

      await departmentSystem.createBudgetProposal(selectedDepartment, amount);

      // Reset form
      setSelectedDepartment("");
      setAmount("");
    } catch (error) {
      console.error("Failed to create proposal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Department
        </label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a department</option>
          {departments.map((dept) => (
            <option key={dept.departmentHead} value={dept.departmentHead}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Proposed Budget (ETH)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          step="0.01"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !selectedDepartment || !amount}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Creating Proposal..." : "Create Proposal"}
      </button>
    </form>
  );
}
