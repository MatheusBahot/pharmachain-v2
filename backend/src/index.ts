import "dotenv/config";
import express       from "express";
import cors          from "cors";
import helmet        from "helmet";
import { authRouter }          from "./api/routes/auth.routes";
import { batchRouter }         from "./api/routes/batch.routes";
import { batchesListRouter }   from "./api/routes/batches.list.routes";
import { prescriptionRouter }  from "./api/routes/prescription.routes";
import { analyticsRouter }     from "./api/routes/analytics.routes";
import { participantsRouter }  from "./api/routes/participants.routes";
import { consumerRouter }      from "./api/routes/consumer.routes";
import { prisma }   from "./storage/prisma";
import { redis }    from "./storage/redis";
import "./network/p2p";

const app  = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json({ limit: "1mb" }));

// Rotas públicas (sem auth)
app.use("/api/v1/consumer",      consumerRouter);

// Rotas autenticadas
app.use("/api/v1/auth",          authRouter);
app.use("/api/v1/batches",       batchesListRouter);
app.use("/api/v1/batches",       batchRouter);
app.use("/api/v1/prescriptions", prescriptionRouter);
app.use("/api/v1/analytics",     analyticsRouter);
app.use("/api/v1/transfers",     analyticsRouter);
app.use("/api/v1/participants",  participantsRouter);

app.get("/health", async (_req, res) => {
  const db    = await prisma.$queryRaw`SELECT 1`.then(()=>"ok").catch(()=>"error");
  const cache = await redis.ping().then(()=>"ok").catch(()=>"error");
  res.json({ status:"ok", db, cache, ts: new Date().toISOString() });
});

app.use((_req, res) => res.status(404).json({ error:"Rota nao encontrada" }));

app.listen(PORT, () => {
  console.log(`[API] PharmaChain rodando em http://localhost:${PORT}`);
});
