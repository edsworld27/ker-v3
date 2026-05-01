"use client";

import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";
import { useProductsByRange, formatPrice } from "../useProducts";

// Live product grid. Reads the configured collection (range) and limit,
// pulls products from the catalog API, and renders them through the
// shared product-card visual vocabulary. Falls back to placeholders when
// the catalog is empty or still loading (so the canvas isn't a void).

export default function ProductGridBlock({ block, editorMode }: BlockRenderProps) {
  const collection = (block.props.collectionHandle as string | undefined) ?? "all";
  const columns = Math.max(1, Math.min(6, Number(block.props.columns ?? 3) || 3));
  const limit = Math.max(1, Math.min(48, Number(block.props.limit ?? 9) || 9));

  const { products, loading } = useProductsByRange(collection, limit);

  const style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 16,
    width: "100%",
    ...blockStylesToCss(block.styles),
  };

  const items = products.length > 0 ? products : Array.from({ length: limit }).map((_, i) => null);

  return (
    <div data-block-type="product-grid" data-collection={collection} data-limit={limit} style={style}>
      {items.map((p, i) => p ? (
        <article key={p.id} style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <a href={`/products/${p.slug}`} style={{ display: "block", aspectRatio: "1/1", background: "rgba(255,255,255,0.04)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
            {p.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
            )}
          </a>
          <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 2px", color: "inherit" }}>
            <a href={`/products/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{p.name}</a>
          </p>
          <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>
            {p.onSale && p.salePrice
              ? <><span style={{ textDecoration: "line-through", opacity: 0.5, marginRight: 4 }}>{formatPrice(p.price)}</span><span style={{ color: "var(--brand-orange, #ff6b35)", fontWeight: 600 }}>{formatPrice(p.salePrice)}</span></>
              : formatPrice(p.price)}
          </p>
        </article>
      ) : (
        <article key={i} style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ aspectRatio: "1/1", background: "rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 8 }} />
          <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 2px" }}>{loading && !editorMode ? "Loading…" : `Product ${i + 1}`}</p>
          <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>£0.00</p>
        </article>
      ))}
    </div>
  );
}
