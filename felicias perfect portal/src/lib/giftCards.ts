"use client";

// Lightweight client-side gift card store. Backed by localStorage so it works
// without a backend — codes persist across sessions on the same browser.
// In production this would live in a database.

const STORAGE_KEY = "odo_gift_cards";

export interface GiftCard {
  code: string;
  amount: number;
  balance: number;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message: string;
  createdAt: number; // ms epoch
  redemptions: { amount: number; at: number }[];
}

interface Store {
  [code: string]: GiftCard;
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function writeStore(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// Format: ODO-XXXX-XXXX-XXXX (16 chars, no ambiguous 0/O/I/1)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateCode(): string {
  const segments: string[] = [];
  for (let s = 0; s < 3; s++) {
    let seg = "";
    for (let i = 0; i < 4; i++) {
      seg += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    segments.push(seg);
  }
  return `ODO-${segments.join("-")}`;
}

export function issueGiftCard(input: Omit<GiftCard, "code" | "balance" | "createdAt" | "redemptions">): GiftCard {
  const store = readStore();
  let code: string;
  do {
    code = generateCode();
  } while (store[code]);
  const card: GiftCard = {
    code,
    balance: input.amount,
    createdAt: Date.now(),
    redemptions: [],
    ...input,
  };
  store[code] = card;
  writeStore(store);
  return card;
}

export function getGiftCard(code: string): GiftCard | null {
  const normalized = code.trim().toUpperCase();
  const store = readStore();
  return store[normalized] ?? null;
}

export function redeemGiftCard(code: string, amount: number): { ok: true; card: GiftCard; applied: number } | { ok: false; reason: string } {
  const normalized = code.trim().toUpperCase();
  const store = readStore();
  const card = store[normalized];
  if (!card) return { ok: false, reason: "We couldn't find that gift card." };
  if (card.balance <= 0) return { ok: false, reason: "This gift card has no balance left." };
  const applied = Math.min(card.balance, amount);
  card.balance -= applied;
  card.redemptions.push({ amount: applied, at: Date.now() });
  store[normalized] = card;
  writeStore(store);
  return { ok: true, card, applied };
}

export function refundGiftCard(code: string, amount: number) {
  const normalized = code.trim().toUpperCase();
  const store = readStore();
  const card = store[normalized];
  if (!card) return;
  card.balance += amount;
  store[normalized] = card;
  writeStore(store);
}

export function listGiftCards(): GiftCard[] {
  return Object.values(readStore()).sort((a, b) => b.createdAt - a.createdAt);
}
