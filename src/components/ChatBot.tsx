"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getGiftCard } from "@/lib/giftCards";
import { listOrders, type Order } from "@/lib/admin/orders";
import { getSession, AUTH_EVENT, type Session } from "@/lib/auth";
import { createTicket } from "@/lib/admin/tickets";
import { getShippingConfig } from "@/lib/admin/shipping";
import { resolveSiteByHost } from "@/lib/admin/sites";

// Per-site config shape served by /api/portal/chatbot/[siteId]. Inlined
// to keep this client component free of server-only imports.
type ChatbotProvider = "portal-builtin" | "crisp" | "intercom" | "tidio" | "custom-gpt";

interface ChatbotConfig {
  provider: ChatbotProvider;
  enabled: boolean;
  value?: string;
  welcomeMessage?: string;
  systemPrompt?: string;
  position?: "bottom-right" | "bottom-left";
  accentColor?: string;
}

const DEFAULT_WELCOME =
  "Hi, I'm Odo — Luv & Ker's assistant. I can track orders (after you sign in), check gift card balances, and answer questions about ingredients, shipping and returns. How can I help?";

// Site-id resolution. Tries the script tag attribute first (no localStorage
// dependency, mirrors the convention used by lib/portalCache.ts) and falls
// back to host-based resolution from the admin site list. Memoised at module
// scope — siteId never changes within a page load.
let resolvedSiteId: string | null = null;
function activeSiteId(): string {
  if (resolvedSiteId) return resolvedSiteId;
  if (typeof window === "undefined") return "luvandker";
  const tag = document.querySelector<HTMLScriptElement>("script[data-portal-site]");
  const fromTag = tag?.getAttribute("data-portal-site") ?? null;
  if (fromTag) {
    resolvedSiteId = fromTag;
    return fromTag;
  }
  try {
    const site = resolveSiteByHost(window.location.host);
    resolvedSiteId = site.id;
    return site.id;
  } catch {
    resolvedSiteId = "luvandker";
    return resolvedSiteId;
  }
}

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

