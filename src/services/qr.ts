import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export interface QrPayload {
  jti: string; // identifiant unique du jeton (usage unique)
  bid: string; // identifiant de reservation
  nbf: number; // debut de validite (epoch secondes)
  exp: number; // fin de validite (epoch secondes)
}

export type QrResult =
  | { ok: true; payload: QrPayload }
  | { ok: false; reason: "malformed" | "bad_signature" | "not_yet_valid" | "expired" };

const b64u = (buf: Buffer): string => buf.toString("base64url");

function sign(body: string, key: string): Buffer {
  return createHmac("sha256", key).update(body).digest();
}

export function signQr(input: { bid: string; nbf: number; exp: number; jti?: string }, key: string): string {
  const payload: QrPayload = { jti: input.jti ?? randomUUID(), bid: input.bid, nbf: input.nbf, exp: input.exp };
  const body = b64u(Buffer.from(JSON.stringify(payload)));
  return `${body}.${b64u(sign(body, key))}`;
}

export function verifyQr(token: string, key: string, nowSec = Math.floor(Date.now() / 1000)): QrResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [body, sigB64] = parts;

  const expected = sign(body, key);
  const given = Buffer.from(sigB64, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: "bad_signature" };
  }

  let payload: QrPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as QrPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof payload.bid !== "string" || typeof payload.nbf !== "number" || typeof payload.exp !== "number") {
    return { ok: false, reason: "malformed" };
  }
  if (nowSec < payload.nbf) return { ok: false, reason: "not_yet_valid" };
  if (nowSec > payload.exp) return { ok: false, reason: "expired" };
  return { ok: true, payload };
}

// Anti-rejeu : un jeton ne doit etre accepte qu'une seule fois.
// En production : table qr_scans avec contrainte UNIQUE sur jti (voir schema de C).
export interface ScanStore {
  /** Renvoie true si c'est la premiere utilisation de ce jeton. */
  markUsed(jti: string): Promise<boolean>;
}

export class InMemoryScanStore implements ScanStore {
  private readonly used = new Set<string>();
  async markUsed(jti: string): Promise<boolean> {
    if (this.used.has(jti)) return false;
    this.used.add(jti);
    return true;
  }
}
