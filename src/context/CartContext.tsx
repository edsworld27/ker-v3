"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  shopifyVariantId?: string;
}

export interface AppliedGiftCard {
  code: string;
  amount: number; // amount applied against this cart
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  total: number;
  giftCard: AppliedGiftCard | null;
  applyGiftCard: (code: string) => Promise<{ ok: true; applied: number } | { ok: false; reason: string }>;
  removeGiftCard: () => Promise<void>;
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
  const [giftCard, setGiftCard] = useState<AppliedGiftCard | null>(null);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const total = Math.max(0, subtotal - (giftCard?.amount ?? 0));
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

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

  const applyGiftCard = useCallback(
    async (code: string) => {
      const { redeemGiftCard, refundGiftCard } = await import("@/lib/giftCards");
      // Refund any previously-applied card before applying a new one
      if (giftCard) {
        refundGiftCard(giftCard.code, giftCard.amount);
      }
      const result = redeemGiftCard(code, subtotal);
      if (!result.ok) {
        if (giftCard) setGiftCard(null);
        return result;
      }
      setGiftCard({ code: result.card.code, amount: result.applied });
      return { ok: true as const, applied: result.applied };
    },
    [giftCard, subtotal],
  );

  const removeGiftCard = useCallback(async () => {
    if (!giftCard) return;
    const { refundGiftCard } = await import("@/lib/giftCards");
    refundGiftCard(giftCard.code, giftCard.amount);
    setGiftCard(null);
  }, [giftCard]);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        total,
        giftCard,
        applyGiftCard,
        removeGiftCard,
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
