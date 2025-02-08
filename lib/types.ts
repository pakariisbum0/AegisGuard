export interface DAOProposal {
  id: number;
  department: string;
  proposedBudget: bigint;
  votesFor: bigint;
  votesAgainst: bigint;
  startTime: number;
  endTime: number;
  executed: boolean;
}

export interface ProposalWithMetadata {
  id: number;
  department: string;
  proposedBudget: bigint;
  votesFor: string;
  votesAgainst: string;
  startTime: number;
  endTime: number;
  executed: boolean;
  departmentName: string;
  currentBudget: string;
  votingPowerFor: string;
  votingPowerAgainst: string;
  timeRemaining: string;
  status: "Active" | "Executed" | "Expired" | "Pending Execution";
  userVote?: boolean;
}
