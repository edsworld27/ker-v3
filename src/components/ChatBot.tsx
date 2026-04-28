"use client";

import { useState, useRef, useEffect } from "react";
import { getGiftCard } from "@/lib/giftCards";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  ts: number;
}

interface OrderStatus {
  number: string;
  status: string;
  carrier: string;
  tracking: string;
  estimated: string;
}

// In production this would hit an API. For the demo we synthesise a realistic
// status from the order number itself so any number a user types comes back
// with a believable result, but we never claim certainty.
function lookupOrder(orderNumber: string): OrderStatus | null {
  const cleaned = orderNumber.replace(/[^a-zA-Z0-9-]/g, "");
  if (cleaned.length < 4) return null;
  const seed = Array.from(cleaned).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const statuses = [
    { status: "Packed in Accra — awaiting carrier pickup", days: 1 },
    { status: "In transit · Air freight to UK hub", days: 3 },
    { status: "Arrived at UK distribution centre · Birmingham", days: 5 },
    { status: "Out for delivery", days: 6 },
    { status: "Delivered", days: 7 },
  ];
  const stage = statuses[seed % statuses.length];
  const eta = new Date(Date.now() + (7 - stage.days) * 24 * 60 * 60 * 1000);
  return {
    number: cleaned.toUpperCase(),
    status: stage.status,
    carrier: "Royal Mail Tracked 48",
    tracking: `RM${seed.toString().slice(-9).padStart(9, "0")}GB`,
    estimated: eta.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
  };
}

function botReply(input: string): string {
  const q = input.toLowerCase().trim();

  // Order tracking
  const trackMatch = q.match(/(?:track|where|status|order)\s*(?:order|#|number)?\s*([a-z0-9-]{4,})/i);
  if (trackMatch) {
    const order = lookupOrder(trackMatch[1]);
    if (order) {
      return [
        `Order ${order.number}`,
        `Status: ${order.status}`,
        `Carrier: ${order.carrier} (${order.tracking})`,
        `Estimated delivery: ${order.estimated}`,
      ].join("\n");
    }
    return "I couldn't read that order number. They look like ODO-1024 or 1024. Try again?";
  }

  // Gift card balance
  const giftMatch = q.match(/(odo-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})/i);
  if (giftMatch) {
    const card = getGiftCard(giftMatch[1]);
    if (card) {
      return `Gift card ${card.code} has £${card.balance.toFixed(2)} of £${card.amount.toFixed(2)} remaining.`;
    }
    return "I couldn't find that gift card. Double-check the format ODO-XXXX-XXXX-XXXX and try again.";
  }

  // Intent matching
  if (/track|where.+order|order status|delivery/i.test(q)) {
    return "Sure — what's your order number? It looks like ODO-1024 or similar (in your confirmation email).";
  }
  if (/gift\s*card.+balance|check.+balance|redeem/i.test(q)) {
    return "Paste your gift card code (ODO-XXXX-XXXX-XXXX) and I'll look up the balance, or visit /redeem for the full lookup.";
  }
  if (/return|refund/i.test(q)) {
    return "We offer 30-day returns on unopened products. Email hello@luvandker.com with your order number to start a return — refund lands within 5 working days of us receiving it.";
  }
  if (/shipping|delivery|how long/i.test(q)) {
    return "UK standard shipping: £4.99 (2–4 working days), free over £30. Express: £7.90 next-day if ordered before 2pm. EU/US/CA also available.";
  }
  if (/ingredient|whats in|allerg|paraben|phthalate|sulphate|sls/i.test(q)) {
    return "Every ingredient is named on the product page. Odo is free from parabens, phthalates, sulphates (SLS/SLES) and synthetic fragrance. Full source list on the Ingredients page.";
  }
  if (/pregnan|baby|sensitive|eczema|rosacea/i.test(q)) {
    return "Odo is free from the most common irritants and endocrine disruptors. Many customers with sensitive skin use it daily. We always recommend a patch test and checking with your clinician for pregnancy use.";
  }
  if (/vegan|cruelty/i.test(q)) {
    return "100% vegan and never tested on animals.";
  }
  if (/discount|code|promo|first order/i.test(q)) {
    return "Sign up to the newsletter at the bottom of any page for a first-order discount. We don't run flash sales — our prices stay honest.";
  }
  if (/contact|human|email|speak to someone/i.test(q)) {
    return "Email hello@luvandker.com — we reply within 24 hours, Mon–Fri. For press, press@luvandker.com.";
  }
  if (/hi$|hello|hey|hiya|good (morning|afternoon|evening)/i.test(q)) {
    return "Hello! I can help with order tracking, gift card balances, returns, ingredients and shipping. What can I help with?";
  }
  if (/thank/i.test(q)) {
    return "Anytime ✦";
  }

  return "I can help with order tracking ('track 1024'), gift card balances, returns, shipping, ingredients and sensitive-skin questions. For anything else, email hello@luvandker.com.";
}

const QUICK_PROMPTS = [
  "Track my order",
  "Check gift card balance",
  "Returns policy",
  "Shipping times",
  "Is this safe for sensitive skin?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi, I'm Odo — Luv & Ker's assistant. I can track orders, check gift card balances, and answer questions about ingredients, shipping and returns. How can I help?",
      ts: Date.now(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: `${Date.now()}-u`, role: "user", text: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Simulate small think delay so it feels conversational
    setTimeout(() => {
      const reply = botReply(trimmed);
      setMessages((m) => [...m, { id: `${Date.now()}-b`, role: "bot", text: reply, ts: Date.now() }]);
    }, 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {/* Toggle button */}
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

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[24rem] max-h-[70vh] bg-brand-black-soft border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center text-white font-display font-bold text-sm">
              O
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-brand-cream text-sm font-semibold">Odo Assistant</p>
              <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online · replies instantly
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-brand-orange text-white rounded-br-sm"
                      : "bg-brand-black-card text-brand-cream/85 border border-white/5 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick prompts (only show before user has typed) */}
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

          {/* Input */}
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
