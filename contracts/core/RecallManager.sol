// SPDX-License-Identifier: MIT
// PharmaChain v2.0 — Gestão de recalls em tempo real
pragma solidity ^0.8.24;


import "./PharmaAccessControl.sol";


contract RecallManager is PharmaAccessControl {


    struct Recall {
        string   batchId;
        string   reason;
        address  initiator;
        uint256  startedAt;
        uint256  resolvedAt; // 0 = ativo
        string[] affectedGtins;
    }


    string[]                   public activeRecalls;
    mapping(string => Recall)  public recalls;


    event RecallInitiated(
        string indexed batchId,
        string   reason,
        address  initiator,
        uint256  timestamp
    );
    event RecallResolved(string indexed batchId, uint256 timestamp);


    constructor(address admin) PharmaAccessControl(admin) {}


    function initiateRecall(
        string   calldata batchId,
        string   calldata reason,
        string[] calldata affectedGtins
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(recalls[batchId].startedAt == 0, "RecallManager: recall ja existe");


        recalls[batchId] = Recall({
            batchId:       batchId,
            reason:        reason,
            initiator:     msg.sender,
            startedAt:     block.timestamp,
            resolvedAt:    0,
            affectedGtins: affectedGtins
        });
        activeRecalls.push(batchId);


        emit RecallInitiated(batchId, reason, msg.sender, block.timestamp);
    }


    function resolveRecall(string calldata batchId)
        external onlyRole(MANUFACTURER_ROLE)
    {
        require(recalls[batchId].startedAt > 0,  "RecallManager: recall nao existe");
        require(recalls[batchId].resolvedAt == 0, "RecallManager: ja resolvido");
        recalls[batchId].resolvedAt = block.timestamp;
        emit RecallResolved(batchId, block.timestamp);
    }


    function getActiveRecalls() external view returns (string[] memory) {
        return activeRecalls;
    }
}

