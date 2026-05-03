"use client";

import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function PaymentButtonBlock({ block }: BlockRenderProps) {
  const label = (block.props.label as string | undefined) ?? "Pay now";
  const provider = (block.props.provider as string | undefined) ?? "stripe";
  const colors: Record<string, string> = {
    stripe:   "#635bff",
    paypal:   "#003087",
    applepay: "#000",
  };
  const bg = colors[provider] ?? "var(--brand-orange, #ff6b35)";

  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 24px",
    borderRadius: 12,
    border: "none",
    background: bg,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 240,
    ...blockStylesToCss(block.styles),
  };

  return (
    <button data-block-type="payment-button" data-provider={provider} type="button" style={style}>
      {provider === "applepay" ? <span aria-hidden="true"></span> : null}
      <span>{label}</span>
    </button>
  );
}
