// Signed preview tokens. The admin presses "Preview" on a draft, the
// portal returns a short-lived token, and the host site loads with
// `?portal_preview=draft&pt=<token>` in the URL. The loader sends the
// token with its content fetch; the server verifies the HMAC + expiry
// and serves the draft instead of the published overrides.
//
// We use Node's built-in `crypto` so there are no new dependencies. The
// signing secret is read from PORTAL_PREVIEW_SECRET; in dev we fall
// back to a deterministic value so previews work without env setup.

import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_MS = 30 * 60 * 1000;     // 30 minutes
export const PREVIEW_TOKEN_VERSION = 1;

function secret(): string {
  return process.env.PORTAL_PREVIEW_SECRET || "portal-preview-dev-secret-replace-in-prod";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString("utf-8");
}

export interface PreviewTokenPayload {
  v: number;
  siteId: string;
  exp: number;       // ms epoch
  // Single-letter codes keep the token compact in URLs.
}

export function mintPreviewToken(siteId: string, ttlMs: number = DEFAULT_TTL_MS): string {
  const payload: PreviewTokenPayload = {
    v: PREVIEW_TOKEN_VERSION,
    siteId,
    exp: Date.now() + ttlMs,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

export interface VerifyResult {
  ok: boolean;
  reason?: "malformed" | "bad-signature" | "wrong-site" | "expired" | "wrong-version";
  payload?: PreviewTokenPayload;
}

export function verifyPreviewToken(token: string, expectedSiteId: string): VerifyResult {
  const dot = token.indexOf(".");
  if (dot < 0) return { ok: false, reason: "malformed" };
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = b64url(createHmac("sha256", secret()).update(body).digest());
  // Constant-time comparison to defeat timing attacks; lengths must match
  // first or timingSafeEqual throws.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad-signature" };
  }
  let payload: PreviewTokenPayload;
  try {
    payload = JSON.parse(fromB64url(body)) as PreviewTokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (payload.v !== PREVIEW_TOKEN_VERSION) return { ok: false, reason: "wrong-version", payload };
  if (payload.siteId !== expectedSiteId)   return { ok: false, reason: "wrong-site",    payload };
  if (Date.now() > payload.exp)            return { ok: false, reason: "expired",      payload };
  return { ok: true, payload };
}
