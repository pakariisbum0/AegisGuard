// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract Vault {
    address public immutable USDC;
    mapping(address => uint256) public balances;
    address private owner;

    event Deposit(address indexed owner, uint256 amount);
    event Withdrawal(address indexed owner, uint256 amount);
    event Payment(address indexed user, uint256 amount);

    error InsufficientBalance();
    error Unauthorized();
    error TransferFailed();
    error NoBalance();

    constructor(address _owner, address _usdc) {
        owner = _owner;
        USDC = _usdc;
    }

    function deposit(
        address _owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        // Verify and accept USDC deposit with permit
        IERC20(USDC).permit(_owner, spender, value, deadline, v, r, s);
        
        bool success = IERC20(USDC).transferFrom(_owner, address(this), value);
        if (!success) revert TransferFailed();
        
        balances[_owner] += value;
        emit Deposit(_owner, value);
    }

    function withdraw(uint256 amount) external {
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        
        balances[msg.sender] -= amount;
        bool success = IERC20(USDC).transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
        
        emit Withdrawal(msg.sender, amount);
    }

    function redeem() external {
        uint256 amount = balances[msg.sender];
        if (amount == 0) revert NoBalance();
        
        balances[msg.sender] = 0;
        bool success = IERC20(USDC).transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
        
        emit Withdrawal(msg.sender, amount);
    }

    function pay(address user, uint256 amount) external {
        if (msg.sender != owner) revert Unauthorized();
        if (balances[user] < amount) revert InsufficientBalance();
        
        balances[user] -= amount;
        emit Payment(user, amount);
    }
} 