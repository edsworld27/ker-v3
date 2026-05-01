"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import type { AppliedDiscount } from "@/lib/discounts";
import { syncReservations } from "@/lib/admin/inventory";

export type { AppliedDiscount };

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  shopifyVariantId?: string;
  stockSku?: string;     // links to inventory item; cart qty = reserved stock
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  total: number;
  discounts: AppliedDiscount[];
  applyDiscount: (code: string) => Promise<{ ok: true } | { ok: false; reason: string }>;
  removeDiscount: (code: string) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// localStorage keys — bump the version suffix when the shape changes so old
// carts don't crash the new code path.
const CART_STORAGE_KEY = "lk_cart_v1";
const DISCOUNTS_STORAGE_KEY = "lk_cart_discounts_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  // Hydrate from localStorage so the cart survives page reloads + tab close.
  // SSR returns []; the effect below rehydrates on mount. We guard the parse
  // so a corrupted localStorage entry can't blow the app up.
  const [items, setItems] = useState<CartItem[]>([]);
  const [discounts, setDiscounts] = useState<AppliedDiscount[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // One-time hydration on the client. We deliberately don't read in useState
  // initialiser because that would cause an SSR/CSR mismatch.
  useEffect(() => {
    try {
      const rawItems = localStorage.getItem(CART_STORAGE_KEY);
      if (rawItems) {
        const parsed = JSON.parse(rawItems) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
      const rawDisc = localStorage.getItem(DISCOUNTS_STORAGE_KEY);
      if (rawDisc) {
        const parsed = JSON.parse(rawDisc) as AppliedDiscount[];
        if (Array.isArray(parsed)) setDiscounts(parsed);
      }
    } catch {
      // Corrupt entries — start with an empty cart rather than crashing.
    }
    setHydrated(true);
  }, []);

  // Persist on every change once we've hydrated. Skipping pre-hydration writes
  // prevents the empty initial state from clobbering a saved cart.
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(discounts)); } catch {}
  }, [discounts, hydrated]);

  // Capture ?src= / ?aff= attribution on first load — first-touch
  useEffect(() => {
    import("@/lib/admin/marketing").then(m => m.captureAttribution());
  }, []);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const totalDiscount = useMemo(() => discounts.reduce((s, d) => s + d.amountOff, 0), [discounts]);
  const total = Math.max(0, subtotal - totalDiscount);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  // Whenever the cart changes, mirror the totals to inventory.reserved.
  // Every linked SKU is set to its current cart quantity; missing SKUs
  // are reset to 0. Once the order is paid, consumeStock() in the success
  // flow reduces onHand and clears the reservation.
  useEffect(() => {
    const map: Record<string, number> = {};
    for (const i of items) {
      if (i.stockSku) map[i.stockSku] = (map[i.stockSku] ?? 0) + i.quantity;
    }
    syncReservations(map);
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  }, []);

  const applyDiscount = useCallback(
    async (code: string) => {
      const { resolveCode } = await import("@/lib/discounts");
      const result = resolveCode(
        code,
        subtotal,
        discounts.map((d) => d.code),
      );
      if (!result.ok) return result;
      setDiscounts((prev) => [...prev, result.discount]);
      return { ok: true as const };
    },
    [subtotal, discounts],
  );

  const removeDiscount = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    setDiscounts((prev) => {
      const disc = prev.find((d) => d.code === normalized);
      if (disc?.type === "gift_card") {
        import("@/lib/giftCards").then(({ refundGiftCard }) =>
          refundGiftCard(normalized, disc.amountOff),
        );
      }
      return prev.filter((d) => d.code !== normalized);
    });
  }, []);

  // Empty the cart + drop any applied discounts. Called by the success page
  // once Stripe has confirmed the payment so the customer doesn't return to
  // a stale bag. Also accessible to any future "abandon cart" UX.
  const clearCart = useCallback(() => {
    setItems([]);
    setDiscounts([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(DISCOUNTS_STORAGE_KEY);
      } catch {}
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        total,
        discounts,
        applyDiscount,
        removeDiscount,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
