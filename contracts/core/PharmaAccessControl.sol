// SPDX-License-Identifier: MIT
// PharmaChain v2.0 — Controle de acesso centralizado
pragma solidity ^0.8.24;


import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";


contract PharmaAccessControl is AccessControl, Pausable {


    bytes32 public constant MANUFACTURER_ROLE  = keccak256("MANUFACTURER");
    bytes32 public constant DISTRIBUTOR_ROLE   = keccak256("DISTRIBUTOR");
    bytes32 public constant PHARMACY_ROLE      = keccak256("PHARMACY");
    bytes32 public constant DOCTOR_ROLE        = keccak256("DOCTOR");
    bytes32 public constant AUDITOR_ROLE       = keccak256("AUDITOR");


    event ParticipantRegistered(
        address indexed account,
        bytes32 indexed role,
        string  cnpj
    );


    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }


    function registerParticipant(
        address account,
        bytes32 role,
        string calldata cnpj
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
        emit ParticipantRegistered(account, role, cnpj);
    }


    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}

