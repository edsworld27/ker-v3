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
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [discounts, setDiscounts] = useState<AppliedDiscount[]>([]);

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
