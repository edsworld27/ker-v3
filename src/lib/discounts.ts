"use client";

// Unified discount resolver. Accepts any code and works out what kind it is:
//   • Gift cards     — ODO-XXXX-XXXX-XXXX  (localStorage-backed balance)
//   • Referral codes — e.g. SARAH10         (friend gave you their code)
//   • Promo codes    — e.g. ODO10           (newsletter first-order)
//   • Staff codes    — STAFF20, STAFF50     (internal)
//   • Creator/affiliate codes               (add to PROMO_CODES below)
//
// Multiple codes can stack on the same cart; each is applied against the
// original subtotal and the final total is capped at £0.

import { getGiftCard, redeemGiftCard } from "./giftCards";
import { findCode } from "./referralCodes";

export type DiscountType = "gift_card" | "referral" | "promo" | "staff" | "creator";

export interface AppliedDiscount {
  code: string;
  type: DiscountType;
  label: string;
  amountOff: number;
}

interface PromoEntry {
  type: DiscountType;
  label: string;
  percent?: number;
  amount?: number;
}

// ─── Add new codes here ───────────────────────────────────────────────────────
const PROMO_CODES: Record<string, PromoEntry> = {
  ODO10:   { type: "promo",   label: "10% off — first order",  percent: 10 },
  STAFF20: { type: "staff",   label: "Staff discount (20%)",   percent: 20 },
  STAFF50: { type: "staff",   label: "Staff discount (50%)",   percent: 50 },
  // Creator / affiliate codes — add per campaign:
  // YOUTUBE15: { type: "creator", label: "YouTube 15% off", percent: 15 },
};
// ─────────────────────────────────────────────────────────────────────────────

export function resolveCode(
  rawCode: string,
  subtotal: number,
  alreadyApplied: string[],
): { ok: true; discount: AppliedDiscount } | { ok: false; reason: string } {
  const code = rawCode.trim().toUpperCase();

  if (!code) return { ok: false, reason: "Please enter a code." };

  if (alreadyApplied.map((c) => c.toUpperCase()).includes(code)) {
    return { ok: false, reason: "That code is already applied." };
  }

  // 1. Gift card (ODO-XXXX-XXXX-XXXX)
  const gc = getGiftCard(code);
  if (gc !== null) {
    const result = redeemGiftCard(code, subtotal);
    if (!result.ok) return result;
    return {
      ok: true,
      discount: {
        code,
        type: "gift_card",
        label: `Gift card`,
        amountOff: result.applied,
      },
    };
  }

  // 2. Referral code (e.g. SARAH10 — £10 off)
  const ref = findCode(code);
  if (ref !== null) {
    const amountOff = Math.min(10, subtotal);
    if (amountOff <= 0) return { ok: false, reason: "Your cart is already fully covered." };
    return {
      ok: true,
      discount: {
        code,
        type: "referral",
        label: `Referral code — £10 off`,
        amountOff,
      },
    };
  }

  // 3. Promo / staff / creator code
  const promo = PROMO_CODES[code];
  if (promo) {
    const amountOff = promo.percent
      ? parseFloat(((subtotal * promo.percent) / 100).toFixed(2))
      : (promo.amount ?? 0);
    if (amountOff <= 0) return { ok: false, reason: "Your cart is already fully covered." };
    return {
      ok: true,
      discount: { code, type: promo.type, label: promo.label, amountOff },
    };
  }

  // 4. Admin-created discount code (managed in /admin/marketing)
  // Dynamic require to avoid circular imports — marketing module is admin-side.
  if (typeof window !== "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { applyDiscount } = require("./admin/marketing") as typeof import("./admin/marketing");
      const result = applyDiscount(code, subtotal, 0);
      if (result.ok) {
        const labelMap: Record<typeof result.rec.type, string> = {
          percent:  `${result.rec.value}% off`,
          fixed:    `£${result.rec.value.toFixed(2)} off`,
          freeship: "Free shipping",
        };
        const amountOff = result.discount;
        if (result.freeShipping) {
          // Free shipping codes record £0 cart-side; the shipping line is
          // suppressed at checkout. We still surface them as an applied
          // discount so the customer sees confirmation.
        }
        if (amountOff > 0 || result.freeShipping) {
          return {
            ok: true,
            discount: {
              code,
              type: result.rec.affiliateId ? "creator" : "promo",
              label: labelMap[result.rec.type],
              amountOff: amountOff || 0,
            },
          };
        }
      } else {
        // Surface a more specific error if the code is recognised but invalid
        if (result.reason !== "Code not recognised.") return { ok: false, reason: result.reason };
      }
    } catch { /* fall through */ }
  }

  return { ok: false, reason: "We don't recognise that code. Double-check and try again." };
}
