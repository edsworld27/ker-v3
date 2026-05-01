import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function IconBlock({ block }: BlockRenderProps) {
  const glyph = (block.props.glyph as string | undefined) ?? "✦";
  const size = (block.props.size as string | undefined) ?? "32px";
  const color = (block.props.color as string | undefined) ?? "#ff6b35";
  const style = { fontSize: size, color, lineHeight: 1, display: "inline-block", ...blockStylesToCss(block.styles) };
  return <span data-block-type="icon" style={style} aria-hidden="true">{glyph}</span>;
}
