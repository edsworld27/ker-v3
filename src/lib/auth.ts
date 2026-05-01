"use client";

// Client-side auth scaffold. Backed by localStorage so login / signup / verify /
// reset all work end-to-end with no backend.
//
// Function signatures are shaped to match Shopify Customer Account / Storefront
// mutations so swapping in real Shopify calls is mechanical — see the TODO
// blocks in each function for the exact mutation to call.
//
//   signInWithGoogle()       → NextAuth signIn("google") OR Shopify customer
//                              + Google identity link
//   signInWithEmail()        → customerAccessTokenCreate
//   signUp()                 → customerCreate + customerAccessTokenCreate
//   requestPasswordReset()   → customerRecover
//   resetPassword()          → customerResetByUrl
//   verifyEmail()            → customerActivateByUrl
//
// The existing src/lib/shopifyCustomer.ts holds the matching GraphQL strings
// pre-written and ready to call once you wire env vars in.

const SESSION_KEY          = "lk_session_v1";
const USERS_KEY            = "lk_users_v1";
const TOKENS_KEY           = "lk_tokens_v1";
const IMPERSONATION_KEY    = "lk_impersonation_backup_v1";

// ── Types ─────────────────────────────────────────────────────────────────────

// Hardcoded admin allowlist. In production this becomes a `role` column on the
// customers table (Supabase / Postgres) — or a Shopify customer tag like
// `role:admin` — read at session-creation time.
const ADMIN_EMAILS: readonly string[] = [
  "felicia@luvandker.com",
  "edwardhallam07@gmail.com",
];

export type Role = "customer" | "admin";

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  provider: "email" | "google";
  role: Role;
  createdAt: number;
  mustChangePassword?: boolean;  // set by admin; forces password change on next login
}

export interface Session {
  user: User;
  // Shopify customer access token. In production this is what the Storefront
  // API issues — `customerAccessTokenCreate.customerAccessToken.accessToken`.
  accessToken: string;
  expiresAt: number;
}

interface StoredUser extends User {
  passwordHash?: string;     // tiny non-secure hash; demo only
  tempPassword?: string;     // plaintext temp password visible to admin before user changes it
}

interface VerifyToken { kind: "verify" | "reset"; email: string; expires: number; }

// ── Storage helpers ───────────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Notify same-tab listeners (Navbar, /account) that the session changed.
// `storage` events only fire across tabs, so we ship a custom event for the
// current tab.
export const AUTH_EVENT = "lk-auth-change";
function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function loadUsers(): Record<string, StoredUser> { return read(USERS_KEY, {} as Record<string, StoredUser>); }
function saveUsers(u: Record<string, StoredUser>) { write(USERS_KEY, u); }
function loadTokens(): Record<string, VerifyToken> { return read(TOKENS_KEY, {} as Record<string, VerifyToken>); }
function saveTokens(t: Record<string, VerifyToken>) { write(TOKENS_KEY, t); }

// ── Trivial helpers ───────────────────────────────────────────────────────────

const norm = (s: string) => s.trim().toLowerCase();

function tinyHash(s: string): string {
  // NOT cryptographic — just stops casual inspection. Replace at the same time
  // you swap the local store for Shopify customer auth.
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return `lk_${(h >>> 0).toString(36)}`;
}

function makeId() { return `cust_${Math.random().toString(36).slice(2, 10)}`; }

function makeToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

function makeAccessToken() {
  // Shopify access tokens look opaque; emulate that shape.
  return `lkat_${makeToken()}${makeToken()}`;
}

// ── Result type ───────────────────────────────────────────────────────────────

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; error: string };

