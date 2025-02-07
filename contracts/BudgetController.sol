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
    function updateDepartmentMetrics(address, uint256, uint256, uint256) external;
}

contract BudgetController {
    IDepartmentRegistry public departmentRegistry;
    
    // Reentrancy guard
    bool private locked;
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    enum TransactionType { BUDGET_ALLOCATION, PROJECT_FUNDING, BUDGET_UPDATE, EXPENSE }
    enum TransactionStatus { PENDING, COMPLETED, FAILED }

    struct Transaction {
        uint256 id;
        address department;
        TransactionType txType;
        uint256 amount;
        string description;
        TransactionStatus status;
        uint256 timestamp;
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    uint256 private constant MAX_TRANSACTION_AMOUNT = 100000 ether;
    mapping(address => uint256[]) public departmentTransactions;
    mapping(address => uint256) public departmentTransactionCount;

    event TransactionCreated(
        uint256 indexed id,
        address indexed department,
        TransactionType txType,
        uint256 amount
    );
    event TransactionCompleted(uint256 indexed id, TransactionStatus status);
    event BudgetLimitWarning(address indexed department, uint256 spent, uint256 budget);

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
        require(amount > 0 && amount <= MAX_TRANSACTION_AMOUNT, "Invalid amount");
        _;
    }

    function createTransaction(
        TransactionType txType,
        uint256 amount,
        string memory description
    ) external onlyDepartmentHead nonReentrant validateAmount(amount) returns (uint256) {
        IDepartmentRegistry.Department memory dept = departmentRegistry.getDepartmentDetails(msg.sender);
        
        if (txType == TransactionType.EXPENSE) {
            require(dept.spent + amount <= dept.budget, "Budget exceeded");
        }
        
        transactionCount++;
        uint256 transactionId = transactionCount;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            department: msg.sender,
            txType: txType,
            amount: amount,
            description: description,
            status: TransactionStatus.PENDING,
            timestamp: block.timestamp
        });
        
        departmentTransactions[msg.sender].push(transactionId);
        departmentTransactionCount[msg.sender]++;
        
        emit TransactionCreated(transactionId, msg.sender, txType, amount);
        return transactionId;
    }

    function processTransaction(uint256 transactionId) 
        external 
        onlySuperAdmin 
        nonReentrant 
    {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.id != 0, "Transaction not found");
        require(transaction.status == TransactionStatus.PENDING, "Transaction not pending");
        
        IDepartmentRegistry.Department memory dept = departmentRegistry.getDepartmentDetails(transaction.department);
        
        if (transaction.txType == TransactionType.EXPENSE) {
            require(dept.spent + transaction.amount <= dept.budget, "Budget exceeded");
            updateDepartmentBudget(transaction.department, transaction.txType, transaction.amount);
        } else if (transaction.txType == TransactionType.BUDGET_ALLOCATION) {
            require(dept.budget + transaction.amount <= MAX_TRANSACTION_AMOUNT, "Exceeds max allocation");
            updateDepartmentBudget(transaction.department, transaction.txType, transaction.amount);
        }
        
        transaction.status = TransactionStatus.COMPLETED;
        emit TransactionCompleted(transactionId, TransactionStatus.COMPLETED);
    }

    function updateDepartmentBudget(
        address department,
        TransactionType txType,
        uint256 amount
    ) internal {
        IDepartmentRegistry.Department memory dept = departmentRegistry.getDepartmentDetails(department);
        uint256 newSpent = dept.spent;
        uint256 newBudget = dept.budget;
        
        if (txType == TransactionType.EXPENSE) {
            newSpent += amount;
        } else if (txType == TransactionType.BUDGET_ALLOCATION) {
            newBudget += amount;
        }
        
        uint256 newEfficiency = calculateEfficiency(newSpent, newBudget);
        departmentRegistry.updateDepartmentMetrics(
            department,
            newEfficiency,
            dept.projects,
            newSpent
        );
        
        if (newSpent >= newBudget * 90 / 100) { // 90% threshold
            emit BudgetLimitWarning(department, newSpent, newBudget);
        }
    }

    function calculateEfficiency(uint256 spent, uint256 budget) 
        internal 
        pure 
        returns (uint256) 
    {
        if (budget == 0) return 0;
        return (spent * 100) / budget;
    }

    function getTransactionsByDepartment(address department)
        external
        view
        returns (Transaction[] memory)
    {
        uint256[] memory txIds = departmentTransactions[department];
        Transaction[] memory result = new Transaction[](txIds.length);
        
        for (uint256 i = 0; i < txIds.length; i++) {
            result[i] = transactions[txIds[i]];
        }
        
        return result;
    }

    function initializeDepartmentBudget(
        address department,
        uint256 initialBudget
    ) external onlySuperAdmin nonReentrant validateAmount(initialBudget) {
        require(
            departmentRegistry.departments(department).isActive,
            "Department not active"
        );
        
        transactionCount++;
        uint256 transactionId = transactionCount;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            department: department,
            txType: TransactionType.BUDGET_ALLOCATION,
            amount: initialBudget,
            description: "Initial budget allocation",
            status: TransactionStatus.COMPLETED,
            timestamp: block.timestamp
        });
        
        departmentTransactions[department].push(transactionId);
        departmentTransactionCount[department]++;
        
        emit TransactionCreated(transactionId, department, TransactionType.BUDGET_ALLOCATION, initialBudget);
        emit TransactionCompleted(transactionId, TransactionStatus.COMPLETED);
    }
} 