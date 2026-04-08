import "dotenv/config";
import express       from "express";
import cors          from "cors";
import helmet        from "helmet";
import { authRouter }         from "./api/routes/auth.routes";
import { batchRouter }        from "./api/routes/batch.routes";
import { prescriptionRouter } from "./api/routes/prescription.routes";
import { prisma }   from "./storage/prisma";
import { redis }    from "./storage/redis";
import "./network/p2p"; // inicia servidor P2P


const app  = express();
const PORT = Number(process.env.PORT ?? 3001);


// ── Middlewares globais ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json({ limit: "1mb" }));


// ── Rotas ─────────────────────────────────────────────────────────────
app.use("/api/v1/auth",          authRouter);
app.use("/api/v1/batches",       batchRouter);
app.use("/api/v1/prescriptions", prescriptionRouter);


// ── Health check ──────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  const db    = await prisma.$queryRaw`SELECT 1`.then(()=>"ok").catch(()=>"error");
  const cache = await redis.ping().then(()=>"ok").catch(()=>"error");
  res.json({ status: "ok", db, cache, ts: new Date().toISOString() });
});


// ── Not found ─────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada" }));


// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[API] PharmaChain rodando em http://localhost:${PORT}`);
  console.log(`[API] Health: http://localhost:${PORT}/health`);
});

import { analyticsRouter } from './api/routes/analytics.routes';
// ... dentro do bloco de rotas, adicione:
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/transfers', analyticsRouter); // reuso para o Explorer