// ── Security mode (dev-bypass selector) ───────────────────────────────────────
//
// Three-mode toggle that gates how the /login page behaves:
//   "strict" — credentials required, no dev shortcut (production default)
//   "dev"    — credentials work AND a "Dev mode" button creates an admin
//              session in one click (local development, preview deploys)
//   "off"    — admin auth is bypassed entirely (legacy behaviour of the
//              older NEXT_PUBLIC_PORTAL_DEV_BYPASS=1 env)
//
// Source order: a runtime override in localStorage wins (so the admin can
// flip a preview deploy without redeploying), then NEXT_PUBLIC_PORTAL_SECURITY,
// then the legacy NEXT_PUBLIC_PORTAL_DEV_BYPASS=1, else "strict".
//
// G-5 will retire this for real per-tenant auth.

export type SecurityMode = "strict" | "dev" | "off";

const SECURITY_OVERRIDE_KEY = "lk_security_mode_v1";

export function getSecurityMode(): SecurityMode {
  if (typeof window !== "undefined") {
    try {
      const ls = localStorage.getItem(SECURITY_OVERRIDE_KEY);
      if (ls === "strict" || ls === "dev" || ls === "off") return ls;
    } catch {}
  }
  if (process.env.NEXT_PUBLIC_PORTAL_DEV_BYPASS === "1") return "off";
  const env = process.env.NEXT_PUBLIC_PORTAL_SECURITY;
  if (env === "strict" || env === "dev" || env === "off") return env;
  // The user's spec wording — "security=true" / "security=false" — gets
  // normalised here so either style works in .env files.
  if (env === "true")  return "strict";
  if (env === "false") return "dev";
  return "strict";
}

export function setSecurityModeOverride(mode: SecurityMode | null) {
  if (typeof window === "undefined") return;
  try {
    if (mode === null) localStorage.removeItem(SECURITY_OVERRIDE_KEY);
    else localStorage.setItem(SECURITY_OVERRIDE_KEY, mode);
  } catch {}
}

// One-click dev sign-in: synthesises a super-admin session without going
// through the password store. Only callable when getSecurityMode() returns
// "dev" or "off"; the /login page enforces that. The synthesised user is
// kept in the same shape as a real one so the rest of the admin code path
// (sidebar, isAdmin, team perms) doesn't need to special-case it.

export const DEV_ADMIN_EMAIL = "dev@local.portal";

export function signInAsDev(): Session {
  const mode = getSecurityMode();
  if (mode === "strict") {
    throw new Error("Dev sign-in is disabled (security=strict). Set NEXT_PUBLIC_PORTAL_SECURITY=dev or off.");
  }
  const email = DEV_ADMIN_EMAIL;
  const users = loadUsers();
  // Persist the dev user so listAllUsers + getTeamMemberByEmail callers
  // see a stable identity across page loads.
  let stored = users[email];
  if (!stored) {
    stored = {
      id: makeId(),
      email,
      name: "Dev admin",
      emailVerified: true,
      provider: "email",
      role: "admin",
      createdAt: Date.now(),
    };
    users[email] = stored;
    saveUsers(users);
  } else if (stored.role !== "admin") {
    stored.role = "admin";
    users[email] = stored;
    saveUsers(users);
  }
  const { passwordHash: _a, tempPassword: _b, ...publicUser } = stored;
  void _a; void _b;
  // Force admin role even if the allowlist would reject (dev@local isn't
  // on ADMIN_EMAILS, and we don't want to pollute that list either).
  return startSession({ ...publicUser, role: "admin" });
}

// ── Session ───────────────────────────────────────────────────────────────────

export function getSession(): Session | null {
  const s = read<Session | null>(SESSION_KEY, null);
  if (!s) return null;
  if (s.expiresAt < Date.now()) { signOut(); return null; }
  // Backfill role for sessions issued before the admin allowlist existed.
  // The dev sign-in produces a session for DEV_ADMIN_EMAIL — that email is
  // intentionally NOT on ADMIN_EMAILS (so a real signup with that email
  // can't escalate). Treat it as admin only when the security mode permits.
  const isDevAdmin = s.user.email === DEV_ADMIN_EMAIL && getSecurityMode() !== "strict";
  const expected: Role = isAdminEmail(s.user.email) || isDevAdmin ? "admin" : "customer";
  if (s.user.role !== expected) {
    s.user.role = expected;
    write(SESSION_KEY, s);
  }
  return s;
}

