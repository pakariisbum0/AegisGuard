"use client";

import { useState, useEffect } from "react";
import { DepartmentSystemActions } from "@/lib/contracts/actions";
import { ProposalWithMetadata } from "@/lib/types";
import { ethers } from "ethers";

export default function DAODashboard() {
  const [activeProposals, setActiveProposals] = useState<
    ProposalWithMetadata[]
  >([]);
  const [votingPower, setVotingPower] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { provider, signer } =
          await DepartmentSystemActions.connectWallet();
        const departmentSystem = new DepartmentSystemActions(provider, signer);

        // Get user address
        const address = await signer.getAddress();
        setUserAddress(address);

        // Get voting power
        const power = await departmentSystem.getVotingPower(address);
        setVotingPower(power);

        // Get active proposals with metadata
        const proposals = await departmentSystem.getActiveProposals();
        const proposalsWithMetadata = await Promise.all(
          proposals.map(async (proposal) => {
            const department = await departmentSystem.getDepartmentDetails(
              proposal.department
            );
            const now = Math.floor(Date.now() / 1000);

            return {
              ...proposal,
              departmentName: department.name,
              currentBudget: ethers.formatEther(department.budget),
              votingPowerFor: ethers.formatEther(proposal.votesFor),
              votingPowerAgainst: ethers.formatEther(proposal.votesAgainst),
              timeRemaining: formatTimeRemaining(proposal.endTime - now),
              status: getProposalStatus(proposal),
            };
          })
        );

        setActiveProposals(proposalsWithMetadata);
      } catch (error) {
        console.error("Failed to fetch DAO data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Ended";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  const getProposalStatus = (
    proposal: ProposalWithMetadata
  ): "Active" | "Executed" | "Expired" => {
    const now = Math.floor(Date.now() / 1000);
    if (proposal.executed) return "Executed";
    if (proposal.endTime < now) return "Expired";
    return "Active";
  };

  if (loading) {
    return <div>Loading DAO dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">DAO Dashboard</h1>
        <p className="text-gray-600">Your voting power: {votingPower} DOGE</p>
      </div>

      <div className="grid gap-6">
        {activeProposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            userAddress={userAddress}
          />
        ))}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal,
  userAddress,
}: {
  proposal: ProposalWithMetadata;
  userAddress: string;
}) {
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voting, setVoting] = useState<boolean>(false);

  useEffect(() => {
    checkVoteStatus();
  }, [proposal.id, userAddress]);

  const checkVoteStatus = async () => {
    try {
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);
      const voted = await departmentSystem.hasVoted(proposal.id, userAddress);
      setHasVoted(voted);
    } catch (error) {
      console.error("Failed to check vote status:", error);
    }
  };

  const handleVote = async (support: boolean) => {
    try {
      setVoting(true);
      const { provider, signer } =
        await DepartmentSystemActions.connectWallet();
      const departmentSystem = new DepartmentSystemActions(provider, signer);
      await departmentSystem.voteOnProposal(proposal.id, support);
      setHasVoted(true);
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            Budget Proposal for {proposal.departmentName}
          </h3>
          <p className="text-sm text-gray-500">
            Current Budget: {proposal.currentBudget} ETH
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            proposal.status === "Active"
              ? "bg-green-100 text-green-800"
              : proposal.status === "Executed"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {proposal.status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Proposed Budget</p>
          <p className="text-lg font-medium">
            {ethers.formatEther(proposal.proposedBudget)} ETH
          </p>
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-600">For</p>
            <p className="font-medium">{proposal.votingPowerFor} DOGE</p>
          </div>
          <div>
            <p className="text-gray-600">Against</p>
            <p className="font-medium">{proposal.votingPowerAgainst} DOGE</p>
          </div>
          <div>
            <p className="text-gray-600">Time Remaining</p>
            <p className="font-medium">{proposal.timeRemaining}</p>
          </div>
        </div>

        {proposal.status === "Active" && !hasVoted && (
          <div className="flex gap-4">
            <button
              onClick={() => handleVote(true)}
              disabled={voting}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Vote For
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={voting}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Vote Against
            </button>
          </div>
        )}

        {hasVoted && (
          <p className="text-sm text-gray-600 text-center">
            You have already voted on this proposal
          </p>
        )}
      </div>
    </div>
  );
}
