import { NextResponse } from "next/server";
import crypto from "crypto";
import { ensureHydrated } from "@/portal/server/storage";
import { getUser, createUser } from "@/portal/server/users";
import { signSession, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "@/lib/server/auth";

// POST /api/auth/dev — one-click dev sign-in. Mints a super-admin cookie.
// Gated by NEXT_PUBLIC_PORTAL_SECURITY:
//   true / strict      → refuse (production)
//   false / dev / unset → allow (default — bypass visible while building)

const DEV_EMAIL = "dev@local.portal";

export const dynamic = "force-dynamic";

export async function POST() {
  const env = process.env.NEXT_PUBLIC_PORTAL_SECURITY;
  const legacy = process.env.NEXT_PUBLIC_PORTAL_DEV_BYPASS === "1";
  const isStrict = (env === "strict" || env === "true") && !legacy;
  if (isStrict) {
    return NextResponse.json(
      { ok: false, error: "Dev bypass is disabled in production. Set NEXT_PUBLIC_PORTAL_SECURITY=false to re-enable." },
      { status: 403 },
    );
  }
  await ensureHydrated();
  const user = getUser(DEV_EMAIL) ?? createUser({
    email: DEV_EMAIL,
    password: crypto.randomUUID(),
    name: "Dev admin",
    role: "super-admin",
  });
  const token = signSession(user.email);
  const res = NextResponse.json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  return res;
}