export function isAdmin(session: Session | null): boolean {
  return !!session && session.user.role === "admin";
}

function startSession(user: User): Session {
  const session: Session = {
    user,
    accessToken: makeAccessToken(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days, matches Shopify default
  };
  write(SESSION_KEY, session);
  notifyAuthChange();
  return session;
}

export function signOut() {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
  notifyAuthChange();
  // TODO Shopify: also call customerAccessTokenDelete to invalidate server-side.
}

// ── Email + password ──────────────────────────────────────────────────────────

export async function signUp(input: { email: string; password: string; name: string }): Promise<AuthResult> {
  const email = norm(input.email);
  const users = loadUsers();
  if (users[email]) return { ok: false, error: "An account with that email already exists." };

  const user: StoredUser = {
    id: makeId(),
    email,
    name: input.name.trim() || email.split("@")[0],
    emailVerified: false,
    provider: "email",
    role: isAdminEmail(email) ? "admin" : "customer",
    createdAt: Date.now(),
    passwordHash: tinyHash(input.password),
  };
  users[email] = user;
  saveUsers(users);

  // "Send" verification email — in dev we print the link, in production this
  // is dispatched by Shopify when customerCreate completes.
  const link = issueVerifyLink(email);
  console.info("[auth] verification link →", link);

  // TODO Shopify:
  //   const r = await shopifyCustomer.create({ email, password: input.password, firstName: input.name });
  //   if (r.userErrors?.length) return { ok: false, error: r.userErrors[0].message };
  //   await shopifyCustomer.tokenCreate({ email, password: input.password });

  const { passwordHash: _drop, ...publicUser } = user; void _drop;
  return { ok: true, session: startSession(publicUser) };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const norm_email = norm(email);
  const users = loadUsers();
  const user = users[norm_email];
  if (!user) return { ok: false, error: "We don't have an account for that email." };
  if (user.provider === "google") return { ok: false, error: "This account uses Google sign-in. Try Continue with Google." };
  if (user.passwordHash !== tinyHash(password)) return { ok: false, error: "That password doesn't match our records." };

  // TODO Shopify:
  //   const r = await shopifyCustomer.tokenCreate({ email: norm_email, password });
  //   if (r.userErrors?.length) return { ok: false, error: r.userErrors[0].message };
  //   accessToken = r.customerAccessToken.accessToken;

  const { passwordHash: _drop, ...publicUser } = user; void _drop;
  return { ok: true, session: startSession(publicUser) };
}

// ── Google ────────────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<AuthResult> {
  // TODO wire to real Google OAuth (NextAuth or Google Identity Services).
  // The flow:
  //   1. Open Google's OAuth consent screen.
  //   2. Receive an id_token / profile { sub, email, name, picture, email_verified }.
  //   3. Find-or-create a Shopify customer with that email (Admin API: customerCreate
  //      OR Storefront customerCreate, then store the google sub on a metafield).
  //   4. Issue a Shopify customerAccessToken so /account orders work.
  //
  // For the scaffold we simulate the popup with a 600ms wait and a
  // demo Google profile. Calling this twice with the same email re-uses the
  // existing user (so dashboard data persists).
  await new Promise(r => setTimeout(r, 600));

  const profile = await mockGoogleProfile();
  if (!profile) return { ok: false, error: "Google sign-in was cancelled." };

  const email = norm(profile.email);
  const users = loadUsers();
  let user = users[email];
  if (!user) {
    user = {
      id: makeId(),
      email,
      name: profile.name,
      emailVerified: profile.email_verified, // Google says it's verified
      provider: "google",
      role: isAdminEmail(email) ? "admin" : "customer",
      createdAt: Date.now(),
    };
    users[email] = user;
    saveUsers(users);
  }

  const { passwordHash: _drop, ...publicUser } = user; void _drop;
  return { ok: true, session: startSession(publicUser) };
}

