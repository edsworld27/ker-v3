// Build inline style objects from a block's `styleOverrides` and
// `responsive` props. Round-1 stub — Round-2 lifts the full
// implementation from `02/src/components/editor/blockStyles.ts`.

import type { CSSProperties } from "react";
import type { Block } from "../types/block";

export function buildBlockStyle(block: Block): CSSProperties {
  const style: CSSProperties = {};
  for (const [k, v] of Object.entries(block.styleOverrides ?? {})) {
    (style as Record<string, string | number>)[k] = v;
  }
  return style;
}

export function buildResponsiveCss(_block: Block): string {
  // TODO Round 2 — emit `@media (min-width: …)` blocks for sm/md/lg/xl overrides.
  return "";
}
