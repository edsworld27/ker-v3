// Server-side user registry (G-5). Backed by the cloud storage layer so
// auth survives across deploys.
//
// Password hashing
// ----------------
// Production hashes use Node's built-in scrypt (memory-hard KDF designed
// for password hashing — RFC 7914) with a per-user random 16-byte salt
// and N=16384 / r=8 / p=1 cost params (the OWASP-recommended baseline
// for scrypt as of 2024). Each hash is stored as
//
//   "scrypt$N$r$p$<salt-hex>$<derived-hex>"
//
// so we can rotate parameters in place later without breaking sign-in.
//
// Legacy hashes minted before this change were a single sha256 over
// `<email>|<password>`; verifyPassword recognises that shape and
// transparently re-hashes with scrypt on successful login, so
// existing accounts upgrade silently the next time they sign in.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import type { ServerUser, UserRole } from "./types";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 32;
const SCRYPT_SALT_BYTES = 16;

function hashPasswordScrypt(password: string): string {
  const salt = crypto.randomBytes(SCRYPT_SALT_BYTES);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

function verifyScrypt(password: string, encoded: string): boolean {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const N = parseInt(parts[1], 10);
  const r = parseInt(parts[2], 10);
  const p = parseInt(parts[3], 10);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4], "hex");
    expected = Buffer.from(parts[5], "hex");
  } catch { return false; }
  let actual: Buffer;
  try {
    actual = crypto.scryptSync(password, salt, expected.length, { N, r, p });
  } catch { return false; }
  // timingSafeEqual requires equal-length buffers — guarded above.
  return crypto.timingSafeEqual(actual, expected);
}

// Legacy shape: bare 64-char hex sha256 of "<email>|<password>".
function isLegacySha256Hash(s: string): boolean {
  return /^[a-f0-9]{64}$/i.test(s);
}
function legacySha256(password: string, email: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase().trim()}|${password}`)
    .digest("hex");
}

function makeId(): string {
  return `usr_${crypto.randomBytes(8).toString("hex")}`;
}

// Minimum 8 chars (OWASP 2024 floor). Reject the most common compromised
// passwords + trivial patterns. Not a full breached-password lookup —
// that needs an external API — but stops the worst cases at the gate.
const TRIVIAL_PASSWORDS = new Set([
  "password", "password1", "password123", "passw0rd",
  "12345678", "123456789", "1234567890",
  "qwerty", "qwerty123", "letmein", "welcome", "admin", "admin123",
  "iloveyou", "monkey", "dragon", "abc12345", "111111111",
]);

export interface PasswordValidationResult {
  ok: boolean;
  error?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  if (typeof password !== "string") return { ok: false, error: "Password is required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (password.length > 256) return { ok: false, error: "Password is too long (max 256 chars)." };
  if (TRIVIAL_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, error: "That password is too common — pick something less guessable." };
  }
  // Single-character spam ("aaaaaaaa", "11111111").
  if (/^(.)\1+$/.test(password)) return { ok: false, error: "Password can't be a single repeated character." };
  // Sequential keyboard runs ("abcdefgh", "12345678") — basic check.
  if (/^(?:abcdefgh|qwertyui|asdfghjk|12345678|87654321)/.test(password.toLowerCase())) {
    return { ok: false, error: "Password is too sequential — pick something less predictable." };
  }
  return { ok: true };
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export function createUser(input: CreateUserInput): ServerUser {
  const check = validatePassword(input.password);
  if (!check.ok) throw new Error(check.error ?? "Invalid password");
  const email = input.email.trim().toLowerCase();
  const user: ServerUser = {
    id: makeId(),
    email,
    name: input.name ?? email.split("@")[0],
    passwordHash: hashPasswordScrypt(input.password),
    role: input.role ?? "member",
    createdAt: Date.now(),
  };
  mutate(state => {
    state.users[email] = user;
  });
  return user;
}

export function getUser(email: string): ServerUser | undefined {
  return getState().users[email.trim().toLowerCase()];
}

export function verifyPassword(email: string, password: string): ServerUser | null {
  const user = getUser(email);
  if (!user) return null;
  // New scrypt hashes carry the "scrypt$" prefix; anything matching the
  // legacy 64-char hex shape is the old sha256 scaffold.
  if (isLegacySha256Hash(user.passwordHash)) {
    if (user.passwordHash !== legacySha256(password, email)) return null;
    // Transparent upgrade: re-hash with scrypt now that we have the
    // plaintext at hand. Next sign-in goes through the modern path.
    const upgraded = hashPasswordScrypt(password);
    mutate(state => {
      const existing = state.users[email.trim().toLowerCase()];
      if (existing) state.users[email.trim().toLowerCase()] = { ...existing, passwordHash: upgraded };
    });
    return user;
  }
  if (!verifyScrypt(password, user.passwordHash)) return null;
  return user;
}

export function listUsers(): ServerUser[] {
  return Object.values(getState().users);
}

export function updateUser(email: string, patch: Partial<Omit<ServerUser, "id" | "email" | "createdAt">>): ServerUser | null {
  const e = email.trim().toLowerCase();
  let result: ServerUser | null = null;
  mutate(state => {
    const existing = state.users[e];
    if (!existing) return;
    const next: ServerUser = { ...existing, ...patch };
    state.users[e] = next;
    result = next;
  });
  return result;
}

export function deleteUser(email: string): boolean {
  const e = email.trim().toLowerCase();
  let removed = false;
  mutate(state => {
    if (state.users[e]) {
      delete state.users[e];
      removed = true;
    }
  });
  return removed;
}

// Update a user's password — used by /admin/team password resets and the
// "force change on first login" flow. Always writes a fresh scrypt hash.
// Throws if the password fails validatePassword().
export function setUserPassword(email: string, password: string): boolean {
  const check = validatePassword(password);
  if (!check.ok) throw new Error(check.error ?? "Invalid password");
  const e = email.trim().toLowerCase();
  let ok = false;
  mutate(state => {
    const existing = state.users[e];
    if (!existing) return;
    state.users[e] = { ...existing, passwordHash: hashPasswordScrypt(password) };
    ok = true;
  });
  return ok;
}
