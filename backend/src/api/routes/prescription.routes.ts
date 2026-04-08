import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, requireRole }  from "../middlewares/auth";
import { prescriptionService }         from "../../application/PrescriptionService";
export const prescriptionRouter = Router();

// POST /api/v1/prescriptions — Médico emite receita
prescriptionRouter.post("/",
  authenticate,
  requireRole("DOCTOR"),
  async (req: Request, res: Response) => {
    const schema = z.object({
      patientCpf: z.string().length(11),
      batchId:    z.string().uuid(),
      dosage:     z.string().min(1),
      quantity:   z.number().int().positive(),
      expiresAt:  z.string().datetime(),
      signature:  z.string().min(10),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }
    try {
      const rx = await prescriptionService.issue({
        ...parse.data,
        doctorId: req.participant!.participantId
      });
      res.status(201).json(rx);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
);

// POST /api/v1/prescriptions/:id/dispense — Farmácia dispensa
prescriptionRouter.post("/:id/dispense",
  authenticate,
  requireRole("PHARMACY"),
  async (req: Request, res: Response) => {
    try {
      const result = await prescriptionService.dispense(
        req.params.id as string,
        req.participant!.participantId
      );
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
);
