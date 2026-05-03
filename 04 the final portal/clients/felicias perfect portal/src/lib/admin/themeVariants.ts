"use client";

import { ThemeConfig, DEFAULT_THEME, deepMerge } from "./theme";

export type PartialTheme = Partial<{
  [K in keyof ThemeConfig]: Partial<ThemeConfig[K]>;
}>;

export interface ThemeVariant {
  id: string;
  name: string;
  icon: string;
  description: string;
  isBuiltIn: boolean;
  overrides: PartialTheme;
  createdAt: number;
}

// ─── Built-in variant overrides ─────────────────────────────────────────────

function mkLightBg(color: string) {
  return { type: "solid" as const, color, gradient: { from: "#E8621A", via: "#6B2D8B", to: "#F2A23C", angle: 135 }, image: "", imageSize: "cover" as const, overlayColor: "#000000", overlayOpacity: 0.4 };
}

const LIGHT_OVERRIDES: PartialTheme = {
  colors: {
    black: "#FAF5EE",
    blackSoft: "#F0E8DC",
    blackCard: "#FFFFFF",
    cream: "#1A1209",
    creamDark: "#2A1F10",
    orange: "#C44E0E",
    orangeLight: "#E8621A",
    orangeDark: "#A03C08",
    amber: "#C47A10",
    purple: "#5A1E7A",
    purpleLight: "#6B2D8B",
    purpleDark: "#3D1255",
    purpleMuted: "#E8D9F5",
  },
  backgrounds: {
    page: mkLightBg("#FAF5EE"),
    navbar: { ...mkLightBg("#FFFFFF"), type: "transparent" as const },
    hero: mkLightBg("#FAF5EE"),
    featured: mkLightBg("#F0E8DC"),
    problem: mkLightBg("#FAF5EE"),
    solution: mkLightBg("#F0E8DC"),
    shop: mkLightBg("#FAF5EE"),
    testimonials: mkLightBg("#F0E8DC"),
    footer: mkLightBg("#1A1209"),
  },
  highlights: {
    selectionBg: "#C44E0E",
    selectionText: "#FAF5EE",
    heroGlowColor1: "rgba(196,78,14,0.08)",
    heroGlowColor2: "rgba(90,30,122,0.05)",
    cardGlowColor1: "rgba(196,78,14,0.12)",
    cardGlowColor2: "rgba(90,30,122,0.06)",
  },
};

const EARTH_OVERRIDES: PartialTheme = {
  colors: {
    black: "#1C1409",
    blackSoft: "#251B0D",
    blackCard: "#2E2211",
    orange: "#D4651A",
    orangeLight: "#E8851A",
    orangeDark: "#B04A10",
    amber: "#CC8520",
    cream: "#FBF0DF",
    creamDark: "#EFE0C5",
    purple: "#7A3D1E",
    purpleLight: "#9A5030",
    purpleDark: "#5A2A10",
    purpleMuted: "#3A2010",
  },
  backgrounds: {
    page: mkLightBg("#1C1409"),
    navbar: { ...mkLightBg("transparent"), type: "transparent" as const },
    hero: mkLightBg("#1C1409"),
    featured: mkLightBg("#141005"),
    problem: mkLightBg("#1C1409"),
    solution: mkLightBg("#251B0D"),
    shop: mkLightBg("#1C1409"),
    testimonials: mkLightBg("#251B0D"),
    footer: mkLightBg("#0E0A04"),
  },
};

const OCEAN_OVERRIDES: PartialTheme = {
  colors: {
    black: "#04101A",
    blackSoft: "#071825",
    blackCard: "#0B2030",
    orange: "#00B4D8",
    orangeLight: "#48CAE4",
    orangeDark: "#0096B7",
    amber: "#90E0EF",
    cream: "#F0FBFF",
    creamDark: "#CAF0F8",
    purple: "#023E8A",
    purpleLight: "#0077B6",
    purpleDark: "#03045E",
    purpleMuted: "#0A2B4A",
  },
  backgrounds: {
    page: mkLightBg("#04101A"),
    navbar: { ...mkLightBg("transparent"), type: "transparent" as const },
    hero: mkLightBg("#04101A"),
    featured: mkLightBg("#02080F"),
    problem: mkLightBg("#04101A"),
    solution: mkLightBg("#071825"),
    shop: mkLightBg("#04101A"),
    testimonials: mkLightBg("#071825"),
    footer: mkLightBg("#020509"),
  },
  highlights: {
    gradientFrom: "#90E0EF",
    gradientVia: "#00B4D8",
    gradientTo: "#0077B6",
    gradientAngle: 135,
    adinkraColor1: "#023E8A",
    adinkraColor2: "#00B4D8",
    adinkraColor3: "#90E0EF",
    heroGlowColor1: "rgba(0,180,216,0.12)",
    heroGlowColor2: "rgba(2,62,138,0.08)",
    cardGlowColor1: "rgba(0,180,216,0.15)",
    cardGlowColor2: "rgba(2,62,138,0.08)",
    selectionBg: "#00B4D8",
    selectionText: "#04101A",
  },
};

