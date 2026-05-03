"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { issueGiftCard, type GiftCard } from "@/lib/giftCards";

export default function GiftCardPurchaseForm({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [issued, setIssued] = useState<GiftCard | null>(null);
  const [copied, setCopied] = useState(false);

  function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    const card = issueGiftCard({
      amount: size.price,
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim(),
      senderName: senderName.trim() || "A friend",
      message: message.trim(),
    });
    setIssued(card);
  }

  function handleCopy() {
    if (!issued) return;
    navigator.clipboard.writeText(issued.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleReset() {
    setIssued(null);
    setRecipientName("");
    setRecipientEmail("");
    setSenderName("");
    setMessage("");
    setCopied(false);
  }

  if (issued) {
    return (
      <div className="flex flex-col">
        <p className="text-[11px] tracking-[0.3em] uppercase text-brand-amber mb-3">{product.origin}</p>
        <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-4">
          Gift card sent ✓
        </h1>
        <p className="text-brand-cream/65 leading-relaxed mb-6">
          A £{issued.amount.toFixed(2)} Odo gift card has been issued to{" "}
          <span className="text-brand-cream">{issued.recipientName || issued.recipientEmail}</span>.
          In production this would arrive by email — for the demo, share the code below directly.
        </p>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-purple-muted/40 to-brand-black-card border border-brand-amber/20 mb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-brand-amber/80 mb-2">Gift card code</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-brand-cream tracking-[0.15em] mb-4 break-all">
            {issued.code}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-brand-orange hover:bg-brand-orange-light text-white transition-colors"
            >
              {copied ? "✓ Copied" : "Copy code"}
            </button>
            <Link
              href="/redeem"
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30 transition-colors"
            >
              Check balance
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-brand-black-card border border-white/5 mb-6">
          <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-2">From {issued.senderName}</p>
          {issued.message ? (
            <p className="text-sm text-brand-cream/75 italic leading-relaxed">&ldquo;{issued.message}&rdquo;</p>
          ) : (
            <p className="text-sm text-brand-cream/40 italic">No personal message</p>
          )}
        </div>

        <button
          onClick={handleReset}
          className="self-start text-sm text-brand-cream/55 hover:text-brand-cream transition-colors"
        >
          ← Send another gift card
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleIssue} className="flex flex-col">
      <p className="text-[11px] tracking-[0.3em] uppercase text-brand-amber mb-3">{product.origin}</p>
      <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-4">
        {product.name}
      </h1>
      <p className="text-[11px] tracking-[0.22em] uppercase text-brand-cream/40 mb-5">{product.tagline}</p>

      <ul className="space-y-2.5 mb-7">
        {product.shortBullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-sm xl:text-base text-brand-cream/70 leading-relaxed">
            <span className="text-brand-amber shrink-0 mt-0.5">✦</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* Denomination */}
      <div className="mb-5">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2.5">Amount</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {product.sizes.map((s) => (
            <button
              type="button"
              key={s.label}
              onClick={() => setSize(s)}
              className={`px-4 py-4 rounded-xl text-base font-medium border transition-all ${
                size.label === s.label
                  ? "border-brand-orange bg-brand-orange/10 text-brand-cream"
                  : "border-white/10 bg-brand-black-card text-brand-cream/60 hover:border-white/25"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">Recipient name</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
            placeholder="Their name"
            className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">Recipient email</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
            placeholder="their@email.com"
            className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors"
          />
        </div>
      </div>

      {/* From */}
      <div className="mb-5">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">From</label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors"
        />
      </div>

      {/* Message */}
      <div className="mb-7">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">Personal message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="A short note for the card…"
          className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl font-semibold text-sm sm:text-base tracking-wide py-4 bg-brand-orange hover:bg-brand-orange-light text-white shadow-lg shadow-brand-orange/20 hover:-translate-y-0.5 transition-all duration-300"
      >
        Send Gift Card · £{size.price.toFixed(2)}
      </button>
      <p className="text-xs text-brand-cream/40 mt-3 text-center">
        Cards never expire. Redeemable on any Odo product at checkout.
      </p>
    </form>
  );
}
