import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

interface NavLink { label: string; href: string; }

export default function NavbarBlock({ block }: BlockRenderProps) {
  const brand = (block.props.brand as string | undefined) ?? "Brand";
  const links = (block.props.links as NavLink[] | undefined) ?? [];
  const ctaLabel = (block.props.ctaLabel as string | undefined) ?? "";
  const ctaHref = (block.props.ctaHref as string | undefined) ?? "#";

  const style: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "16px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    ...blockStylesToCss(block.styles),
  };

  return (
    <nav data-block-type="navbar" style={style}>
      <a href="/" style={{ fontFamily: "var(--font-playfair, Georgia, serif)", fontSize: 18, fontWeight: 700, textDecoration: "none", color: "inherit" }}>
        {brand}
      </a>
      <ul style={{ display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0 }}>
        {links.map((l, i) => (
          <li key={i}>
            <a href={l.href} style={{ fontSize: 14, opacity: 0.85, textDecoration: "none", color: "inherit" }}>{l.label}</a>
          </li>
        ))}
      </ul>
      {ctaLabel && (
        <a href={ctaHref} style={{ padding: "8px 16px", borderRadius: 8, background: "var(--brand-orange, #ff6b35)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          {ctaLabel}
        </a>
      )}
    </nav>
  );
}
