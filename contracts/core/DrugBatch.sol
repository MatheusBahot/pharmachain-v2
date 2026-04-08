// SPDX-License-Identifier: MIT
// PharmaChain v2.0 — Registro e rastreabilidade de lotes
pragma solidity ^0.8.24;


import "./PharmaAccessControl.sol";


contract DrugBatch is PharmaAccessControl {


    struct Batch {
        string  id;           // UUID gerado pelo backend
        string  gtin;         // GTIN-14 ANVISA
        string  lot;          // Número do lote do fabricante
        uint256 expiryTs;     // Unix timestamp da validade
        uint256 quantity;     // Unidades disponíveis
        address manufacturer; // Endereço do fabricante
        bool    recalled;     // Flag de recall ativo
        bytes32 dataHash;     // SHA-256 dos dados completos (off-chain)
    }


    struct TransferEvent {
        address from;
        address to;
        uint256 quantity;
        uint256 timestamp;
        bytes32 nfeHash;      // SHA-256 da NF-e vinculada
    }


    mapping(string => Batch)            public batches;
    mapping(string => TransferEvent[])  public history;


    event BatchRegistered(string indexed id, string gtin, address manufacturer);
    event BatchTransferred(string indexed id, address from, address to, uint256 qty);
    event BatchRecalled(string indexed id, address initiator, uint256 timestamp);
    event BatchDispensed(string indexed id, string prescriptionId, address pharmacy);


    constructor(address admin) PharmaAccessControl(admin) {}


    // ── Fabricante registra novo lote ──────────────────────────────────
    function registerBatch(
        string  calldata id,
        string  calldata gtin,
        string  calldata lot,
        uint256 expiryTs,
        uint256 quantity,
        bytes32 dataHash
    ) external onlyRole(MANUFACTURER_ROLE) whenNotPaused {
        require(bytes(batches[id].id).length == 0, "DrugBatch: lote ja existe");
        require(expiryTs > block.timestamp, "DrugBatch: validade no passado");
        require(quantity > 0, "DrugBatch: quantidade zero");


        batches[id] = Batch({
            id:           id,
            gtin:         gtin,
            lot:          lot,
            expiryTs:     expiryTs,
            quantity:     quantity,
            manufacturer: msg.sender,
            recalled:     false,
            dataHash:     dataHash
        });


        emit BatchRegistered(id, gtin, msg.sender);
    }


    // ── Transferência entre participantes (com hash NF-e) ──────────────
    function transferBatch(
        string  calldata id,
        address to,
        uint256 quantity,
        bytes32 nfeHash
    ) external whenNotPaused {
        Batch storage b = batches[id];
        require(bytes(b.id).length > 0,        "DrugBatch: lote nao existe");
        require(!b.recalled,                   "DrugBatch: lote em recall");
        require(b.expiryTs > block.timestamp,  "DrugBatch: lote vencido");
        require(b.quantity >= quantity,         "DrugBatch: estoque insuficiente");
        require(to != address(0),              "DrugBatch: destinatario invalido");


        b.quantity -= quantity;
        history[id].push(TransferEvent({
            from:      msg.sender,
            to:        to,
            quantity:  quantity,
            timestamp: block.timestamp,
            nfeHash:   nfeHash
        }));


        emit BatchTransferred(id, msg.sender, to, quantity);
    }


    // ── Recall de lote ─────────────────────────────────────────────────
    function recallBatch(string calldata id)
        external onlyRole(MANUFACTURER_ROLE)
    {
        require(bytes(batches[id].id).length > 0, "DrugBatch: lote nao existe");
        batches[id].recalled = true;
        emit BatchRecalled(id, msg.sender, block.timestamp);
    }


    // ── Dispensação por receita (apenas farmácias) ─────────────────────
    function dispenseBatch(
        string calldata batchId,
        string calldata prescriptionId,
        uint256 quantity
    ) external onlyRole(PHARMACY_ROLE) whenNotPaused {
        Batch storage b = batches[batchId];
        require(!b.recalled,                  "DrugBatch: lote em recall");
        require(b.expiryTs > block.timestamp, "DrugBatch: lote vencido");
        require(b.quantity >= quantity,        "DrugBatch: estoque insuficiente");
        b.quantity -= quantity;
        emit BatchDispensed(batchId, prescriptionId, msg.sender);
    }


    // ── Leitura do histórico completo de um lote ───────────────────────
    function getBatchHistory(string calldata id)
        external view returns (TransferEvent[] memory)
    {
        return history[id];
    }
}

