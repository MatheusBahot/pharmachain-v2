import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface JwtPayload {
  participantId: string;
  address:       string;
  role:          string;
}


declare global {
  namespace Express {
    interface Request { participant?: JwtPayload; }
  }
}


export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token ausente" });
    return;
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.participant = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}


export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.participant || !roles.includes(req.participant.role)) {
      res.status(403).json({ error: "Acesso negado para este papel" });
      return;
    }
    next();
  };
}

