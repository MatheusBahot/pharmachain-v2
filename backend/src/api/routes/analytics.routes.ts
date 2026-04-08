import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/auth";
import { prisma }       from "../../storage/prisma";
import { subDays, format } from "date-fns";


export const analyticsRouter = Router();


// GET /api/v1/analytics/stats — métricas para o dashboard
analyticsRouter.get("/stats", authenticate, async (_req, res: Response) => {
  const [totalBatches, activeRecalls, totalTransfers, expiringCount] =
    await Promise.all([
      prisma.drugBatch.count({ where:{ status:"ACTIVE" } }),
      prisma.drugBatch.count({ where:{ status:"RECALLED" } }),
      prisma.transfer.count({
        where:{ createdAt:{ gte: subDays(new Date(),1) } }
      }),
      prisma.drugBatch.count({
        where:{
          status:"ACTIVE",
          expiryDate:{ lte: subDays(new Date(),-30) }
        }
      }),
    ]);


  // Atividade dos últimos 7 dias
  const activity = [];
  for (let i = 6; i >= 0; i--) {
    const day   = subDays(new Date(), i);
    const next  = subDays(new Date(), i-1);
    const count = await prisma.transfer.count({
      where:{ createdAt:{ gte:day, lt:next } }
    });
    activity.push({ date: format(day,"dd/MM"), transfers: count });
  }


  res.json({ totalBatches, activeRecalls, totalTransfers, expiringCount, recentActivity: activity });
});


// GET /api/v1/transfers — histórico para o Explorer
analyticsRouter.get("/transfers", authenticate, async (req, res: Response) => {
  const limit = Number(req.query.limit ?? 50);
  const transfers = await prisma.transfer.findMany({
    take:    limit,
    orderBy: { createdAt: "desc" },
    include: {
      batch: { select: { gtin:true, lot:true, productName:true } },
      from:  { select: { name:true, cnpj:true } },
      to:    { select: { name:true, cnpj:true } },
    }
  });
  res.json(transfers);
});

