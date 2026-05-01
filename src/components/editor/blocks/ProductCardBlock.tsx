import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function ProductCardBlock({ block }: BlockRenderProps) {
  const handle = (block.props.productHandle as string | undefined) ?? "";
  const title = (block.props.title as string | undefined) ?? "Product";
  const price = (block.props.price as string | undefined) ?? "£0.00";
  const image = (block.props.image as string | undefined) ?? "";
  const ctaLabel = (block.props.ctaLabel as string | undefined) ?? "Add to cart";

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    ...blockStylesToCss(block.styles),
  };

  return (
    <article data-block-type="product-card" data-product-handle={handle} style={style}>
      <div style={{ aspectRatio: "1/1", background: "rgba(255,255,255,0.04)", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {image
          /* eslint-disable-next-line @next/next/no-img-element */
          ? <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          : <span style={{ fontSize: 11, opacity: 0.4 }}>Product image</span>
        }
      </div>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>{price}</p>
      </div>
      <button
        type="button"
        data-portal-add-to-cart={handle}
        style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "var(--brand-orange, #ff6b35)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
      >
        {ctaLabel}
      </button>
    </article>
  );
}
