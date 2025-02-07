// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IActivityTracker {
    struct Activity {
        uint256 id;
        address department;
        string activityType;
        uint256 amount;
        string description;
        uint256 timestamp;
        address initiator;
        bytes32 transactionHash;
        bool success;
    }

    function logActivity(
        address department,
        string memory activityType,
        uint256 amount,
        string memory description,
        address initiator,
        bytes32 transactionHash,
        bool success
    ) external;

    function getDepartmentActivities(address department, uint256 limit, uint256 offset)
        external
        view
        returns (Activity[] memory);

    function getRecentActivities(address department, uint256 limit)
        external
        view
        returns (Activity[] memory);
}

contract ActivityTracker is IActivityTracker {
    mapping(address => Activity[]) public departmentActivities;
    mapping(address => uint256) public departmentActivityCount;
    uint256 public totalActivities;

    event ActivityLogged(
        uint256 indexed id,
        address indexed department,
        string activityType,
        uint256 amount,
        string description,
        address initiator,
        bytes32 transactionHash,
        bool success
    );

    function logActivity(
        address department,
        string memory activityType,
        uint256 amount,
        string memory description,
        address initiator,
        bytes32 transactionHash,
        bool success
    ) external override {
        totalActivities++;
        uint256 activityId = totalActivities;

        Activity memory newActivity = Activity({
            id: activityId,
            department: department,
            activityType: activityType,
            amount: amount,
            description: description,
            timestamp: block.timestamp,
            initiator: initiator,
            transactionHash: transactionHash,
            success: success
        });

        departmentActivities[department].push(newActivity);
        departmentActivityCount[department]++;

        emit ActivityLogged(
            activityId,
            department,
            activityType,
            amount,
            description,
            initiator,
            transactionHash,
            success
        );
    }

    function getDepartmentActivities(
        address department,
        uint256 limit,
        uint256 offset
    ) public view override returns (Activity[] memory) {
        uint256 totalCount = departmentActivityCount[department];
        if (totalCount == 0 || offset >= totalCount) {
            return new Activity[](0);
        }

        uint256 actualLimit = limit;
        if (offset + limit > totalCount) {
            actualLimit = totalCount - offset;
        }

        Activity[] memory activities = new Activity[](actualLimit);
        for (uint256 i = 0; i < actualLimit; i++) {
            activities[i] = departmentActivities[department][totalCount - offset - i - 1];
        }

        return activities;
    }

    function getRecentActivities(
        address department,
        uint256 limit
    ) external view override returns (Activity[] memory) {
        return getDepartmentActivities(department, limit, 0);
    }
} 