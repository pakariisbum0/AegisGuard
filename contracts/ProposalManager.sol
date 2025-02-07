// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DepartmentRegistry.sol";

// Import the Department struct
interface IDepartmentRegistry {
    struct Department {
        string name;
        uint256 budget;
        uint256 spent;
        uint256 efficiency;
        uint256 projects;
        bool isActive;
        address departmentHead;
    }
    
    function getDepartmentDetails(address departmentAddress) external view returns (Department memory);
    function departments(address) external view returns (Department memory);
    function departmentHeads(address) external view returns (bool);
    function superAdmins(address) external view returns (bool);
}

contract ProposalManager {
    IDepartmentRegistry public departmentRegistry;
    
    // Reentrancy guard
    bool private locked;
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    enum ProposalStatus { PENDING, UNDER_REVIEW, APPROVED, REJECTED }

    struct Proposal {
        uint256 id;
        address department;
        string title;
        uint256 amount;
        string description;
        ProposalStatus status;
        uint256 submittedDate;
        uint256 reviewedDate;
        address reviewedBy;
        string category;
    }

    struct ProposalComment {
        address commenter;
        string comment;
        uint256 timestamp;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => ProposalComment[]) public proposalComments;
    mapping(address => uint256[]) public departmentProposals;
    uint256 public proposalCount;

    event ProposalSubmitted(uint256 indexed id, address indexed department, uint256 amount);
    event ProposalReviewed(uint256 indexed id, ProposalStatus status, address reviewer);
    event CommentAdded(uint256 indexed proposalId, address indexed commenter, string comment);

    constructor(address _departmentRegistry) {
        departmentRegistry = IDepartmentRegistry(_departmentRegistry);
    }

    modifier onlyDepartmentHead() {
        require(departmentRegistry.departmentHeads(msg.sender), "Not department head");
        _;
    }

    modifier onlySuperAdmin() {
        require(departmentRegistry.superAdmins(msg.sender), "Not super admin");
        _;
    }

    modifier validateAmount(uint256 amount) {
        require(amount > 0, "Amount must be positive");
        _;
    }

    function submitProposal(
        string memory title,
        uint256 amount,
        string memory description,
        string memory category
    ) external onlyDepartmentHead nonReentrant validateAmount(amount) returns (uint256) {
        IDepartmentRegistry.Department memory dept = departmentRegistry.getDepartmentDetails(msg.sender);
        require(amount <= dept.budget - dept.spent, "Insufficient budget");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            department: msg.sender,
            title: title,
            amount: amount,
            description: description,
            status: ProposalStatus.PENDING,
            submittedDate: block.timestamp,
            reviewedDate: 0,
            reviewedBy: address(0),
            category: category
        });
        
        departmentProposals[msg.sender].push(proposalId);
        emit ProposalSubmitted(proposalId, msg.sender, amount);
        return proposalId;
    }

    function reviewProposal(
        uint256 proposalId,
        ProposalStatus newStatus
    ) external onlySuperAdmin nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal not found");
        require(proposal.status == ProposalStatus.PENDING, "Proposal not pending");

        proposal.status = newStatus;
        proposal.reviewedDate = block.timestamp;
        proposal.reviewedBy = msg.sender;

        emit ProposalReviewed(proposalId, newStatus, msg.sender);
    }

    function getProposalsByDepartment(address department) 
        external 
        view 
        returns (Proposal[] memory) 
    {
        uint256[] memory proposalIds = departmentProposals[department];
        Proposal[] memory result = new Proposal[](proposalIds.length);
        
        for (uint256 i = 0; i < proposalIds.length; i++) {
            result[i] = proposals[proposalIds[i]];
        }
        
        return result;
    }

    function addProposalComment(
        uint256 proposalId, 
        string memory comment
    ) external onlySuperAdmin {
        require(proposals[proposalId].id != 0, "Proposal not found");
        
        proposalComments[proposalId].push(ProposalComment({
            commenter: msg.sender,
            comment: comment,
            timestamp: block.timestamp
        }));
        
        emit CommentAdded(proposalId, msg.sender, comment);
    }

    function getProposalComments(uint256 proposalId) 
        external 
        view 
        returns (ProposalComment[] memory) 
    {
        return proposalComments[proposalId];
    }

    function initializeDepartmentProposals(address department) 
        external 
        onlySuperAdmin 
    {
        require(
            departmentRegistry.departments(department).isActive,
            "Department not active"
        );
        departmentProposals[department] = new uint256[](0);
    }
} 