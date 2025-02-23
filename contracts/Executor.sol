// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVault {
    function pay(address user, uint256 amount) external;
}

contract Executor {
    address public immutable vault;
    
    struct Call {
        address target;
        bytes callData;
    }

    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Call3Value {
        address target;
        bool allowFailure;
        uint256 value;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    constructor(address _vault) {
        vault = _vault;
    }

    function aggregate(Call[] calldata calls) external payable returns (uint256 blockNumber, bytes[] memory returnData) {
        returnData = new bytes[](calls.length);
        for(uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            require(success, "Multicall3: call failed");
            returnData[i] = ret;
        }
        return (block.number, returnData);
    }

    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory returnData) {
        returnData = new Result[](calls.length);
        for(uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            if (!calls[i].allowFailure) {
                require(success, "Multicall3: call failed");
            }
            returnData[i] = Result(success, ret);
        }
        return returnData;
    }

    // Additional helper functions from the ABI
    function getBlockNumber() external view returns (uint256) {
        return block.number;
    }

    function getBlockHash(uint256 blockNumber) external view returns (bytes32) {
        return blockhash(blockNumber);
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    // ... other view functions can be implemented similarly
} 