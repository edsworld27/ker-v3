import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function CheckoutSummaryBlock({ block }: BlockRenderProps) {
  const showLineItems = block.props.showLineItems !== false;
  const showShipping = block.props.showShipping !== false;
  const showTax = block.props.showTax !== false;

  const style: React.CSSProperties = {
    width: "100%",
    padding: 24,
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    ...blockStylesToCss(block.styles),
  };

  return (
    <section data-block-type="checkout-summary" style={style}>
      <h2 style={{ fontFamily: "var(--font-playfair, Georgia, serif)", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Order summary</h2>
      {showLineItems && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {[1, 2].map(n => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ opacity: 0.85 }}>Sample item {n}</span>
              <span>£{(12.5 * n).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ opacity: 0.7 }}>Subtotal</span>
          <span>£37.50</span>
        </div>
        {showShipping && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ opacity: 0.7 }}>Shipping</span>
            <span>£3.50</span>
          </div>
        )}
        {showTax && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ opacity: 0.7 }}>Tax</span>
            <span>£8.20</span>
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}>
        <span>Total</span>
        <span>£49.20</span>
      </div>
    </section>
  );
}
