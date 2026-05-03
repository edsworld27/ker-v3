// Server-side theme store (T-1). Each site has a small list of themes
// (Default + Light + Dark seeded automatically); pages reference one by
// id and the renderer injects the resolved tokens as CSS variables.
//
// Tokens are flat (no nesting) so the renderer's CSS-var generator is
// trivial: every key becomes `--theme-<key>: <value>`. Empty/missing
// tokens fall back to whatever the block component or BlockStyles set,
// so a site without any themes configured renders identically to today.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import type { ThemeRecord, ThemeTokens } from "./types";

function makeId(): string {
  return `thm_${crypto.randomBytes(5).toString("hex")}`;
}

function ensureBucket(state: { themes: Record<string, Record<string, ThemeRecord>> }, siteId: string): Record<string, ThemeRecord> {
  if (!state.themes[siteId]) state.themes[siteId] = {};
  return state.themes[siteId];
}

// Seeded once per site on first read so admins never see an empty
// themes list. Idempotent — re-running won't duplicate.
const SEEDED_DEFAULTS: Array<Pick<ThemeRecord, "id" | "name" | "isDefault" | "appearance" | "tokens">> = [
  {
    id: "default",
    name: "Default",
    isDefault: true,
    appearance: "auto",
    tokens: {
      primary: "#ff6b35",
      surface: "#0a0a0a",
      surfaceAlt: "#141414",
      ink: "#f5e6d3",
      inkSoft: "rgba(245,230,211,0.65)",
      border: "rgba(255,255,255,0.08)",
      shadow: "0 4px 24px rgba(0,0,0,0.4)",
      fontHeading: "var(--font-playfair, Georgia, serif)",
      fontBody: "var(--font-dm-sans, system-ui, sans-serif)",
      radius: "12px",
      spacingUnit: "8px",
    },
  },
  {
    id: "light",
    name: "Light",
    appearance: "light",
    tokens: {
      primary: "#ff6b35",
      surface: "#ffffff",
      surfaceAlt: "#f7f4ee",
      ink: "#1a1a1a",
      inkSoft: "rgba(26,26,26,0.65)",
      border: "rgba(0,0,0,0.08)",
      shadow: "0 4px 24px rgba(0,0,0,0.08)",
      fontHeading: "var(--font-playfair, Georgia, serif)",
      fontBody: "var(--font-dm-sans, system-ui, sans-serif)",
      radius: "12px",
      spacingUnit: "8px",
    },
  },
  {
    id: "dark",
    name: "Dark",
    appearance: "dark",
    tokens: {
      primary: "#ff9a5a",
      surface: "#050505",
      surfaceAlt: "#0c0c0c",
      ink: "#f5e6d3",
      inkSoft: "rgba(245,230,211,0.55)",
      border: "rgba(255,255,255,0.06)",
      shadow: "0 4px 24px rgba(0,0,0,0.6)",
      fontHeading: "var(--font-playfair, Georgia, serif)",
      fontBody: "var(--font-dm-sans, system-ui, sans-serif)",
      radius: "12px",
      spacingUnit: "8px",
    },
  },
];

export function listThemes(siteId: string): ThemeRecord[] {
  const bucket = getState().themes[siteId];
  if (!bucket || Object.keys(bucket).length === 0) {
    // Lazy-seed on first read.
    seedDefaults(siteId);
    return Object.values(getState().themes[siteId] ?? {});
  }
  return Object.values(bucket).sort((a, b) => (a.isDefault ? -1 : 0) - (b.isDefault ? -1 : 0) || a.name.localeCompare(b.name));
}

export function getTheme(siteId: string, themeId: string): ThemeRecord | undefined {
  return getState().themes[siteId]?.[themeId];
}

export function getDefaultTheme(siteId: string): ThemeRecord | undefined {
  const all = listThemes(siteId);
  return all.find(t => t.isDefault) ?? all[0];
}

export function resolveTheme(siteId: string, themeId?: string | null): ThemeRecord | undefined {
  if (themeId) {
    const direct = getTheme(siteId, themeId);
    if (direct) return direct;
  }
  return getDefaultTheme(siteId);
}

export interface CreateThemeInput {
  name: string;
  appearance?: "light" | "dark" | "auto";
  tokens?: ThemeTokens;
}

export function createTheme(siteId: string, input: CreateThemeInput): ThemeRecord {
  const id = makeId();
  const theme: ThemeRecord = {
    id,
    name: input.name,
    appearance: input.appearance,
    tokens: input.tokens ?? {},
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  mutate(state => {
    const bucket = ensureBucket(state, siteId);
    bucket[id] = theme;
  });
  return theme;
}

export function updateTheme(siteId: string, themeId: string, patch: Partial<Omit<ThemeRecord, "id" | "createdAt">>): ThemeRecord | null {
  let result: ThemeRecord | null = null;
  mutate(state => {
    const existing = state.themes[siteId]?.[themeId];
    if (!existing) return;
    const next: ThemeRecord = {
      ...existing,
      ...patch,
      tokens: { ...existing.tokens, ...(patch.tokens ?? {}) },
      updatedAt: Date.now(),
    };
    state.themes[siteId][themeId] = next;
    result = next;
  });
  return result;
}

export function setDefaultTheme(siteId: string, themeId: string): ThemeRecord | null {
  let result: ThemeRecord | null = null;
  mutate(state => {
    const bucket = ensureBucket(state, siteId);
    if (!bucket[themeId]) return;
    for (const id of Object.keys(bucket)) {
      bucket[id] = { ...bucket[id], isDefault: id === themeId };
    }
    result = bucket[themeId];
  });
  return result;
}

export function deleteTheme(siteId: string, themeId: string): boolean {
  let removed = false;
  mutate(state => {
    const bucket = state.themes[siteId];
    if (!bucket?.[themeId]) return;
    if (bucket[themeId].isDefault) return; // refuse to delete the default
    delete bucket[themeId];
    removed = true;
  });
  return removed;
}

function seedDefaults(siteId: string) {
  mutate(state => {
    const bucket = ensureBucket(state, siteId);
    for (const seed of SEEDED_DEFAULTS) {
      if (bucket[seed.id]) continue;
      bucket[seed.id] = {
        ...seed,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
  });
}

// Convert tokens → CSS variable declarations, ready to drop inside a
// :root { … } or scoped selector. Skips empty tokens so the cascade
// can fall through to whatever the block component sets natively.
export function tokensToCssVars(tokens: ThemeTokens): string {
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
