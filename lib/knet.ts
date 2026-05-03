// Mock K-Net payment adapter.
//
// Real K-Net integration: merchant POSTs an encrypted order (TranID, Amt,
// Currency, ResponseURL, ErrorURL) to a hosted page; user pays; K-Net redirects
// back with PaymentID, Result, Auth, Ref, etc. Production swap: replace
// buildRedirectUrl + verifyCallback with the real K-Net request/response logic;
// the rest of the app already speaks the contract.

import crypto from "crypto";

const SECRET = () =>
  process.env.KNET_HMAC_SECRET ?? "dev-only-knet-hmac-secret";

const APP_URL = () => process.env.APP_URL ?? "http://localhost:3000";

export type KnetResult = "success" | "cancelled" | "failed";

export interface CallbackPayload {
  bookingId: string;
  result: KnetResult;
  ts: string;
  sig: string;
}

function sign(parts: string[]): string {
  return crypto
    .createHmac("sha256", SECRET())
    .update(parts.join("|"))
    .digest("hex");
}

export function buildRedirectUrl(bookingId: string): string {
  const provider = process.env.KNET_PROVIDER ?? "mock";
  if (provider === "mock") {
    return `${APP_URL()}/payment/mock-knet/${bookingId}`;
  }
  throw new Error(`KNET provider "${provider}" is not configured.`);
}

export function buildCallbackUrl(bookingId: string, result: KnetResult): string {
  const ts = Date.now().toString();
  const sig = sign([bookingId, result, ts]);
  const params = new URLSearchParams({ bookingId, result, ts, sig });
  return `${APP_URL()}/api/payment/callback?${params.toString()}`;
}

export function verifyCallback(p: {
  bookingId?: string | null;
  result?: string | null;
  ts?: string | null;
  sig?: string | null;
}): CallbackPayload | null {
  if (!p.bookingId || !p.result || !p.ts || !p.sig) return null;
  if (!["success", "cancelled", "failed"].includes(p.result)) return null;
  const expected = sign([p.bookingId, p.result, p.ts]);
  // Constant-time compare
  const a = Buffer.from(expected);
  const b = Buffer.from(p.sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // Reject signatures older than 30 minutes.
  const ageMs = Date.now() - Number(p.ts);
  if (!Number.isFinite(ageMs) || ageMs > 30 * 60 * 1000 || ageMs < 0) return null;

  return {
    bookingId: p.bookingId,
    result: p.result as KnetResult,
    ts: p.ts,
    sig: p.sig,
  };
}
