import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { verifyPassword, listUsers, createUser } from "@/portal/server/users";
import { signSession, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "@/lib/server/auth";
import { rateLimit, clientIpFromHeaders } from "@/lib/server/rateLimit";

// POST /api/auth/login — { email, password } → sets httpOnly session cookie.
//
// First-run bootstrap: if the user table is empty, this endpoint creates
// the supplied account as "super-admin". Subsequent logins go through the
// standard verify-password path.
//
// Rate-limited per IP + per email to slow down credential-stuffing /
// brute-force attempts. The limits are intentionally generous for
// honest-typo recovery (10/min/IP, 5/min/email) but tight enough to
// make scripted attacks expensive.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureHydrated();

  const ip = clientIpFromHeaders(req.headers);
  const ipCheck = rateLimit({ key: `login:ip:${ip}`, max: 10, windowMs: 60_000 });
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate-limited", retryAfter: ipCheck.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(ipCheck.retryAfterSec) } },
    );
  }

  let body: { email?: string; password?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) return NextResponse.json({ ok: false, error: "missing-credentials" }, { status: 400 });

  // Per-email throttle so a wide-net attack (rotating IPs) still hits a
  // ceiling on each victim account.
  const emailCheck = rateLimit({ key: `login:email:${email}`, max: 5, windowMs: 60_000 });
  if (!emailCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate-limited", retryAfter: emailCheck.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(emailCheck.retryAfterSec) } },
    );
  }

  let user = verifyPassword(email, password);
  if (!user && listUsers().length === 0) {
    // Bootstrap: first-ever login mints the super-admin.
    user = createUser({ email, password, role: "super-admin" });
  }
  if (!user) return NextResponse.json({ ok: false, error: "invalid-credentials" }, { status: 401 });

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
