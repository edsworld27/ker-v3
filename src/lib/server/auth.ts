// Server-side session validation (G-5). Sessions are signed HMAC tokens
// stored in an httpOnly cookie. Issued by /api/auth/login, validated by
// requireAdmin() on protected API routes. The HMAC secret comes from
// PORTAL_SESSION_SECRET; in dev a stable fallback keeps things working
// without env config (intentional — production deploys MUST set the env).

import crypto from "crypto";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getUser } from "@/portal/server/users";
import type { ServerUser } from "@/portal/server/types";

const COOKIE_NAME = "lk_session_v1";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  return process.env.PORTAL_SESSION_SECRET ?? "dev-secret-do-not-use-in-prod";
}

interface SessionPayload {
  email: string;
  iat: number;
  exp: number;
}

export function signSession(email: string): string {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
  };
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac("sha256", getSecret()).update(b64).digest("base64url");
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_COOKIE_MAX_AGE = COOKIE_MAX_AGE;

// Read-only — pulls the cookie via next/headers (App Router routes).
export async function getCurrentUser(): Promise<ServerUser | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  const payload = verifySession(token);
  if (!payload) return null;
  return getUser(payload.email) ?? null;
}

// API-route variant that takes a NextRequest. Returns null when no
// session OR session expired.
export async function getCurrentUserFromReq(req: NextRequest): Promise<ServerUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = verifySession(token);
  if (!payload) return null;
  return getUser(payload.email) ?? null;
}

// Throws Response(401) when not signed in OR not at least admin level.
// Bypassed when NEXT_PUBLIC_PORTAL_SECURITY=off (legacy dev_bypass).
export async function requireAdmin(): Promise<ServerUser | null> {
  const securityMode = process.env.NEXT_PUBLIC_PORTAL_SECURITY ?? "strict";
  const legacy = process.env.NEXT_PUBLIC_PORTAL_DEV_BYPASS === "1";
  if (legacy || securityMode === "off") return null;

  const user = await getCurrentUser();
  if (!user) {
    throw new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  if (user.role !== "super-admin" && user.role !== "admin") {
    throw new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return user;
}
