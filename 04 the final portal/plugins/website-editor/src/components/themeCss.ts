// Convert ThemeRecord tokens → CSS variable string for injection.
// Round-1 minimal port from `02/src/components/editor/themeCss.ts`.

import type { ThemeTokens } from "../types/theme";

export function tokensToCssVars(tokens: ThemeTokens): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === "string" && value.length > 0) {
      lines.push(`--theme-${key}: ${value};`);
    }
  }
  return `:root { ${lines.join(" ")} }`;
}
