import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function OrderSuccessBlock({ block }: BlockRenderProps) {
  const headline = (block.props.headline as string | undefined) ?? "Thanks for your order!";
  const subhead = (block.props.subhead as string | undefined) ?? "";
  const ctaLabel = (block.props.ctaLabel as string | undefined) ?? "";
  const ctaHref = (block.props.ctaHref as string | undefined) ?? "/shop";

  const style: React.CSSProperties = {
    width: "100%",
    padding: "64px 24px",
    textAlign: "center",
    ...blockStylesToCss(block.styles),
  };

  return (
    <section data-block-type="order-success" style={style}>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: 32, marginBottom: 16 }} aria-hidden="true">✓</div>
      <h1 style={{ fontFamily: "var(--font-playfair, Georgia, serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 12px" }}>{headline}</h1>
      {subhead && <p style={{ maxWidth: 480, margin: "0 auto 32px", opacity: 0.8, lineHeight: 1.5 }}>{subhead}</p>}
      {ctaLabel && (
        <a href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "var(--brand-orange, #ff6b35)", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          {ctaLabel}
          <span aria-hidden="true">→</span>
        </a>
      )}
    </section>
  );
}
