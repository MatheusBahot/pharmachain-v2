import Redis from "ioredis";


export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  enableReadyCheck:     true,
  lazyConnect:          false,
});


redis.on("error", (err) => {
  console.error("[Redis] erro de conexão:", err.message);
});


redis.on("connect", () => {
  console.log("[Redis] conectado com sucesso");
});

