"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getGiftCard } from "@/lib/giftCards";
import { listOrders, type Order } from "@/lib/admin/orders";
import { getSession, AUTH_EVENT, type Session } from "@/lib/auth";
import { createTicket } from "@/lib/admin/tickets";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  ts: number;
  // Optional rich payloads alongside text.
  cta?: { label: string; href: string };
  signInPrompt?: boolean;
  ticketPrompt?: boolean;
}

function formatOrder(o: Order): string {
  const lastEvent = o.tracking
    ? `Tracked as ${o.tracking.code} via ${o.tracking.carrier}.`
    : o.status === "paid" ? "Packed and waiting for carrier pickup." : "";
  const items = o.items.map(i => `${i.quantity}× ${i.name}`).join(", ");
  return [
    `Order ${o.id} · ${o.status.toUpperCase()}`,
    `Items: ${items}`,
    `Total: £${o.total.toFixed(2)}`,
    lastEvent,
  ].filter(Boolean).join("\n");
}

function findOrdersForSession(session: Session): Order[] {
  const email = session.user.email.toLowerCase();
  return listOrders().filter(o => o.customerEmail.toLowerCase() === email);
}

function botReply(input: string, session: Session | null): { text: string; signInPrompt?: boolean; ticketPrompt?: boolean; cta?: { label: string; href: string } } {
  const q = input.toLowerCase().trim();

  // Order tracking — gated behind sign-in.
  if (/track|where.+order|order status|delivery|my order|tracking/i.test(q)) {
    if (!session) {
      return {
        text: "I can pull up your orders, but I'll need you to sign in first so I'm only sharing your details with you. Tap below to sign in or create an account.",
        signInPrompt: true,
      };
    }
    const orders = findOrdersForSession(session);
    if (orders.length === 0) {
      return { text: `I can't see any orders on ${session.user.email} yet. If you placed an order with a different email, sign out and back in with that one.` };
    }
    const numMatch = q.match(/(?:order|#|number)\s*([a-z0-9-]{4,})/i);
    if (numMatch) {
      const wanted = numMatch[1].toUpperCase();
      const o = orders.find(x => x.id.toUpperCase().includes(wanted));
      if (o) return { text: formatOrder(o), cta: { label: "Open order", href: `/account` } };
    }
    if (orders.length === 1) {
      return { text: formatOrder(orders[0]), cta: { label: "View in account", href: "/account" } };
    }
    const list = orders.slice(0, 3).map(o => `· ${o.id} — ${o.status} — £${o.total.toFixed(2)}`).join("\n");
    return {
      text: `You have ${orders.length} order${orders.length === 1 ? "" : "s"} on this account:\n${list}\n\nReply with the order number for details.`,
      cta: { label: "View all in account", href: "/account" },
    };
  }

  // Gift card balance
  const giftMatch = q.match(/(odo-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})/i);
  if (giftMatch) {
    const card = getGiftCard(giftMatch[1]);
    if (card) {
      return { text: `Gift card ${card.code} has £${card.balance.toFixed(2)} of £${card.amount.toFixed(2)} remaining.` };
    }
    return { text: "I couldn't find that gift card. Double-check the format ODO-XXXX-XXXX-XXXX." };
  }
  if (/gift\s*card.+balance|check.+balance|redeem/i.test(q)) {
    return { text: "Paste your gift card code (ODO-XXXX-XXXX-XXXX) and I'll look up the balance.", cta: { label: "Open balance checker", href: "/redeem" } };
  }

  if (/return|refund/i.test(q)) {
    return {
      text: "We offer 30-day returns on unopened products. Want me to open a ticket for the team to email you back?",
      ticketPrompt: true,
      cta: { label: "Returns policy", href: "/shipping-returns" },
    };
  }
  if (/shipping|delivery|how long/i.test(q)) {
    return { text: "UK standard: £4.99 (2–4 working days), free over £30. Express: £7.90 next-day if ordered before 2pm. EU/US/CA also available.", cta: { label: "Full shipping info", href: "/shipping-returns" } };
  }
  if (/ingredient|whats in|allerg|paraben|phthalate|sulphate|sls/i.test(q)) {
    return { text: "Every ingredient is named on the product page. Odo is free from parabens, phthalates, sulphates (SLS/SLES) and synthetic fragrance.", cta: { label: "See ingredient sources", href: "/ingredients" } };
  }
  if (/pregnan|baby|sensitive|eczema|rosacea/i.test(q)) {
    return { text: "Odo is free from the most common irritants and endocrine disruptors. Many customers with sensitive skin use it daily — patch-test, and check with your clinician for pregnancy use." };
  }
  if (/vegan|cruelty/i.test(q)) {
    return { text: "100% vegan and never tested on animals." };
  }
  if (/discount|code|promo|first order/i.test(q)) {
    return { text: "Sign up to the newsletter at the bottom of any page for a first-order discount. We don't run flash sales — our prices stay honest." };
  }
  if (/contact|human|email|speak to someone|complain/i.test(q)) {
    return {
      text: "I can open a ticket for the team to reply by email — usually within 24 hours, Mon–Fri.",
      ticketPrompt: true,
    };
  }
  if (/hi$|hello|hey|hiya|good (morning|afternoon|evening)/i.test(q)) {
    return { text: "Hello! I can help with order tracking (sign-in required), gift card balances, returns, ingredients and shipping. What can I help with?" };
  }
  if (/thank/i.test(q)) {
    return { text: "Anytime ✦" };
  }

  return {
    text: "I can help with order tracking, gift card balances, returns, shipping, ingredients and sensitive-skin questions. Want me to open a ticket so the team can follow up by email?",
    ticketPrompt: true,
  };
}

const QUICK_PROMPTS = [
  "Track my order",
  "Check gift card balance",
  "Returns policy",
  "Shipping times",
  "Is this safe for sensitive skin?",
];

export default function ChatBot() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi, I'm Odo — Luv & Ker's assistant. I can track orders (after you sign in), check gift card balances, and answer questions about ingredients, shipping and returns. How can I help?",
      ts: Date.now(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(getSession());
    const sync = () => setSession(getSession());
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Hide on the admin panel — admins shouldn't see customer-facing chat.
  if (pathname.startsWith("/admin")) return null;

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: `${Date.now()}-u`, role: "user", text: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply = botReply(trimmed, session);
      setMessages((m) => [...m, {
        id: `${Date.now()}-b`,
        role: "bot",
        text: reply.text,
        ts: Date.now(),
        signInPrompt: reply.signInPrompt,
        ticketPrompt: reply.ticketPrompt,
        cta: reply.cta,
      }]);
    }, 350);
  }

  function escalateToTicket() {
    const last = [...messages].reverse().find(m => m.role === "user");
    const subject = last ? last.text.slice(0, 80) : "Help request from chat";
    const body = messages
      .map(m => `${m.role === "user" ? "Customer" : "Bot"}: ${m.text}`)
      .join("\n\n");
    if (session) {
      const t = createTicket({
        subject,
        body,
        customerEmail: session.user.email,
        customerName: session.user.name,
        source: "chat",
      });
      setMessages(m => [...m, {
        id: `${Date.now()}-b`, role: "bot", ts: Date.now(),
        text: `Done — ticket ${t.id} opened. The team will email ${session.user.email} within 24 hours.`,
      }]);
    } else {
      const email = prompt("What email should we reply to?");
      if (!email || !email.includes("@")) return;
      const name = prompt("Your name?") ?? "Customer";
      const t = createTicket({ subject, body, customerEmail: email, customerName: name, source: "chat" });
      setMessages(m => [...m, {
        id: `${Date.now()}-b`, role: "bot", ts: Date.now(),
        text: `Done — ticket ${t.id} opened. We'll reply to ${email} within 24 hours.`,
      }]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-brand-orange hover:bg-brand-orange-light text-white shadow-2xl shadow-brand-orange/30 flex items-center justify-center transition-all hover:scale-105"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[24rem] max-h-[70vh] bg-brand-black-soft border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center text-white font-display font-bold text-sm">O</div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-brand-cream text-sm font-semibold">Odo Assistant</p>
              <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                {session ? `Signed in as ${session.user.name}` : "Online · sign in to view orders"}
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${m.role === "user" ? "bg-brand-orange text-white rounded-br-sm" : "bg-brand-black-card text-brand-cream/85 border border-white/5 rounded-bl-sm"}`}>
                  {m.text}
                </div>
                {m.role === "bot" && (m.signInPrompt || m.ticketPrompt || m.cta) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {m.signInPrompt && (
                      <Link href="/account" className="px-3 py-1.5 text-xs rounded-full bg-brand-orange text-white font-semibold">Sign in</Link>
                    )}
                    {m.ticketPrompt && (
                      <button onClick={escalateToTicket} className="px-3 py-1.5 text-xs rounded-full border border-brand-amber/40 text-brand-amber hover:bg-brand-amber/10">Open ticket</button>
                    )}
                    {m.cta && (
                      <Link href={m.cta.href} className="px-3 py-1.5 text-xs rounded-full border border-white/15 text-brand-cream/75 hover:text-brand-cream hover:border-white/30">{m.cta.label}</Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="px-3 py-1.5 text-xs rounded-full border border-white/10 text-brand-cream/60 hover:border-brand-orange/40 hover:text-brand-cream transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t border-white/10 px-3 py-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 min-w-0 bg-brand-black-card border border-white/10 rounded-full px-4 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0 px-4 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  );
}
