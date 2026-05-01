import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function TextBlock({ block }: BlockRenderProps) {
  const text = (block.props.text as string | undefined) ?? "";
  const style = { lineHeight: 1.6, fontSize: "1rem", margin: 0, ...blockStylesToCss(block.styles) };
  // Allow basic markup so the rich-text panel can produce <strong>, <em>, <a>.
  // The canonical implementation should sanitise on save, but we accept HTML
  // here at render time for the visual editor's WYSIWYG experience.
  if (text.includes("<")) {
    return <div data-block-type="text" style={style} dangerouslySetInnerHTML={{ __html: text }} />;
  }
  return <p data-block-type="text" style={style}>{text}</p>;
}
