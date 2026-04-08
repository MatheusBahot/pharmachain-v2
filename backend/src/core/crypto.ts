import crypto from "crypto";


const KEY_HEX = process.env.AES_KEY!;


// ── SHA-256 de qualquer objeto (para dataHash on-chain) ──────────────
export function sha256(data: object | string): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return crypto.createHash("sha256").update(str).digest("hex");
}


// ── Criptografia AES-256-GCM (dados LGPD off-chain) ─────────────────
export function encrypt(data: object): string {
  const key = Buffer.from(KEY_HEX, "hex");
  const iv  = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc  = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
  const tag  = cipher.getAuthTag();
  // Formato: iv(24 hex) + tag(32 hex) + ciphertext(hex)
  return iv.toString("hex") + tag.toString("hex") + enc.toString("hex");
}


export function decrypt(payload: string): object {
  const key = Buffer.from(KEY_HEX, "hex");
  const iv  = Buffer.from(payload.slice(0,  24), "hex");
  const tag = Buffer.from(payload.slice(24, 56), "hex");
  const enc = Buffer.from(payload.slice(56),     "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString());
}

