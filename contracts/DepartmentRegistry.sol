// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DepartmentRegistry {
    // Role management
    mapping(address => bool) public superAdmins;
    mapping(address => bool) public departmentHeads;
    bool public paused;

    struct Department {
        string name;
        uint256 budget;
        uint256 spent;
        uint256 efficiency;
        uint256 projects;
        bool isActive;
        address departmentHead;
        string logoUri;
    }

    mapping(address => Department) public departments;
    address[] public departmentList;

    uint256 private constant MAX_BUDGET = 1000000 ether;
    mapping(address => uint256) public departmentBalances;
    mapping(address => uint256[]) public departmentEfficiencyHistory;

    event DepartmentRegistered(
        address indexed departmentAddress, 
        string name, 
        uint256 budget,
        address departmentHead
    );
    event BudgetUpdated(address indexed departmentAddress, uint256 newBudget);
    event DepartmentHeadChanged(address indexed departmentAddress, address indexed newHead);
    event MetricsUpdated(address indexed department, uint256 efficiency, uint256 spent);
    event SystemPaused(address indexed admin);
    event SystemUnpaused(address indexed admin);

    modifier onlySuperAdmin() {
        require(superAdmins[msg.sender], "Not super admin");
        _;
    }

    modifier onlyDepartmentHead() {
        require(departmentHeads[msg.sender], "Not department head");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "System is paused");
        _;
    }

    constructor() {
        superAdmins[msg.sender] = true;
        emit SystemPaused(msg.sender);
    }

    function registerDepartment(
        address departmentAddress,
        string memory name,
        uint256 initialBudget,
        address departmentHead,
        string memory logoUri
    ) external onlySuperAdmin whenNotPaused {
        require(!departments[departmentAddress].isActive, "Department already exists");
        require(departmentHead != address(0), "Invalid department head");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(initialBudget <= MAX_BUDGET, "Budget exceeds maximum");
        
        departments[departmentAddress] = Department({
            name: name,
            budget: initialBudget,
            spent: 0,
            efficiency: 100,
            projects: 0,
            isActive: true,
            departmentHead: departmentHead,
            logoUri: logoUri
        });

        departmentList.push(departmentAddress);
        departmentHeads[departmentHead] = true;
        departmentBalances[departmentAddress] = initialBudget;

        emit DepartmentRegistered(
            departmentAddress, 
            name, 
            initialBudget,
            departmentHead
        );
    }

    function updateBudget(address departmentAddress, uint256 newBudget) 
        external 
        onlySuperAdmin 
    {
        require(departments[departmentAddress].isActive, "Department not found");
        departments[departmentAddress].budget = newBudget;
        emit BudgetUpdated(departmentAddress, newBudget);
    }

    function changeDepartmentHead(address departmentAddress, address newHead) 
        external 
        onlySuperAdmin 
    {
        require(departments[departmentAddress].isActive, "Department not found");
        address oldHead = departments[departmentAddress].departmentHead;
        
        departments[departmentAddress].departmentHead = newHead;
        departmentHeads[oldHead] = false;
        departmentHeads[newHead] = true;

        emit DepartmentHeadChanged(departmentAddress, newHead);
    }

    function getDepartmentDetails(address departmentAddress) 
        external 
        view 
        returns (Department memory) 
    {
        require(departments[departmentAddress].isActive, "Department not found");
        return departments[departmentAddress];
    }

    function updateDepartmentMetrics(
        address departmentAddress, 
        uint256 newEfficiency,
        uint256 projectCount,
        uint256 newSpent
    ) external onlySuperAdmin whenNotPaused {
        require(departments[departmentAddress].isActive, "Department not found");
        require(newSpent <= departments[departmentAddress].budget, "Exceeds budget");
        
        departments[departmentAddress].efficiency = newEfficiency;
        departments[departmentAddress].projects = projectCount;
        departments[departmentAddress].spent = newSpent;
        
        departmentEfficiencyHistory[departmentAddress].push(newEfficiency);
        
        emit MetricsUpdated(departmentAddress, newEfficiency, newSpent);
    }

    function getEfficiencyHistory(address departmentAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return departmentEfficiencyHistory[departmentAddress];
    }

    function getAllDepartments() external view returns (address[] memory) {
        return departmentList;
    }

    function pause() external onlySuperAdmin {
        paused = true;
        emit SystemPaused(msg.sender);
    }

    function unpause() external onlySuperAdmin {
        paused = false;
        emit SystemUnpaused(msg.sender);
    }

    function addSuperAdmin(address admin) external onlySuperAdmin {
        superAdmins[admin] = true;
    }

    function removeSuperAdmin(address admin) external onlySuperAdmin {
        require(msg.sender != admin, "Cannot remove self");
        superAdmins[admin] = false;
    }

    function deactivateDepartment(address departmentAddress) 
        external 
        onlySuperAdmin 
        whenNotPaused 
    {
        require(departments[departmentAddress].isActive, "Department not found");
        departments[departmentAddress].isActive = false;
        departmentHeads[departments[departmentAddress].departmentHead] = false;
    }

    function isSuperAdmin(address account) public view returns (bool) {
        return superAdmins[account];
    }
} 