export const BUILT_IN_VARIANTS: ThemeVariant[] = [
  {
    id: "dark",
    name: "Dark (Default)",
    icon: "🌑",
    description: "The original Luv & Ker brand — deep black with warm orange and purple accents.",
    isBuiltIn: true,
    overrides: {},
    createdAt: 0,
  },
  {
    id: "light",
    name: "Light",
    icon: "☀️",
    description: "A bright, airy version of the brand palette with warm cream backgrounds.",
    isBuiltIn: true,
    overrides: LIGHT_OVERRIDES,
    createdAt: 0,
  },
  {
    id: "earth",
    name: "Earth",
    icon: "🌍",
    description: "Warm terracotta and earthy browns — inspired by the Ghanaian soil.",
    isBuiltIn: true,
    overrides: EARTH_OVERRIDES,
    createdAt: 0,
  },
  {
    id: "ocean",
    name: "Ocean",
    icon: "🌊",
    description: "Deep ocean blues — a cool, refreshing take on the brand.",
    isBuiltIn: true,
    overrides: OCEAN_OVERRIDES,
    createdAt: 0,
  },
];

// ─── Storage keys ─────────────────────────────────────────────────────────────

const VARIANTS_KEY = "lk_theme_variants_v1";
const ACTIVE_VARIANT_KEY = "lk_active_variant_v1";
const SITE_DEFAULT_VARIANT_KEY = "lk_default_variant_v1";
const CHANGE_EVENT = "lk-theme-variant-change";

// ─── Custom variant CRUD ──────────────────────────────────────────────────────

function readCustom(): ThemeVariant[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(VARIANTS_KEY) || "[]") as ThemeVariant[]; }
  catch { return []; }
}

function writeCustom(variants: ThemeVariant[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VARIANTS_KEY, JSON.stringify(variants));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listVariants(): ThemeVariant[] {
  return [...BUILT_IN_VARIANTS, ...readCustom()];
}

export function getVariant(id: string): ThemeVariant | null {
  return listVariants().find(v => v.id === id) ?? null;
}

export function createVariant(name: string, sourceId?: string): ThemeVariant {
  const source = sourceId ? getVariant(sourceId) : null;
  const v: ThemeVariant = {
    id: `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    name,
    icon: "🎨",
    description: "",
    isBuiltIn: false,
    overrides: source ? { ...source.overrides } : {},
    createdAt: Date.now(),
  };
  writeCustom([...readCustom(), v]);
  return v;
}

export function updateVariant(id: string, patch: Partial<ThemeVariant>) {
  writeCustom(readCustom().map(v => v.id === id ? { ...v, ...patch } : v));
}

export function deleteVariant(id: string) {
  writeCustom(readCustom().filter(v => v.id !== id));
  if (getActiveVariantId() === id) setActiveVariantId(getSiteDefaultVariantId());
}

// ─── Active variant (user's current choice) ──────────────────────────────────

export function getActiveVariantId(): string {
  if (typeof window === "undefined") return getSiteDefaultVariantId();
  return localStorage.getItem(ACTIVE_VARIANT_KEY) ?? getSiteDefaultVariantId();
}

export function setActiveVariantId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_VARIANT_KEY, id);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// ─── Site default variant (what visitors see by default) ─────────────────────

export function getSiteDefaultVariantId(): string {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(SITE_DEFAULT_VARIANT_KEY) ?? "dark";
}

export function setSiteDefaultVariantId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SITE_DEFAULT_VARIANT_KEY, id);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// ─── Resolve full theme for a variant ────────────────────────────────────────

export function resolveVariantTheme(baseTheme: ThemeConfig, variantId: string): ThemeConfig {
  const variant = getVariant(variantId);
  if (!variant || Object.keys(variant.overrides).length === 0) return baseTheme;
  return deepMerge(baseTheme, variant.overrides as Partial<ThemeConfig>);
}

// ─── Change listener ──────────────────────────────────────────────────────────

export function onVariantChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
