// Maps a Block's typed `styles` field onto inline React style props.
// Kept in its own module so both the editor canvas and the host-side
// PortalPageRenderer use identical logic — what you see in the canvas
// matches what visitors see live.

import type { CSSProperties } from "react";
import type { BlockStyles } from "@/portal/server/types";

export function blockStylesToCss(styles?: BlockStyles): CSSProperties {
  if (!styles) return {};
  const css: CSSProperties = {};
  if (styles.padding         !== undefined) css.padding         = styles.padding;
  if (styles.margin          !== undefined) css.margin          = styles.margin;
  if (styles.background      !== undefined) css.background      = styles.background;
  if (styles.textColor       !== undefined) css.color           = styles.textColor;
  if (styles.align           !== undefined) css.textAlign       = styles.align;
  if (styles.width           !== undefined) css.width           = styles.width;
  if (styles.maxWidth        !== undefined) css.maxWidth        = styles.maxWidth;
  if (styles.minHeight       !== undefined) css.minHeight       = styles.minHeight;
  if (styles.borderRadius    !== undefined) css.borderRadius    = styles.borderRadius;
  if (styles.border          !== undefined) css.border          = styles.border;
  if (styles.boxShadow       !== undefined) css.boxShadow       = styles.boxShadow;
  if (styles.fontFamily      !== undefined) css.fontFamily      = styles.fontFamily;
  if (styles.fontSize        !== undefined) css.fontSize        = styles.fontSize;
  if (styles.fontWeight      !== undefined) css.fontWeight      = styles.fontWeight as CSSProperties["fontWeight"];
  if (styles.lineHeight      !== undefined) css.lineHeight      = styles.lineHeight;
  if (styles.letterSpacing   !== undefined) css.letterSpacing   = styles.letterSpacing;
  if (styles.display         !== undefined) css.display         = styles.display;
  if (styles.flexDirection   !== undefined) css.flexDirection   = styles.flexDirection;
  if (styles.justifyContent  !== undefined) css.justifyContent  = styles.justifyContent;
  if (styles.alignItems      !== undefined) css.alignItems      = styles.alignItems;
  if (styles.gap             !== undefined) css.gap             = styles.gap;
  if (styles.gridTemplateColumns !== undefined) css.gridTemplateColumns = styles.gridTemplateColumns;
  return css;
}

// Stable list of style keys the editor's properties panel supports. Used
// by the styles tab of the panel to render inputs without a per-block
// schema (every block accepts the same style fields).
export const STYLE_FIELD_GROUPS: Array<{ label: string; fields: Array<keyof BlockStyles> }> = [
  { label: "Spacing",     fields: ["padding", "margin", "gap"] },
  { label: "Size",        fields: ["width", "maxWidth", "minHeight"] },
  { label: "Background",  fields: ["background", "border", "borderRadius", "boxShadow"] },
  { label: "Text",        fields: ["textColor", "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "align"] },
  { label: "Layout",      fields: ["display", "flexDirection", "justifyContent", "alignItems"] },
];
