import { prisma }             from "../storage/prisma";
import { redis }              from "../storage/redis";
import { blockchainService }  from "../core/blockchain";
import { sha256, encrypt }    from "../core/crypto";
import { p2pServer, MSG }     from "../network/p2p";


export interface RegisterBatchInput {
  gtin:         string;
  lot:          string;
  productName:  string;
  expiryDate:   string; // ISO 8601
  quantity:     number;
  unitPrice:    number;
  manufacturerId: string;
}


export class BatchService {


  async register(input: RegisterBatchInput) {
    // 1. Calcular hash dos dados completos (LGPD — não vai on-chain)
    const dataHash = sha256(input);


    // 2. Salvar no PostgreSQL primeiro (fonte de verdade off-chain)
    const batch = await prisma.drugBatch.create({
      data: {
        gtin:           input.gtin,
        lot:            input.lot,
        productName:    input.productName,
        expiryDate:     new Date(input.expiryDate),
        quantity:       input.quantity,
        unitPrice:      input.unitPrice,
        manufacturerId: input.manufacturerId,
        dataHash,
      }
    });


    // 3. Registrar on-chain
    const expiryTs = Math.floor(new Date(input.expiryDate).getTime() / 1000);
    const txHash = await blockchainService.registerBatch({
      id:       batch.id,
      gtin:     input.gtin,
      lot:      input.lot,
      expiryTs,
      quantity: input.quantity,
      dataHash,
    });


    // 4. Atualizar txHash no PostgreSQL
    await prisma.drugBatch.update({
      where: { id: batch.id },
      data:  { txHash }
    });


    // 5. Invalidar cache de estoque
    await redis.del(`stock:${input.manufacturerId}`);


    return { ...batch, txHash };
  }


  async transfer(params: {
    batchId: string; fromId: string; toId: string;
    quantity: number; nfeKey?: string; nfeHash?: string;
    type: string; signature: string;
  }) {
    const batch = await prisma.drugBatch.findUniqueOrThrow({
      where: { id: params.batchId }
    });


    if (batch.status !== "ACTIVE")
      throw new Error("Lote não está ACTIVE");
    if (batch.quantity < params.quantity)
      throw new Error("Estoque insuficiente");


    const to = await prisma.participant.findUniqueOrThrow({
      where: { id: params.toId }
    });


    // Registrar on-chain
    const txHash = await blockchainService.transferBatch({
      batchId:  params.batchId,
      to:       to.address,
      quantity: params.quantity,
      nfeHash:  params.nfeHash ?? "",
    });


    // Persistir transferência
    const transfer = await prisma.transfer.create({
      data: {
        batchId:   params.batchId,
        fromId:    params.fromId,
        toId:      params.toId,
        quantity:  params.quantity,
        type:      params.type as any,
        nfeKey:    params.nfeKey,
        nfeHash:   params.nfeHash,
        signature: params.signature,
        txHash,
      }
    });


    // Atualizar estoque off-chain
    await prisma.drugBatch.update({
      where: { id: params.batchId },
      data:  { quantity: { decrement: params.quantity } }
    });


    // Invalidar caches
    await redis.del(`stock:${params.fromId}`);
    await redis.del(`stock:${params.toId}`);


    // Propagar para rede P2P
    p2pServer.broadcast(MSG.NEW_TX, { type: "TRANSFER", batchId: params.batchId });


    return transfer;
  }


  async recall(batchId: string, reason: string, initiatorId: string) {
    const batch = await prisma.drugBatch.findUniqueOrThrow({ where: { id: batchId } });


    const txHash = await blockchainService.initiateRecall(
      batchId, reason, [batch.gtin]
    );


    await prisma.drugBatch.update({
      where: { id: batchId },
      data:  { status: "RECALLED" }
    });


    // Broadcast P2P urgente
    p2pServer.broadcastRecall(batchId, reason);


    return { batchId, txHash };
  }


  async getStock(participantId: string) {
    const cacheKey = `stock:${participantId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);


    const transfers = await prisma.transfer.findMany({
      where: { toId: participantId },
      include: { batch: { select: { gtin: true, productName: true, expiryDate: true } } }
    });


    // Calcula estoque: entradas - saídas
    const stockMap: Record<string,any> = {};
    for (const t of transfers) {
      const key = t.batchId;
      if (!stockMap[key]) {
        stockMap[key] = { batchId: key, ...t.batch, quantity: 0 };
      }
      stockMap[key].quantity += t.quantity;
    }


    // Subtrai saídas
    const sent = await prisma.transfer.findMany({
      where: { fromId: participantId }
    });
    for (const t of sent) {
      if (stockMap[t.batchId]) stockMap[t.batchId].quantity -= t.quantity;
    }


    const stock = Object.values(stockMap).filter((s:any) => s.quantity > 0);
    await redis.setex(cacheKey, 30, JSON.stringify(stock));
    return stock;
  }
}


export const batchService = new BatchService();

