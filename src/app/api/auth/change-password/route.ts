// POST /api/auth/change-password — { currentPassword, newPassword }
//
// Allows a signed-in user to change their own password. Required for the
// force-change-on-first-login flow: when a ServerUser is flagged with
// mustChangePassword (operator-created account, post-reset, etc.) the
// admin shell redirects them here. Successful change clears the flag
// via setUserPassword.

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getCurrentUserFromReq } from "@/lib/server/auth";
import { verifyPassword, setUserPassword, validatePassword } from "@/portal/server/users";
import { recordAdminAction } from "@/portal/server/activity";
import { rateLimit, clientIpFromHeaders } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureHydrated();

  // Per-IP throttle so a stolen session can't burn through arbitrary
  // current-password guesses on a noisy box. Tight bound — honest
  // password-typo correction is well under this.
  const ip = clientIpFromHeaders(req.headers);
  const ipCheck = rateLimit({ key: `pwchange:ip:${ip}`, max: 10, windowMs: 60_000 });
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate-limited", retryAfter: ipCheck.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(ipCheck.retryAfterSec) } },
    );
  }

  const user = await getCurrentUserFromReq(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  // verifyPassword handles legacy → scrypt migration as a side-effect on
  // success, which is fine — we want the new hash regardless.
  const verified = verifyPassword(user.email, currentPassword);
  if (!verified) {
    return NextResponse.json({ ok: false, error: "invalid-current-password" }, { status: 401 });
  }

  // Re-run strength validation here (setUserPassword does too, but we
  // want to surface the specific message before doing the hash).
  const check = validatePassword(newPassword);
  if (!check.ok) {
    return NextResponse.json({ ok: false, error: check.error ?? "weak-password" }, { status: 400 });
  }

  if (newPassword === currentPassword) {
    return NextResponse.json(
      { ok: false, error: "Pick a different password than your current one." },
      { status: 400 },
    );
  }

  try {
    setUserPassword(user.email, newPassword);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Couldn't set password" },
      { status: 400 },
    );
  }

  recordAdminAction(user, {
    category: "auth",
    action: "Changed own password",
    resourceId: user.email,
  });

  return NextResponse.json({ ok: true });
}
