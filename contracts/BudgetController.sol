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
    function isDepartmentActive(address department) external view returns (bool);
    function getDepartmentBudget(address department) external view returns (uint256);
    function updateDepartmentBudget(address department, uint256 newBudget) external;
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

    enum TransactionType { 
        BUDGET_ALLOCATION,
        PROJECT_FUNDING,
        BUDGET_UPDATE,
        EXPENSE 
    }
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
    event BudgetUpdated(address indexed department, uint256 oldBudget, uint256 newBudget, uint256 transactionId);

    address public budgetDAO;

    constructor(address _departmentRegistry, address _budgetDAO) {
        departmentRegistry = IDepartmentRegistry(_departmentRegistry);
        budgetDAO = _budgetDAO;
    }

    modifier onlyDepartmentHead() {
        require(departmentRegistry.departmentHeads(msg.sender), "Not department head");
        _;
    }

    modifier onlySuperAdminOrDAO() {
        require(
            departmentRegistry.superAdmins(msg.sender) || 
            msg.sender == budgetDAO,
            "Not authorized"
        );
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
    ) public returns (uint256) {
        transactionCount++;
        uint256 transactionId = transactionCount;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            department: msg.sender,
            txType: txType,
            amount: amount,
            description: description,
            status: TransactionStatus.COMPLETED,
            timestamp: block.timestamp
        });
        
        departmentTransactions[msg.sender].push(transactionId);
        departmentTransactionCount[msg.sender]++;
        
        emit TransactionCreated(transactionId, msg.sender, txType, amount);
        emit TransactionCompleted(transactionId, TransactionStatus.COMPLETED);
        
        return transactionId;
    }

    function processTransaction(uint256 transactionId) 
        external 
        onlySuperAdminOrDAO 
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
    ) external onlySuperAdminOrDAO nonReentrant validateAmount(initialBudget) {
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

    // Function to update department budget
    function updateDepartmentBudget(address department, uint256 newBudget) 
        external 
        onlySuperAdminOrDAO 
    {
        require(departmentRegistry.isDepartmentActive(department), "Department is not active");
        uint256 currentBudget = departmentRegistry.getDepartmentBudget(department);
        
        // Create a budget update transaction
        uint256 transactionId = createTransaction(
            TransactionType.BUDGET_UPDATE,
            newBudget > currentBudget ? newBudget - currentBudget : currentBudget - newBudget,
            "Budget Update"
        );
        
        // Update the budget in DepartmentRegistry
        departmentRegistry.updateDepartmentBudget(department, newBudget);
        
        emit BudgetUpdated(department, currentBudget, newBudget, transactionId);
    }

    function submitTransaction(
        TransactionType txType,
        uint256 amount,
        string memory description
    ) external onlyDepartmentHead returns (uint256) {
        require(amount > 0 && amount <= MAX_TRANSACTION_AMOUNT, "Invalid amount");
        
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
} 