import { Router, Request, Response } from "express";
import { z }               from "zod";
import { authenticate, requireRole } from "../middlewares/auth";
import { batchService }    from "../../application/BatchService";
import { prisma }          from "../../storage/prisma";
import { blockchainService } from "../../core/blockchain";
export const batchRouter = Router();

// POST /api/v1/batches — Fabricante registra lote
batchRouter.post("/",
  authenticate,
  requireRole("MANUFACTURER", "ADMIN"),
  async (req: Request, res: Response) => {
    const schema = z.object({
      gtin:        z.string().length(14),
      lot:         z.string().min(1),
      productName: z.string().min(1),
      expiryDate:  z.string().datetime(),
      quantity:    z.number().int().positive(),
      unitPrice:   z.number().positive(),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }
    try {
      const batch = await batchService.register({
        ...parse.data,
        manufacturerId: req.participant!.participantId
      });
      res.status(201).json(batch);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
);

// GET /api/v1/batches/:id — Detalhes + histórico on-chain
batchRouter.get("/:id",
  authenticate,
  async (req: Request, res: Response) => {
    const batch = await prisma.drugBatch.findUnique({
      where:   { id: req.params.id as string },
      include: { transfers: true, tempLogs: true }
    });
    if (!batch) { res.status(404).json({ error: "Lote não encontrado" }); return; }
    const onChainHistory = await blockchainService.getBatchHistory(batch.id).catch(() => []);
    res.json({ ...batch, onChainHistory });
  }
);

// POST /api/v1/batches/:id/transfer
batchRouter.post("/:id/transfer",
  authenticate,
  requireRole("MANUFACTURER","DISTRIBUTOR","PHARMACY"),
  async (req: Request, res: Response) => {
    const schema = z.object({
      toId:      z.string().uuid(),
      quantity:  z.number().int().positive(),
      type:      z.enum(["DISTRIBUTE","RECEIVE","RETURN"]),
      nfeKey:    z.string().optional(),
      nfeHash:   z.string().optional(),
      signature: z.string(),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }
    try {
      const transfer = await batchService.transfer({
        batchId: req.params.id as string,
        fromId:  req.participant!.participantId,
        ...parse.data
      });
      res.status(201).json(transfer);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
);

// POST /api/v1/batches/:id/recall
batchRouter.post("/:id/recall",
  authenticate,
  requireRole("MANUFACTURER","ADMIN"),
  async (req: Request, res: Response) => {
    const { reason } = z.object({ reason: z.string().min(10) }).parse(req.body);
    try {
      const result = await batchService.recall(
        req.params.id as string, reason, req.participant!.participantId
      );
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
);

// GET /api/v1/batches/stock/:participantId
batchRouter.get("/stock/:participantId",
  authenticate,
  async (req: Request, res: Response) => {
    const stock = await batchService.getStock(req.params.participantId as string);
    res.json(stock);
  }
);