function botReply(input: string, session: Session | null, systemPrompt?: string): { text: string; signInPrompt?: boolean; ticketPrompt?: boolean; cta?: { label: string; href: string } } {
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
    const { zones } = getShippingConfig();
    const uk = zones.find(z => z.id === "z_uk" || z.countries.includes("GB"));
    let text = "";
    if (uk) {
      const parts = uk.rates.map(r => {
        const days = r.minDays === r.maxDays ? `${r.minDays} day` : `${r.minDays}–${r.maxDays} days`;
        return `${r.label}: £${r.price.toFixed(2)} (${days})`;
      });
      const threshold = uk.freeThreshold;
      if (threshold) parts.push(`Free over £${threshold}`);
      text = `UK shipping — ${parts.join(" · ")}.`;
    } else {
      text = "UK and international shipping available.";
    }
    text += " EU, US/CA and worldwide also covered.";
    return { text, cta: { label: "Full shipping info", href: "/shipping-returns" } };
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

  // Fallback: lean on the admin-supplied system prompt (custom-gpt mode)
  // when the canned matchers don't fire. We don't run a real LLM here, but
  // surfacing the configured persona keeps the bot on-brand and gives the
  // admin a visible payoff for editing the prompt.
  if (systemPrompt && systemPrompt.trim()) {
    return {
      text: `${systemPrompt.trim()}\n\nI can also help with order tracking, gift card balances, returns, shipping and ingredients. Want me to open a ticket so the team can follow up?`,
      ticketPrompt: true,
    };
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

// Hex → rgba helper for translucent backdrops (e.g. launcher shadow). Returns
// "rgba(255,107,53,a)" given "#FF6B35"; falls back to brand-orange tone if
// the input isn't a parseable 6-digit hex.
function withAlpha(hex: string | undefined, alpha: number): string {
  const fallback = `rgba(255,107,53,${alpha})`;
  if (!hex) return fallback;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return fallback;
  const v = parseInt(m[1], 16);
  return `rgba(${(v >> 16) & 0xff},${(v >> 8) & 0xff},${v & 0xff},${alpha})`;
}

export default function ChatBot() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load the per-site config once on mount. The endpoint is CORS-open so
  // the storefront pulls it without auth; we cache whatever comes back
  // (or fall back to the built-in defaults if the request fails).
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        const siteId = activeSiteId();
        const res = await fetch(`/api/portal/chatbot/${encodeURIComponent(siteId)}`, { cache: "no-store" });
        if (!res.ok || cancelled) {
          if (!cancelled) setConfigLoaded(true);
          return;
        }
        const data = await res.json() as ChatbotConfig;
        if (!cancelled) {
          setConfig(data);
          setConfigLoaded(true);
        }
      } catch {
        if (!cancelled) setConfigLoaded(true);
      }
    }
    void pull();
    return () => { cancelled = true; };
  }, []);

  // Once the config arrives, seed the welcome message — either the admin's
  // override or the long-standing default. Done in an effect (not state init)
  // so the message updates after the async fetch lands.
  useEffect(() => {
    if (!configLoaded) return;
    const welcome = config?.welcomeMessage?.trim() || DEFAULT_WELCOME;
    setMessages([{ id: "welcome", role: "bot", text: welcome, ts: Date.now() }]);
  }, [configLoaded, config?.welcomeMessage]);

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

  const accent = config?.accentColor?.trim() || undefined;
  const accentStyles = useMemo(() => ({
    launcher: accent ? { backgroundColor: accent, boxShadow: `0 16px 32px -12px ${withAlpha(accent, 0.35)}` } : undefined,
    userBubble: accent ? { backgroundColor: accent } : undefined,
    sendButton: accent ? { backgroundColor: accent } : undefined,
    avatar: accent ? { background: `linear-gradient(135deg, ${accent}, ${withAlpha(accent, 0.55)})` } : undefined,
  }), [accent]);

  // Hide on the admin panel — admins shouldn't see customer-facing chat.
  if (pathname.startsWith("/admin")) return null;

  // Wait for the config so we don't flash a built-in widget when the site
  // is configured for a 3rd-party provider (or has the bot disabled).
  if (!configLoaded) return null;

  // If the admin has switched the site to a 3rd-party provider, render
  // nothing here — the EmbedsBlock + <PortalEmbed/> flow owns those
  // widgets. A console hint helps anyone debugging "why is there no chat?"
  if (config && (config.provider === "crisp" || config.provider === "intercom" || config.provider === "tidio")) {
    if (typeof window !== "undefined" && !(window as unknown as { __lkChatbotWarned?: boolean }).__lkChatbotWarned) {
      console.warn(`[ChatBot] provider="${config.provider}" — built-in renderer skipped. Configure it in the Embeds card on the Sites admin instead.`);
      (window as unknown as { __lkChatbotWarned?: boolean }).__lkChatbotWarned = true;
    }
    return null;
  }

  if (config && config.enabled === false) return null;

  const position = config?.position ?? "bottom-right";
  const launcherPositionCls = position === "bottom-left"
    ? "bottom-5 left-5 sm:bottom-6 sm:left-6"
    : "bottom-5 right-5 sm:bottom-6 sm:right-6";
  const panelPositionCls = position === "bottom-left"
    ? "bottom-24 left-4 sm:left-6"
    : "bottom-24 right-4 sm:right-6";

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: `${Date.now()}-u`, role: "user", text: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply = botReply(trimmed, session, config?.systemPrompt);
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
        style={accentStyles.launcher}
        className={`fixed ${launcherPositionCls} z-40 w-14 h-14 sm:w-15 sm:h-15 rounded-full ${accent ? "" : "bg-brand-orange hover:bg-brand-orange-light shadow-2xl shadow-brand-orange/30"} text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105`}
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
        <div className={`fixed ${panelPositionCls} z-40 w-[calc(100vw-2rem)] sm:w-[24rem] max-h-[70vh] bg-brand-black-soft border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div
              style={accentStyles.avatar}
              className={`w-9 h-9 rounded-full ${accent ? "" : "bg-gradient-to-br from-brand-orange to-brand-purple"} flex items-center justify-center text-white font-display font-bold text-sm`}
            >O</div>
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
                <div
                  style={m.role === "user" ? accentStyles.userBubble : undefined}
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${m.role === "user" ? `${accent ? "" : "bg-brand-orange"} text-white rounded-br-sm` : "bg-brand-black-card text-brand-cream/85 border border-white/5 rounded-bl-sm"}`}
                >
                  {m.text}
                </div>
                {m.role === "bot" && (m.signInPrompt || m.ticketPrompt || m.cta) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {m.signInPrompt && (
                      <Link
                        href="/account"
                        style={accentStyles.sendButton}
                        className={`px-3 py-1.5 text-xs rounded-full ${accent ? "" : "bg-brand-orange"} text-white font-semibold`}
                      >Sign in</Link>
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
              style={accentStyles.sendButton}
              className={`shrink-0 px-4 py-2.5 rounded-full ${accent ? "" : "bg-brand-orange hover:bg-brand-orange-light"} disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors`}
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  );
}
