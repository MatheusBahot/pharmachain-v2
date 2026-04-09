import { Router, Request, Response } from "express";
import { z }           from "zod";
import bcrypt          from "bcryptjs";
import { ethers }      from "ethers";
import { authenticate, requireRole } from "../middlewares/auth";
import { prisma }      from "../../storage/prisma";

export const participantsRouter = Router();

// GET /api/v1/participants
participantsRouter.get("/", authenticate, async (_req: Request, res: Response) => {
  const list = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:true, name:true, cnpj:true, role:true,
      address:true, active:true, createdAt:true
    }
  });
  res.json(list);
});

// POST /api/v1/participants — apenas ADMIN
participantsRouter.post("/",
  authenticate,
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    const schema = z.object({
      name:     z.string().min(3),
      cnpj:     z.string().min(14).max(14),
      password: z.string().min(8),
      role:     z.enum(["MANUFACTURER","DISTRIBUTOR","PHARMACY","DOCTOR","AUDITOR","ADMIN"]),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

    const { name, cnpj, password, role } = parse.data;
    const wallet       = ethers.Wallet.createRandom();
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const participant = await prisma.participant.create({
        data: { name, cnpj, role: role as any, address: wallet.address, passwordHash },
        select: { id:true, name:true, cnpj:true, role:true, address:true, createdAt:true }
      });
      res.status(201).json({ ...participant, privateKey: wallet.privateKey });
    } catch (e: any) {
      if (e.code === "P2002") { res.status(409).json({ error: "CNPJ ja cadastrado" }); return; }
      res.status(500).json({ error: e.message });
    }
  }
);