// Demo-only stand-in for the Google profile. Returns whatever the user types
// into a prompt — keeps the UI exercise honest without bringing in OAuth.
async function mockGoogleProfile(): Promise<{ email: string; name: string; email_verified: boolean } | null> {
  if (typeof window === "undefined") return null;
  const email = window.prompt("Google sign-in (demo) — type the email Google would return:");
  if (!email || !email.includes("@")) return null;
  const guessName = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return { email, name: guessName, email_verified: true };
}

// ── Email verification ────────────────────────────────────────────────────────

export function issueVerifyLink(email: string): string {
  const tokens = loadTokens();
  const token = makeToken();
  tokens[token] = { kind: "verify", email: norm(email), expires: Date.now() + 1000 * 60 * 60 * 48 };
  saveTokens(tokens);
  if (typeof window === "undefined") return `/account/verify?token=${token}`;
  return `${window.location.origin}/account/verify?token=${token}`;
}

export function consumeVerifyToken(token: string): { ok: true; email: string } | { ok: false; error: string } {
  const tokens = loadTokens();
  const t = tokens[token];
  if (!t || t.kind !== "verify") return { ok: false, error: "This verification link isn't valid." };
  if (t.expires < Date.now()) return { ok: false, error: "This verification link has expired." };

  const users = loadUsers();
  const user = users[t.email];
  if (user) {
    user.emailVerified = true;
    saveUsers(users);
    // If we're currently signed in as this user, refresh session.
    const session = getSession();
    if (session && session.user.email === user.email) {
      const { passwordHash: _drop, ...publicUser } = user; void _drop;
      write(SESSION_KEY, { ...session, user: publicUser });
      notifyAuthChange();
    }
  }
  delete tokens[token];
  saveTokens(tokens);
  return { ok: true, email: t.email };

  // TODO Shopify: replace with customerActivateByUrl({ activationUrl, password }).
}

export function resendVerificationEmail(email: string) {
  const link = issueVerifyLink(email);
  console.info("[auth] verification link →", link);
  // TODO Shopify: there's no direct resend; you re-trigger by calling
  // customerCreate again (errors if exists) — typically done via Admin API
  // customerSendAccountInviteEmail.
  return link;
}

// ── Password reset ────────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<{ ok: true; link: string } | { ok: false; error: string }> {
  const e = norm(email);
  const users = loadUsers();
  if (!users[e]) {
    // Do NOT leak whether the email exists. Pretend we sent it.
    return { ok: true, link: "" };
  }
  const tokens = loadTokens();
  const token = makeToken();
  tokens[token] = { kind: "reset", email: e, expires: Date.now() + 1000 * 60 * 60 * 4 };
  saveTokens(tokens);
  const link = typeof window === "undefined"
    ? `/account/reset-password?token=${token}`
    : `${window.location.origin}/account/reset-password?token=${token}`;
  console.info("[auth] password reset link →", link);

  // TODO Shopify: customerRecover({ email: e }) — Shopify dispatches the
  // reset email itself; you don't see the token client-side.

  return { ok: true, link };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const tokens = loadTokens();
  const t = tokens[token];
  if (!t || t.kind !== "reset") return { ok: false, error: "This reset link isn't valid." };
  if (t.expires < Date.now())   return { ok: false, error: "This reset link has expired." };
  if (newPassword.length < 8)   return { ok: false, error: "Password must be at least 8 characters." };

  const users = loadUsers();
  const user = users[t.email];
  if (!user) return { ok: false, error: "We couldn't find that account." };
  user.passwordHash = tinyHash(newPassword);
  users[t.email] = user;
  saveUsers(users);

  delete tokens[token];
  saveTokens(tokens);

  // TODO Shopify: customerResetByUrl({ resetUrl, password: newPassword }).
  return { ok: true };
}

// ── Admin user creation ───────────────────────────────────────────────────────

