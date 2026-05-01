"use client";

// Donation button — pre-set amounts + custom amount input.
// Routes through Stripe checkout via /api/donations/checkout.

import { useState } from "react";
import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function DonationButtonBlock({ block }: BlockRenderProps) {
  const heading = (block.props.heading as string | undefined) ?? "Support our work";
  const subheading = (block.props.subheading as string | undefined) ?? "Every donation goes directly to the cause.";
  const currency = (block.props.currency as string | undefined) ?? "GBP";
  const amountsRaw = (block.props.amounts as string | undefined) ?? "5,10,25,50,100";
  const amounts = amountsRaw.split(",").map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
  const allowCustom = (block.props.allowCustom as boolean | undefined) ?? true;
  const allowRecurring = (block.props.allowRecurring as boolean | undefined) ?? true;

  const [picked, setPicked] = useState<number | "custom">(amounts[1] ?? amounts[0] ?? 10);
  const [custom, setCustom] = useState<string>("");
  const [recurring, setRecurring] = useState(false);
  const [busy, setBusy] = useState(false);

  const symbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "";

  async function donate() {
    setBusy(true);
    try {
      const amount = picked === "custom" ? Number(custom) : picked;
      if (!Number.isFinite(amount) || amount <= 0) { setBusy(false); return; }
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, recurring }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } finally { setBusy(false); }
  }

  return (
    <section data-block-type="donation-button" style={{ padding: "48px 24px", ...blockStylesToCss(block.styles) }}>
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-playfair, Georgia, serif)", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{heading}</h2>
        {subheading && <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 24 }}>{subheading}</p>}

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          {amounts.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => setPicked(a)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: picked === a ? "var(--brand-orange, #ff6b35)" : "rgba(255,255,255,0.15)",
                background: picked === a ? "var(--brand-orange, #ff6b35)" : "rgba(255,255,255,0.04)",
                color: picked === a ? "#fff" : "inherit",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              {symbol}{a}
            </button>
          ))}
          {allowCustom && (
            <button
              type="button"
              onClick={() => setPicked("custom")}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: picked === "custom" ? "var(--brand-orange, #ff6b35)" : "rgba(255,255,255,0.15)",
                background: picked === "custom" ? "var(--brand-orange, #ff6b35)" : "rgba(255,255,255,0.04)",
                color: picked === "custom" ? "#fff" : "inherit",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Other
            </button>
          )}
        </div>

        {allowCustom && picked === "custom" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", maxWidth: 200, margin: "0 auto 16px" }}>
            <span style={{ fontSize: 16 }}>{symbol}</span>
            <input
              type="number"
              min={1}
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="Amount"
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
                color: "inherit",
                fontSize: 14,
              }}
            />
          </div>
        )}

        {allowRecurring && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13 }}>
            <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} />
            Make this monthly
          </label>
        )}

        <button
          type="button"
          onClick={donate}
          disabled={busy || (picked === "custom" && !Number(custom))}
          style={{
            display: "block",
            width: "100%",
            padding: "12px 20px",
            borderRadius: 10,
            background: "var(--brand-orange, #ff6b35)",
            color: "#fff",
            fontSize: 14, fontWeight: 600,
            border: "none",
            cursor: busy ? "wait" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Redirecting…" : `Donate ${recurring ? "monthly " : ""}now`}
        </button>
      </div>
    </section>
  );
}
