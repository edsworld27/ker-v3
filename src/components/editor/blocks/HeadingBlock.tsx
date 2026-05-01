import { createElement } from "react";
import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function HeadingBlock({ block }: BlockRenderProps) {
  const text = (block.props.text as string | undefined) ?? "";
  const levelRaw = Number(block.props.level ?? 2);
  const level = Math.max(1, Math.min(6, levelRaw)) as 1 | 2 | 3 | 4 | 5 | 6;
  const tag = `h${level}` as const;
  const baseStyle = {
    fontFamily: "var(--font-playfair, Georgia, serif)",
    fontWeight: 700,
    lineHeight: 1.1,
    margin: 0,
    fontSize: level === 1 ? "clamp(2rem, 5vw, 3.5rem)"
      : level === 2 ? "clamp(1.6rem, 4vw, 2.5rem)"
      : level === 3 ? "1.5rem"
      : level === 4 ? "1.25rem"
      : level === 5 ? "1.1rem"
      : "1rem",
  };
  const style = { ...baseStyle, ...blockStylesToCss(block.styles) };
  return createElement(tag, { "data-block-type": "heading", style }, text);
}
