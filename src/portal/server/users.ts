// Server-side user registry (G-5). Backed by the cloud storage layer so
// auth survives across deploys. Passwords are stored as sha256(password +
// email-salt) — strong enough for a scaffold, swap for argon2id when this
// graduates from prototype.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import type { ServerUser, UserRole } from "./types";

function hashPassword(password: string, email: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase().trim()}|${password}`)
    .digest("hex");
}

function makeId(): string {
  return `usr_${crypto.randomBytes(8).toString("hex")}`;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export function createUser(input: CreateUserInput): ServerUser {
  const email = input.email.trim().toLowerCase();
  const user: ServerUser = {
    id: makeId(),
    email,
    name: input.name ?? email.split("@")[0],
    passwordHash: hashPassword(input.password, email),
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
  if (user.passwordHash !== hashPassword(password, email)) return null;
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
