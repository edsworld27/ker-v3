"use client";

const PUBLISHED_KEY = "lk_theme_v1";
const DRAFT_KEY = "lk_theme_draft_v1";
const THEME_CHANGE_EVENT = "lk-theme-change";

export interface GradientConfig {
  from: string;
  via: string;
  to: string;
  angle: number;
}

export interface BackgroundConfig {
  type: "solid" | "gradient" | "image" | "transparent";
  color: string;
  gradient: GradientConfig;
  image: string;
  imageSize: "cover" | "contain" | "repeat";
  overlayColor: string;
  overlayOpacity: number;
}

export interface LocalFont {
  name: string;
  url: string;
  weights: string[];
}

export interface ThemeConfig {
  colors: {
    orange: string;
    orangeLight: string;
    orangeDark: string;
    amber: string;
    black: string;
    blackSoft: string;
    blackCard: string;
    purple: string;
    purpleLight: string;
    purpleDark: string;
    purpleMuted: string;
    cream: string;
    creamDark: string;
  };
  typography: {
    displayFont: string;
    bodyFont: string;
    baseFontSize: number;
    displayWeight: string;
    bodyWeight: string;
    letterSpacing: string;
    lineHeight: string;
  };
  backgrounds: {
    page: BackgroundConfig;
    navbar: BackgroundConfig;
    hero: BackgroundConfig;
    featured: BackgroundConfig;
    problem: BackgroundConfig;
    solution: BackgroundConfig;
    shop: BackgroundConfig;
    testimonials: BackgroundConfig;
    footer: BackgroundConfig;
  };
  highlights: {
    gradientFrom: string;
    gradientVia: string;
    gradientTo: string;
    gradientAngle: number;
    adinkraColor1: string;
    adinkraColor2: string;
    adinkraColor3: string;
    heroGlowColor1: string;
    heroGlowColor2: string;
    cardGlowColor1: string;
    cardGlowColor2: string;
    selectionBg: string;
    selectionText: string;
  };
  animations: {
    enabled: boolean;
    fadeUpDuration: number;
    fadeInDuration: number;
    floatDuration: number;
    marqueeSpeed: number;
    marqueeUpSpeed: number;
  };
  borderRadius: {
    buttons: string;
    cards: string;
    inputs: string;
    badges: string;
  };
}

function mkBg(color: string): BackgroundConfig {
  return {
    type: "solid",
    color,
    gradient: { from: "#E8621A", via: "#6B2D8B", to: "#F2A23C", angle: 135 },
    image: "",
    imageSize: "cover",
    overlayColor: "#000000",
    overlayOpacity: 0.4,
  };
}

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    orange: "#E8621A",
    orangeLight: "#F5874A",
    orangeDark: "#C44E0E",
    amber: "#F2A23C",
    black: "#0A0A0A",
    blackSoft: "#141414",
    blackCard: "#1A1A1A",
    purple: "#6B2D8B",
    purpleLight: "#8B4AAD",
    purpleDark: "#4A1D62",
    purpleMuted: "#2D1A3E",
    cream: "#FAF5EE",
    creamDark: "#F0E8DC",
  },
  typography: {
    displayFont: "Playfair Display",
    bodyFont: "DM Sans",
    baseFontSize: 16,
    displayWeight: "700",
    bodyWeight: "400",
    letterSpacing: "normal",
    lineHeight: "1.6",
  },
  backgrounds: {
    page: mkBg("#0A0A0A"),
    navbar: { ...mkBg("transparent"), type: "transparent" },
    hero: mkBg("#0A0A0A"),
    featured: mkBg("#0A0A0A"),
    problem: mkBg("#0A0A0A"),
    solution: mkBg("#141414"),
    shop: mkBg("#0A0A0A"),
    testimonials: mkBg("#141414"),
    footer: mkBg("#0A0A0A"),
  },
  highlights: {
    gradientFrom: "#F2A23C",
    gradientVia: "#E8621A",
    gradientTo: "#8B4AAD",
    gradientAngle: 135,
    adinkraColor1: "#6B2D8B",
    adinkraColor2: "#E8621A",
    adinkraColor3: "#F2A23C",
    heroGlowColor1: "rgba(232,98,26,0.12)",
    heroGlowColor2: "rgba(107,45,139,0.08)",
    cardGlowColor1: "rgba(232,98,26,0.15)",
    cardGlowColor2: "rgba(107,45,139,0.08)",
    selectionBg: "#E8621A",
    selectionText: "#FAF5EE",
  },
  animations: {
    enabled: true,
    fadeUpDuration: 0.7,
    fadeInDuration: 1.0,
    floatDuration: 6.0,
    marqueeSpeed: 60,
    marqueeUpSpeed: 40,
  },
  borderRadius: {
    buttons: "0.75",
    cards: "1",
    inputs: "0.5",
    badges: "9999",
  },
};

function deepMerge<T>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults };
  for (const key in overrides) {
    const val = overrides[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      (result as Record<string, unknown>)[key] = deepMerge(
        (defaults as Record<string, unknown>)[key] as object,
        val as Partial<object>
      );
    } else if (val !== undefined) {
      (result as Record<string, unknown>)[key] = val;
    }
  }
  return result;
}

function safeRead(key: string): ThemeConfig {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_THEME;
    return deepMerge(DEFAULT_THEME, JSON.parse(raw) as Partial<ThemeConfig>);
  } catch {
    return DEFAULT_THEME;
  }
}

function safeWrite(key: string, theme: ThemeConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(theme));
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function getPublishedTheme(): ThemeConfig {
  return safeRead(PUBLISHED_KEY);
}

export function getDraftTheme(): ThemeConfig {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return getPublishedTheme();
    return deepMerge(DEFAULT_THEME, JSON.parse(raw) as Partial<ThemeConfig>);
  } catch {
    return getPublishedTheme();
  }
}

export function saveDraft(theme: ThemeConfig) {
  safeWrite(DRAFT_KEY, theme);
}

export function publishTheme(theme: ThemeConfig) {
  safeWrite(PUBLISHED_KEY, theme);
  safeWrite(DRAFT_KEY, theme);
}

export function discardThemeDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function resetThemeToDefault() {
  safeWrite(PUBLISHED_KEY, DEFAULT_THEME);
  safeWrite(DRAFT_KEY, DEFAULT_THEME);
}

export function hasDraftTheme(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    const published = localStorage.getItem(PUBLISHED_KEY);
    return draft !== null && draft !== published;
  } catch {
    return false;
  }
}

export function onThemeChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(THEME_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
