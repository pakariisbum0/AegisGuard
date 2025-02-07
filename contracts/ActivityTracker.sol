// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDepartmentRegistry {
    function superAdmins(address) external view returns (bool);
    function departmentHeads(address) external view returns (bool);
}

contract ActivityTracker {
    IDepartmentRegistry public departmentRegistry;

    struct Activity {
        uint256 id;
        address department;
        string activityType;
        uint256 amount;
        string description;
        uint256 timestamp;
        bytes32 txHash;
        string status;
    }

    mapping(address => Activity[]) public departmentActivities;
    mapping(address => uint256) public activityCount;
    uint256 public totalActivities;

    event ActivityLogged(
        uint256 indexed id,
        address indexed department,
        string activityType,
        uint256 amount,
        string description,
        bytes32 txHash,
        string status
    );

    constructor(address _departmentRegistry) {
        departmentRegistry = IDepartmentRegistry(_departmentRegistry);
    }

    modifier onlyAuthorized() {
        require(
            departmentRegistry.superAdmins(msg.sender) ||
            departmentRegistry.departmentHeads(msg.sender),
            "Not authorized"
        );
        _;
    }

    function logActivity(
        address department,
        string memory activityType,
        uint256 amount,
        string memory description,
        bytes32 txHash,
        string memory status
    ) external onlyAuthorized {
        totalActivities++;
        uint256 activityId = totalActivities;

        Activity memory newActivity = Activity({
            id: activityId,
            department: department,
            activityType: activityType,
            amount: amount,
            description: description,
            timestamp: block.timestamp,
            txHash: txHash,
            status: status
        });

        departmentActivities[department].push(newActivity);
        activityCount[department]++;

        emit ActivityLogged(
            activityId,
            department,
            activityType,
            amount,
            description,
            txHash,
            status
        );
    }

    function getDepartmentActivities(address department) 
        external 
        view 
        returns (Activity[] memory) 
    {
        return departmentActivities[department];
    }

    function getRecentActivities(address department, uint256 limit) 
        external 
        view 
        returns (Activity[] memory) 
    {
        uint256 count = activityCount[department];
        uint256 resultCount = limit < count ? limit : count;
        Activity[] memory result = new Activity[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = departmentActivities[department][count - 1 - i];
        }
        
        return result;
    }
} 