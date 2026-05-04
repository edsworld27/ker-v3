// Discount code resolver — server-side, per-install storage.
//
// Lifted from `02 felicias aqua portal work/src/lib/discounts.ts` +
// `02/.../lib/admin/marketing.ts` (the discount-code slice). Resolver
// chain: gift card → referral code → static promo → per-install custom code.

import { now } from "../lib/time";
import type { StoragePort } from "./ports";
import type { GiftCardService } from "./giftCards";
import type { ReferralCodeService } from "./referralCodes";

export type DiscountType = "gift_card" | "referral" | "promo" | "staff" | "creator";

export interface AppliedDiscount {
  code: string;
  type: DiscountType;
  label: string;
  amountOff: number;             // pence
}

export interface PromoEntry {
  type: DiscountType;
  label: string;
  percent?: number;              // 0-100
  amount?: number;               // pence
}

// Custom (admin-created) discount code. Defaults the cheapest features so
// most operators can create one in seconds.
export interface CustomDiscountCode {
  code: string;                  // upper-cased
  type: "percent" | "fixed" | "freeship";
  value: number;                 // 0-100 for percent; pence for fixed
  active: boolean;
  description?: string;
  expiresAt?: number;
  maxUses?: number;
  uses: number;
  affiliateId?: string;
  createdAt: number;
}

const PROMO_KEY = "promo-codes";              // fixed registry per install
const CUSTOM_PREFIX = "discount/";            // one key per custom code

const DEFAULT_PROMO_CODES: Record<string, PromoEntry> = {
  STAFF20: { type: "staff", label: "Staff discount (20%)", percent: 20 },
  STAFF50: { type: "staff", label: "Staff discount (50%)", percent: 50 },
};

export class DiscountService {
  constructor(
    private storage: StoragePort,
    private giftCards: GiftCardService,
    private referrals: ReferralCodeService,
  ) {}

  // ─── Custom (admin-created) codes ───────────────────────────────────

  async listCustomCodes(): Promise<CustomDiscountCode[]> {
    const keys = await this.storage.list(CUSTOM_PREFIX);
    const codes = await Promise.all(keys.map(k => this.storage.get<CustomDiscountCode>(k)));
    return codes
      .filter((c): c is CustomDiscountCode => c !== undefined)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getCustomCode(code: string): Promise<CustomDiscountCode | null> {
    const stored = await this.storage.get<CustomDiscountCode>(`${CUSTOM_PREFIX}${code.trim().toUpperCase()}`);
    return stored ?? null;
  }

  async upsertCustomCode(code: CustomDiscountCode): Promise<CustomDiscountCode> {
    const next: CustomDiscountCode = {
      ...code,
      code: code.code.trim().toUpperCase(),
      createdAt: code.createdAt || now(),
    };
    await this.storage.set(`${CUSTOM_PREFIX}${next.code}`, next);
    return next;
  }

  async deleteCustomCode(code: string): Promise<boolean> {
    const key = `${CUSTOM_PREFIX}${code.trim().toUpperCase()}`;
    const existing = await this.storage.get(key);
    if (!existing) return false;
    await this.storage.del(key);
    return true;
  }

  async incrementCustomUse(code: string): Promise<void> {
    const c = await this.getCustomCode(code);
    if (!c) return;
    await this.storage.set(`${CUSTOM_PREFIX}${c.code}`, { ...c, uses: c.uses + 1 });
  }

  // ─── Resolver ────────────────────────────────────────────────────────

  async resolveCode(
    rawCode: string,
    subtotal: number,
    alreadyApplied: string[],
  ): Promise<{ ok: true; discount: AppliedDiscount; freeShipping?: boolean } | { ok: false; reason: string }> {
    const code = rawCode.trim().toUpperCase();
    if (!code) return { ok: false, reason: "Please enter a code." };
    if (alreadyApplied.map(c => c.toUpperCase()).includes(code)) {
      return { ok: false, reason: "That code is already applied." };
    }

    // 1. Gift card
    const gc = await this.giftCards.getCard(code);
    if (gc) {
      const result = await this.giftCards.redeem(code, subtotal);
      if (!result.ok) return { ok: false, reason: result.reason };
      return {
        ok: true,
        discount: { code, type: "gift_card", label: "Gift card", amountOff: result.applied },
      };
    }

    // 2. Referral code
    const ref = await this.referrals.findCode(code);
    if (ref) {
      const amountOff = Math.min(1000, subtotal);   // £10 max, in pence
      if (amountOff <= 0) return { ok: false, reason: "Your cart is already fully covered." };
      return {
        ok: true,
        discount: { code, type: "referral", label: "Referral code — £10 off", amountOff },
      };
    }

    // 3. Static promo / staff codes — agency-defined defaults plus per-install overrides.
    const stored = (await this.storage.get<Record<string, PromoEntry>>(PROMO_KEY)) ?? {};
    const promos = { ...DEFAULT_PROMO_CODES, ...stored };
    const promo = promos[code];
    if (promo) {
      const amountOff = promo.percent
        ? Math.round((subtotal * promo.percent) / 100)
        : (promo.amount ?? 0);
      if (amountOff <= 0) return { ok: false, reason: "Your cart is already fully covered." };
      return {
        ok: true,
        discount: { code, type: promo.type, label: promo.label, amountOff },
      };
    }

    // 4. Per-install custom code
    const custom = await this.getCustomCode(code);
    if (custom) {
      if (!custom.active) return { ok: false, reason: "Code is inactive." };
      if (custom.expiresAt && custom.expiresAt < now()) return { ok: false, reason: "Code expired." };
      if (custom.maxUses && custom.uses >= custom.maxUses) return { ok: false, reason: "Code maxed out." };
      const labelMap: Record<typeof custom.type, string> = {
        percent: `${custom.value}% off`,
        fixed: `£${(custom.value / 100).toFixed(2)} off`,
        freeship: "Free shipping",
      };
      const amountOff = custom.type === "percent"
        ? Math.round((subtotal * custom.value) / 100)
        : custom.type === "fixed"
          ? custom.value
          : 0;
      return {
        ok: true,
        discount: {
          code,
          type: custom.affiliateId ? "creator" : "promo",
          label: labelMap[custom.type],
          amountOff,
        },
        freeShipping: custom.type === "freeship",
      };
    }

    return { ok: false, reason: "We don't recognise that code. Double-check and try again." };
  }
}
