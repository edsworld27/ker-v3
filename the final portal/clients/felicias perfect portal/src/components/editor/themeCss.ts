// Client-side mirror of the server's tokensToCssVars helper. Used by
// PortalPageRenderer + Canvas root to inject the active theme's tokens
// without re-fetching from the server module (the server module isn't
// importable in client bundles).

import type { ThemeTokens } from "@/portal/server/types";

export function tokensToCssVarsClient(tokens: ThemeTokens | undefined): string {
  if (!tokens) return "";
  const out: string[] = [];
  if (tokens.primary)      out.push(`--theme-primary: ${tokens.primary};`);
  if (tokens.surface)      out.push(`--theme-surface: ${tokens.surface};`);
  if (tokens.surfaceAlt)   out.push(`--theme-surface-alt: ${tokens.surfaceAlt};`);
  if (tokens.ink)          out.push(`--theme-ink: ${tokens.ink};`);
  if (tokens.inkSoft)      out.push(`--theme-ink-soft: ${tokens.inkSoft};`);
  if (tokens.border)       out.push(`--theme-border: ${tokens.border};`);
  if (tokens.shadow)       out.push(`--theme-shadow: ${tokens.shadow};`);
  if (tokens.fontHeading)  out.push(`--theme-font-heading: ${tokens.fontHeading};`);
  if (tokens.fontBody)     out.push(`--theme-font-body: ${tokens.fontBody};`);
  if (tokens.fontMono)     out.push(`--theme-font-mono: ${tokens.fontMono};`);
  if (tokens.radius)       out.push(`--theme-radius: ${tokens.radius};`);
  if (tokens.spacingUnit)  out.push(`--theme-space: ${tokens.spacingUnit};`);
  return out.join(" ");
}
