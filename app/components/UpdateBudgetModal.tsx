"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DepartmentSystemActions } from "@/lib/contracts/actions";

interface UpdateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentAddress: string;
  departmentName: string;
  currentBudget: string;
  onSuccess: () => void;
}

export function UpdateBudgetModal({
  isOpen,
  onClose,
  departmentAddress,
  departmentName,
  currentBudget,
  onSuccess,
}: UpdateBudgetModalProps) {
  const [newBudget, setNewBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      // Validate the budget update
      const validation = await departmentSystem.validateBudgetUpdate(
        departmentAddress,
        newBudget
      );

      if (!validation.isValid) {
        throw new Error(validation.message || "Invalid budget update");
      }

      // Perform the update
      await departmentSystem.updateDepartmentBudget(
        departmentAddress,
        newBudget,
        `Budget update for ${departmentName}`
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update budget:", err);
      setError(err instanceof Error ? err.message : "Failed to update budget");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Update Department Budget</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Budget
              </label>
              <Input
                type="text"
                value={currentBudget}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Budget (ETH)
              </label>
              <Input
                type="number"
                step="0.000001"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="Enter new budget in ETH"
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Budget"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
