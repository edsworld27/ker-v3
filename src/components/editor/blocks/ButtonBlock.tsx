import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function ButtonBlock({ block }: BlockRenderProps) {
  const label = (block.props.label as string | undefined) ?? "Button";
  const href = (block.props.href as string | undefined) ?? "#";
  const variant = (block.props.variant as "primary" | "secondary" | "ghost" | undefined) ?? "primary";
  const variantStyle =
    variant === "primary"   ? { background: "var(--brand-orange, #ff6b35)", color: "#fff", border: "none" }
    : variant === "secondary" ? { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }
    : { background: "transparent", color: "rgba(255,255,255,0.85)", border: "none", padding: "8px 12px" };
  const style = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 20px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    transition: "opacity 150ms",
    ...variantStyle,
    ...blockStylesToCss(block.styles),
  } as React.CSSProperties;
  return (
    <a data-block-type="button" href={href} style={style} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
      {label}
    </a>
  );
}
