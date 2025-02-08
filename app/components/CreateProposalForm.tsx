"use client";

import { useState } from "react";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import type { Department } from "@/lib/contracts/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";

const MAX_BUDGET = 1_000_000_000; // $1 billion max budget

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
  const [currentBudget, setCurrentBudget] = useState<string>("");

  // Update current budget when department is selected
  const handleDepartmentSelect = (deptAddress: string) => {
    setSelectedDepartment(deptAddress);
    const dept = departments.find((d) => d.departmentHead === deptAddress);
    if (dept) {
      setCurrentBudget(ethers.formatEther(dept.budget));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);

    // Don't allow values above MAX_BUDGET
    if (numValue > MAX_BUDGET) {
      toast.error(`Maximum budget is $${MAX_BUDGET.toLocaleString()}`);
      return;
    }

    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (numAmount > MAX_BUDGET) {
      toast.error(`Maximum budget is $${MAX_BUDGET.toLocaleString()}`);
      return;
    }

    try {
      setSubmitting(true);
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);

      // Convert to Wei with proper decimal handling
      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await departmentSystem.createBudgetProposal(
        selectedDepartment,
        amountInWei.toString()
      );
      await tx.wait();

      toast.success("Proposal created successfully");
      setSelectedDepartment("");
      setAmount("");
      setCurrentBudget("");
      onProposalCreated?.();
    } catch (error) {
      console.error("Failed to create proposal:", error);
      toast.error("Failed to create proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={selectedDepartment}
                onValueChange={handleDepartmentSelect}
              >
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="Select a department" />
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

            {currentBudget && (
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Current Budget</p>
                <p className="text-lg font-medium">
                  ${Number(currentBudget).toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Proposed Budget (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pl-10"
                  step="0.01"
                  min="0"
                  max={MAX_BUDGET}
                  placeholder="Enter amount"
                />
              </div>
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
      </CardContent>
    </Card>
  );
}
