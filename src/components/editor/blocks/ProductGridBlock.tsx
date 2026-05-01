import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

// Editor-time stub: renders N placeholder cards using the configured columns
// and limit. The host site replaces this at runtime with live products from
// the configured collection (handled by PortalPageRenderer's live data
// resolver — wired in V-D).

export default function ProductGridBlock({ block }: BlockRenderProps) {
  const collection = (block.props.collectionHandle as string | undefined) ?? "all";
  const columns = Math.max(1, Math.min(6, Number(block.props.columns ?? 3) || 3));
  const limit = Math.max(1, Math.min(48, Number(block.props.limit ?? 9) || 9));
  const placeholders = Array.from({ length: limit });

  const style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 16,
    width: "100%",
    ...blockStylesToCss(block.styles),
  };

  return (
    <div data-block-type="product-grid" data-collection={collection} data-limit={limit} style={style}>
      {placeholders.map((_, i) => (
        <article key={i} style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ aspectRatio: "1/1", background: "rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 8 }} />
          <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 2px" }}>Product {i + 1}</p>
          <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>£0.00</p>
        </article>
      ))}
    </div>
  );
}
