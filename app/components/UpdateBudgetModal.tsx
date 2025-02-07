"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

  const handleClose = () => {
    setNewBudget("");
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!newBudget) {
        throw new Error("Please enter a new budget amount");
      }

      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      try {
        // Perform the update with more detailed error handling
        const tx = await departmentSystem.updateDepartmentBudget(
          departmentAddress,
          newBudget,
          `Budget update for ${departmentName}`
        );

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);

        onSuccess();
        handleClose();
      } catch (txError: any) {
        console.error("Transaction error details:", txError);

        // Handle specific contract revert reasons
        if (txError.data) {
          throw new Error(`Transaction failed: ${txError.data.message}`);
        } else if (txError.reason) {
          throw new Error(`Transaction failed: ${txError.reason}`);
        } else if (txError.message) {
          if (txError.message.includes("require")) {
            const revertMatch = txError.message.match(/reason="([^"]+)"/);
            if (revertMatch) {
              throw new Error(`Contract reverted: ${revertMatch[1]}`);
            }
          }
          if (txError.message.includes("insufficient funds")) {
            throw new Error("Insufficient funds to perform this transaction");
          }
          if (txError.message.includes("gas required exceeds allowance")) {
            throw new Error("Transaction would exceed gas limits");
          }
        }
        throw new Error(
          "Transaction failed. Please check the console for details."
        );
      }
    } catch (err) {
      console.error("Failed to update budget:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      modal={true}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onEscapeKeyDown={handleClose}
        onInteractOutside={handleClose}
      >
        <DialogHeader>
          <DialogTitle>Update Department Budget</DialogTitle>
        </DialogHeader>
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
            <div className="p-3 text-sm bg-red-50 rounded-md">
              <div className="font-medium text-red-800">Error</div>
              <div className="text-red-600">{error}</div>
              <div className="mt-2 text-xs text-red-500">
                If this persists, please check: - You have sufficient
                permissions - The new budget amount is valid - Your wallet is
                connected to the correct network
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
