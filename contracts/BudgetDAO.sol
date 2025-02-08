// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./GovernanceToken.sol";
import "./BudgetController.sol";
import "./DepartmentRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BudgetDAO is Ownable {
    GovernanceToken public token;
    BudgetController public budgetController;
    DepartmentRegistry public departmentRegistry;

    struct BudgetProposal {
        uint256 id;
        address department;
        uint256 proposedBudget;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => BudgetProposal) public budgetProposals;
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant EXECUTION_DELAY = 1 days;

    event BudgetProposalCreated(uint256 indexed id, address department, uint256 amount);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(
        address _token,
        address _budgetController,
        address _departmentRegistry
    ) Ownable(msg.sender) {
        token = GovernanceToken(_token);
        budgetController = BudgetController(_budgetController);
        departmentRegistry = DepartmentRegistry(_departmentRegistry);
    }

    function proposeBudget(address department, uint256 amount) external returns (uint256) {
        require(token.balanceOf(msg.sender) > 0, "Must hold governance tokens");
        
        proposalCount++;
        BudgetProposal storage proposal = budgetProposals[proposalCount];
        proposal.id = proposalCount;
        proposal.department = department;
        proposal.proposedBudget = amount;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;

        emit BudgetProposalCreated(proposalCount, department, amount);
        return proposalCount;
    }

    function vote(uint256 proposalId, bool support) external {
        BudgetProposal storage proposal = budgetProposals[proposalId];
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(token.balanceOf(msg.sender) > 0, "Must hold governance tokens");

        uint256 voteWeight = token.balanceOf(msg.sender);
        
        if (support) {
            proposal.votesFor += voteWeight;
        } else {
            proposal.votesAgainst += voteWeight;
        }

        proposal.hasVoted[msg.sender] = true;
        emit Voted(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external {
        BudgetProposal storage proposal = budgetProposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(block.timestamp >= proposal.endTime + EXECUTION_DELAY, "Execution delay not met");

        if (proposal.votesFor > proposal.votesAgainst) {
            budgetController.updateDepartmentBudget(
                proposal.department,
                proposal.proposedBudget
            );
            proposal.executed = true;
            emit ProposalExecuted(proposalId);
        }
    }

    // View functions for frontend AI integration
    function getProposalDetails(uint256 proposalId) external view returns (
        uint256 id,
        address department,
        uint256 proposedBudget,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 startTime,
        uint256 endTime,
        bool executed
    ) {
        BudgetProposal storage proposal = budgetProposals[proposalId];
        return (
            proposal.id,
            proposal.department,
            proposal.proposedBudget,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed
        );
    }

    function setBudgetController(address _budgetController) external {
        require(msg.sender == owner(), "Not owner");
        require(address(budgetController) == address(0), "Already initialized");
        budgetController = BudgetController(_budgetController);
    }

    // Add a function to get all proposals
    function getAllProposals() external view returns (
        uint256[] memory ids,
        address[] memory departments,
        uint256[] memory budgets,
        uint256[] memory votesFor,
        uint256[] memory votesAgainst,
        uint256[] memory startTimes,
        uint256[] memory endTimes,
        bool[] memory executed
    ) {
        uint256[] memory proposalIds = new uint256[](proposalCount);
        address[] memory depts = new address[](proposalCount);
        uint256[] memory proposedBudgets = new uint256[](proposalCount);
        uint256[] memory vFor = new uint256[](proposalCount);
        uint256[] memory vAgainst = new uint256[](proposalCount);
        uint256[] memory starts = new uint256[](proposalCount);
        uint256[] memory ends = new uint256[](proposalCount);
        bool[] memory execs = new bool[](proposalCount);

        for (uint256 i = 1; i <= proposalCount; i++) {
            BudgetProposal storage proposal = budgetProposals[i];
            proposalIds[i-1] = i;
            depts[i-1] = proposal.department;
            proposedBudgets[i-1] = proposal.proposedBudget;
            vFor[i-1] = proposal.votesFor;
            vAgainst[i-1] = proposal.votesAgainst;
            starts[i-1] = proposal.startTime;
            ends[i-1] = proposal.endTime;
            execs[i-1] = proposal.executed;
        }

        return (proposalIds, depts, proposedBudgets, vFor, vAgainst, starts, ends, execs);
    }

    // Add this function to check if an address has voted on a proposal
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        return budgetProposals[proposalId].hasVoted[voter];
    }
} 