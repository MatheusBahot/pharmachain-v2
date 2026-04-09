import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/auth";
import { prisma }       from "../../storage/prisma";

export const batchesListRouter = Router();

batchesListRouter.get("/", authenticate, async (_req: Request, res: Response) => {
  const batches = await prisma.drugBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { manufacturer: { select: { name: true } } }
  });
  res.json(batches);
});

batchesListRouter.get("/by-gtin/:gtin", authenticate, async (req: Request, res: Response) => {
  const gtin = req.params.gtin as string;
  const batch = await prisma.drugBatch.findFirst({
    where: { OR: [{ gtin }, { id: gtin }] },
    include: {
      manufacturer: { select: { name: true } },
      transfers: {
        orderBy: { createdAt: "asc" },
        include: {
          from: { select: { name: true } },
          to:   { select: { name: true } },
        }
      }
    }
  });
  if (!batch) { res.status(404).json({ error: "Lote nao encontrado" }); return; }
  res.json(batch);
});
