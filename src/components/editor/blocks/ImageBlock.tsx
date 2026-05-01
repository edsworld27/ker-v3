import type { BlockRenderProps } from "../blockRegistry";
import { blockStylesToCss } from "../blockStyles";

export default function ImageBlock({ block }: BlockRenderProps) {
  const src = (block.props.src as string | undefined) ?? "";
  const alt = (block.props.alt as string | undefined) ?? "";
  const width = (block.props.width as string | undefined) ?? "100%";
  const href = (block.props.href as string | undefined) ?? "";
  const style = { width, height: "auto", display: "block", borderRadius: 0, ...blockStylesToCss(block.styles) };
  if (!src) {
    return (
      <div data-block-type="image" style={{ width, aspectRatio: "16/9", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: 12, borderRadius: 8, ...blockStylesToCss(block.styles) }}>
        Image — set source URL
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img data-block-type="image" src={src} alt={alt} style={style} loading="lazy" />;
  if (href) {
    return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "block" }}>{img}</a>;
  }
  return img;
}