export interface AdminCreateUserInput {
  email: string;
  name: string;
  role?: Role;
  tempPassword: string;
}

export function adminCreateUser(input: AdminCreateUserInput): { ok: true; user: User } | { ok: false; error: string } {
  const email = norm(input.email);
  const users = loadUsers();
  if (users[email]) return { ok: false, error: "An account with that email already exists." };

  const stored: StoredUser = {
    id: makeId(),
    email,
    name: input.name.trim() || email.split("@")[0],
    emailVerified: true,            // admin-created accounts skip email verify
    provider: "email",
    role: input.role ?? "customer",
    createdAt: Date.now(),
    passwordHash: tinyHash(input.tempPassword),
    tempPassword: input.tempPassword, // kept until user sets own password
    mustChangePassword: true,
  };
  users[email] = stored;
  saveUsers(users);

  const { passwordHash: _a, tempPassword: _b, ...publicUser } = stored; void _a; void _b;
  return { ok: true, user: publicUser };
}

export function listAllUsers(): User[] {
  const users = loadUsers();
  return Object.values(users).map(({ passwordHash: _a, ...u }) => { void _a; return u as User; });
}

export function deleteUser(email: string) {
  const users = loadUsers();
  delete users[norm(email)];
  saveUsers(users);
}

// ── Force password change ─────────────────────────────────────────────────────

export function needsPasswordChange(): boolean {
  const session = getSession();
  return !!session?.user.mustChangePassword;
}

export async function changePassword(newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const session = getSession();
  if (!session) return { ok: false, error: "Not signed in." };

  const users = loadUsers();
  const user = users[norm(session.user.email)];
  if (!user) return { ok: false, error: "Account not found." };

  user.passwordHash = tinyHash(newPassword);
  user.mustChangePassword = false;
  delete user.tempPassword;
  users[norm(session.user.email)] = user;
  saveUsers(users);

  // Update the live session to clear the flag
  const updatedUser: User = { ...session.user, mustChangePassword: false };
  write(SESSION_KEY, { ...session, user: updatedUser });
  notifyAuthChange();

  return { ok: true };
}

// ── Impersonation ─────────────────────────────────────────────────────────────

export interface ImpersonationState {
  targetUser: User;
  adminSession: Session;
}

export function isImpersonating(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(IMPERSONATION_KEY);
}

export function getImpersonationState(): ImpersonationState | null {
  return read<ImpersonationState | null>(IMPERSONATION_KEY, null);
}

export function startImpersonation(targetEmail: string): { ok: true } | { ok: false; error: string } {
  const adminSession = getSession();
  if (!adminSession) return { ok: false, error: "Not signed in." };
  if (!isAdmin(adminSession) && !isImpersonating()) {
    // Allow already-impersonating admins to switch targets
    return { ok: false, error: "Only admins can impersonate users." };
  }

  // If already impersonating, first restore admin session
  const realAdminSession = isImpersonating()
    ? getImpersonationState()?.adminSession ?? adminSession
    : adminSession;

  const users = loadUsers();
  const target = users[norm(targetEmail)];
  if (!target) return { ok: false, error: "User not found." };

  const { passwordHash: _a, tempPassword: _b, ...publicTarget } = target;
  void _a; void _b;

  // Back up the real admin session
  const state: ImpersonationState = {
    targetUser: publicTarget,
    adminSession: realAdminSession,
  };
  write(IMPERSONATION_KEY, state);

  // Start impersonation session (no expiry — admin controls duration)
  const impersonationSession: Session = {
    user: publicTarget,
    accessToken: makeAccessToken(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 8, // 8 hours max
  };
  write(SESSION_KEY, impersonationSession);
  notifyAuthChange();
  return { ok: true };
}

export function stopImpersonation(): void {
  const state = getImpersonationState();
  if (!state) return;

  // Restore admin session
  write(SESSION_KEY, state.adminSession);
  localStorage.removeItem(IMPERSONATION_KEY);
  notifyAuthChange();
}
