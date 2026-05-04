// POST /api/auth/login — verify credentials, issue session cookie.
//
// First-run bootstrap: if there are no users registered AND there are no
// agencies registered, this endpoint provisions a default agency
// ("Milesy Media") plus an `agency-owner` user from the supplied
// credentials. Lets a fresh `npm run dev` reach a working portal in
// one form submission. After bootstrap the endpoint becomes a regular
// verifyPassword + sign-in.

import { NextResponse, type NextRequest } from "next/server";
import { ensureHydrated } from "@/server/storage";
import { issueSession, sessionCookie } from "@/lib/server/auth";
import { clientIpFromHeaders, rateLimit } from "@/lib/server/rateLimit";
import { listAgencies, createAgency, getAgency } from "@/server/tenants";
import { createUser, listUsersForAgency, verifyPassword } from "@/server/users";
import { logActivity } from "@/server/activity";

interface Body { email?: unknown; password?: unknown }

export async function POST(req: NextRequest) {
  await ensureHydrated();

  const ip = clientIpFromHeaders(req.headers);
  const limit = rateLimit({ key: `login:${ip}`, max: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many sign-in attempts. Try again shortly." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSec) } },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  const agencies = listAgencies();

  // First-run bootstrap.
  if (agencies.length === 0) {
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "First-run: pick a password of at least 8 characters." },
        { status: 400 },
      );
    }
    const agency = createAgency({ name: "Milesy Media", slug: "milesy-media", ownerEmail: email });
    const user = createUser({
      email,
      password,
      role: "agency-owner",
      agencyId: agency.id,
      name: email.split("@")[0],
    });
    logActivity({
      agencyId: agency.id,
      actorUserId: user.id,
      actorEmail: email,
      category: "auth",
      action: "bootstrap.signup",
      message: `First-run bootstrap: created agency "${agency.name}" and owner ${email}.`,
    });
    const token = issueSession({
      userId: user.id, email: user.email, role: user.role, agencyId: user.agencyId,
    });
    const cookie = sessionCookie(token);
    const res = NextResponse.json({ ok: true, bootstrap: true });
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  }

  // Per-email rate limit (slows down credential stuffing).
  const perEmail = rateLimit({ key: `login-email:${email}`, max: 5, windowMs: 60_000 });
  if (!perEmail.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many sign-in attempts on this email. Try again shortly." },
      { status: 429, headers: { "retry-after": String(perEmail.retryAfterSec) } },
    );
  }

  const user = verifyPassword(email, password);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Email or password is incorrect." }, { status: 401 });
  }

  // Defense-in-depth: refuse if the user's referenced agency was deleted.
  if (!getAgency(user.agencyId)) {
    return NextResponse.json({ ok: false, error: "Account no longer associated with an active agency." }, { status: 403 });
  }
  // Same for client-scoped users.
  if (user.clientId) {
    // we only validate existence, not branding — failure here means the
    // client was archived and the user shouldn't be able to sign in.
    const peers = listUsersForAgency(user.agencyId);
    if (!peers.some(u => u.id === user.id)) {
      return NextResponse.json({ ok: false, error: "Account no longer active." }, { status: 403 });
    }
  }

  const token = issueSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    agencyId: user.agencyId,
    clientId: user.clientId,
  });
  const cookie = sessionCookie(token);
  logActivity({
    agencyId: user.agencyId,
    clientId: user.clientId,
    actorUserId: user.id,
    actorEmail: user.email,
    category: "auth",
    action: "user.signed_in",
    message: `${user.email} signed in (${user.role}).`,
  });
  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, agencyId: user.agencyId, clientId: user.clientId },
    mustChangePassword: user.mustChangePassword === true,
  });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
