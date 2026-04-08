import { Router, Request, Response } from "express";
import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";
import { z }   from "zod";
import { prisma } from "../../storage/prisma";


export const authRouter = Router();


const LoginSchema = z.object({
  cnpj:     z.string().min(14).max(18),
  password: z.string().min(8),
});


// POST /api/v1/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.flatten() });
    return;
  }
  const { cnpj, password } = parse.data;


  const participant = await prisma.participant.findUnique({ where: { cnpj } });
  if (!participant) {
    res.status(401).json({ error: "CNPJ não encontrado" });
    return;
  }


  const ok = await bcrypt.compare(password, participant.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Senha incorreta" });
    return;
  }


  const token = jwt.sign(
    { participantId: participant.id, address: participant.address, role: participant.role },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? "8h") as `${number}${"s"|"m"|"h"|"d"}` }
  );


  res.json({ token, role: participant.role, address: participant.address });
});

