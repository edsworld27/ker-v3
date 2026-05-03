import "server-only";
// Server-side user store.
//
// Password hashing is scrypt (Node stdlib) — N=16384, r=8, p=1, 16-byte
// random salt. Format: `scrypt$N$r$p$<salt-hex>$<derived-hex>` so the cost
// parameters can be rotated in place later.
//
// `verifyPassword` runs a dummy scrypt against a fixed throwaway hash
// when the email isn't registered, so the response time matches the
// user-found path. Defends against email-enumeration via timing.
//
// Lifted from `02 felicias aqua portal work/src/portal/server/users.ts` and
// adapted for the three-level role hierarchy from `04-architecture.md §3`.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import { emit } from "./eventBus";
import type { Role, ServerUser } from "./types";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 32;
const SCRYPT_SALT_BYTES = 16;

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SCRYPT_SALT_BYTES);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

function verifyHash(password: string, encoded: string): boolean {
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
  return crypto.timingSafeEqual(actual, expected);
}

const TRIVIAL_PASSWORDS = new Set([
  "password", "password1", "password123", "passw0rd",
  "12345678", "123456789", "1234567890",
  "qwerty", "qwerty123", "letmein", "welcome", "admin", "admin123",
  "iloveyou", "monkey", "dragon", "abc12345", "111111111",
]);

export interface PasswordValidationResult { ok: boolean; error?: string }

export function validatePassword(password: string): PasswordValidationResult {
  if (typeof password !== "string") return { ok: false, error: "Password is required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (password.length > 256) return { ok: false, error: "Password is too long (max 256 chars)." };
  if (TRIVIAL_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, error: "That password is too common — pick something less guessable." };
  }
  if (/^(.)\1+$/.test(password)) return { ok: false, error: "Password can't be a single repeated character." };
  return { ok: true };
}

function makeId(): string {
  return `usr_${crypto.randomBytes(8).toString("hex")}`;
}

function normEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role: Role;
  agencyId: string;
  clientId?: string;
  mustChangePassword?: boolean;
}

export function createUser(input: CreateUserInput): ServerUser {
  const check = validatePassword(input.password);
  if (!check.ok) throw new Error(check.error ?? "Invalid password");
  const email = normEmail(input.email);
  const now = Date.now();
  const user: ServerUser = {
    id: makeId(),
    email,
    name: input.name ?? email.split("@")[0],
    passwordHash: hashPassword(input.password),
    role: input.role,
    agencyId: input.agencyId,
    clientId: input.clientId,
    mustChangePassword: input.mustChangePassword,
    createdAt: now,
    updatedAt: now,
  };
  mutate(state => {
    state.users[email] = user;
  });
  emit({ agencyId: user.agencyId, clientId: user.clientId }, "user.signed_up", { userId: user.id });
  return user;
}

export function getUser(email: string): ServerUser | null {
  return getState().users[normEmail(email)] ?? null;
}

export function getUserById(userId: string): ServerUser | null {
  for (const u of Object.values(getState().users)) {
    if (u.id === userId) return u;
  }
  return null;
}

const DUMMY_HASH = (() => {
  const salt = Buffer.alloc(SCRYPT_SALT_BYTES, 0);
  const derived = crypto.scryptSync("x", salt, SCRYPT_KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${derived.toString("hex")}`;
})();

export function verifyPassword(email: string, password: string): ServerUser | null {
  const user = getUser(email);
  if (!user) {
    // Timing-equalize: still run scrypt against a dummy hash so the
    // response time matches the user-found path.
    verifyHash(password, DUMMY_HASH);
    return null;
  }
  if (!verifyHash(password, user.passwordHash)) return null;
  return user;
}

export function listUsersForAgency(agencyId: string): ServerUser[] {
  return Object.values(getState().users).filter(u => u.agencyId === agencyId);
}

export function listUsersForClient(clientId: string): ServerUser[] {
  return Object.values(getState().users).filter(u => u.clientId === clientId);
}

export function setUserPassword(email: string, password: string): boolean {
  const check = validatePassword(password);
  if (!check.ok) throw new Error(check.error ?? "Invalid password");
  const e = normEmail(email);
  let ok = false;
  mutate(state => {
    const existing = state.users[e];
    if (!existing) return;
    state.users[e] = {
      ...existing,
      passwordHash: hashPassword(password),
      mustChangePassword: false,
      updatedAt: Date.now(),
    };
    ok = true;
  });
  return ok;
}

export interface UpdateUserPatch {
  name?: string;
  role?: Role;
  clientId?: string;
  mustChangePassword?: boolean;
}

export function updateUser(email: string, patch: UpdateUserPatch): ServerUser | null {
  const e = normEmail(email);
  let saved: ServerUser | null = null;
  mutate(state => {
    const existing = state.users[e];
    if (!existing) return;
    saved = {
      ...existing,
      name: patch.name ?? existing.name,
      role: patch.role ?? existing.role,
      clientId: patch.clientId ?? existing.clientId,
      mustChangePassword: patch.mustChangePassword ?? existing.mustChangePassword,
      updatedAt: Date.now(),
    };
    state.users[e] = saved;
  });
  return saved;
}
