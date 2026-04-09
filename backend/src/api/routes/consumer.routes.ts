import { Router, Request, Response } from "express";
import { prisma } from "../../storage/prisma";

export const consumerRouter = Router();

consumerRouter.get("/track/:gtin", async (req: Request, res: Response) => {
  const gtin = req.params.gtin as string;

  try {
    const batch = await prisma.drugBatch.findFirst({
      where: { OR: [{ gtin }, { id: gtin }] },
      include: {
        manufacturer: { select: { name: true, cnpj: true } },
        transfers: {
          orderBy: { createdAt: "asc" },
          include: {
            from: { select: { name: true, role: true } },
            to:   { select: { name: true, role: true } },
          }
        },
        tempLogs: { orderBy: { timestamp: "asc" } }
      }
    });

    if (!batch) {
      res.status(404).json({ error: "Produto nao encontrado na blockchain" });
      return;
    }

    const steps = batch.transfers.map(t => {
      const relevantLogs = batch.tempLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const txTime  = new Date(t.createdAt).getTime();
        return Math.abs(logTime - txTime) < 24 * 60 * 60 * 1000;
      });

      const avgTemp = relevantLogs.length > 0
        ? relevantLogs.reduce((sum, l) => sum + l.temperature, 0) / relevantLogs.length
        : undefined;
      const avgHumidity = relevantLogs.length > 0 && relevantLogs[0].humidity != null
        ? relevantLogs.reduce((sum, l) => sum + (l.humidity ?? 0), 0) / relevantLogs.length
        : undefined;

      return {
        type:     t.type,
        date:     t.createdAt,
        from:     t.from?.name ?? "Desconhecido",
        to:       t.to?.name   ?? "Desconhecido",
        qty:      t.quantity,
        txHash:   t.txHash ?? "",
        conditions: avgTemp !== undefined ? {
          temp:     Math.round(avgTemp * 10) / 10,
          humidity: avgHumidity ? Math.round(avgHumidity) : undefined,
        } : undefined,
      };
    });

    res.json({
      productName:  batch.productName,
      gtin:         batch.gtin,
      lot:          batch.lot,
      status:       batch.status,
      expiryDate:   batch.expiryDate,
      manufacturer: batch.manufacturer?.name ?? "Desconhecido",
      steps,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
