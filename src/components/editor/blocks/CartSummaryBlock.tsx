import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function CartSummaryBlock({ block }: BlockRenderProps) {
  const showThumbnails = block.props.showThumbnails !== false;
  const showQty = block.props.showQuantitySelector !== false;

  const style: React.CSSProperties = {
    width: "100%",
    padding: 24,
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    ...blockStylesToCss(block.styles),
  };

  return (
    <section data-block-type="cart-summary" style={style}>
      <h2 style={{ fontFamily: "var(--font-playfair, Georgia, serif)", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Cart</h2>
      <div data-portal-cart-lines style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[1, 2].map(n => (
          <div key={n} style={{ display: "grid", gridTemplateColumns: showThumbnails ? "64px 1fr auto" : "1fr auto", gap: 12, alignItems: "center", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
            {showThumbnails && <div style={{ width: 64, height: 64, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>Sample item {n}</p>
              {showQty && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 6px", borderRadius: 6, background: "rgba(0,0,0,0.3)", fontSize: 11 }}>
                  <button style={{ all: "unset", cursor: "pointer", padding: "2px 6px" }}>−</button>
                  <span>1</span>
                  <button style={{ all: "unset", cursor: "pointer", padding: "2px 6px" }}>+</button>
                </div>
              )}
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>£{(12.5 * n).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>Subtotal</span>
        <span style={{ fontSize: 18, fontWeight: 700 }}>£37.50</span>
      </div>
    </section>
  );
}
