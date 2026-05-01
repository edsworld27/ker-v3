import { NextResponse } from "next/server";
import crypto from "crypto";
import { ensureHydrated } from "@/portal/server/storage";
import { getUser, createUser } from "@/portal/server/users";
import { signSession, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "@/lib/server/auth";

// POST /api/auth/dev — one-click dev sign-in. Refuses unless the security
// mode permits (NEXT_PUBLIC_PORTAL_SECURITY != strict). The /login Dev
// mode button calls this to mint a real cookie session without a password.

const DEV_EMAIL = "dev@local.portal";

export const dynamic = "force-dynamic";

export async function POST() {
  const mode = process.env.NEXT_PUBLIC_PORTAL_SECURITY ?? "strict";
  const legacy = process.env.NEXT_PUBLIC_PORTAL_DEV_BYPASS === "1";
  if (mode === "strict" && !legacy) {
    return NextResponse.json({ ok: false, error: "dev-disabled" }, { status: 403 });
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
