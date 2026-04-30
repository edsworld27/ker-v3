"use client";

import { useEffect, useRef } from "react";
import {
  getPublishedTheme,
  getDraftTheme,
  onThemeChange,
  type ThemeConfig,
  type BackgroundConfig,
} from "@/lib/admin/theme";
import { isPreviewMode } from "@/lib/admin/content";

const LETTER_SPACING: Record<string, string> = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
};

export function computeBackground(bg: BackgroundConfig): string {
  if (bg.type === "transparent") return "transparent";
  if (bg.type === "solid") return bg.color;
  if (bg.type === "gradient") {
    const { from, via, to, angle } = bg.gradient;
    if (via) return `linear-gradient(${angle}deg, ${from}, ${via}, ${to})`;
    return `linear-gradient(${angle}deg, ${from}, ${to})`;
  }
  if (bg.type === "image" && bg.image) {
    if (bg.overlayOpacity > 0) {
      const alpha = Math.round(bg.overlayOpacity * 255)
        .toString(16)
        .padStart(2, "0");
      return `linear-gradient(${bg.overlayColor}${alpha}, ${bg.overlayColor}${alpha}), url('${bg.image}')`;
    }
    return `url('${bg.image}')`;
  }
  return bg.color;
}

function buildCSS(theme: ThemeConfig): string {
  const { colors, typography, backgrounds, highlights, animations, borderRadius } = theme;

  const ls = LETTER_SPACING[typography.letterSpacing] ?? "0em";

  const sectionBgs: string[] = [];
  const sectionMap: Array<[string, string]> = [
    ["hero", "section#story"],
    ["featured", "section#featured"],
    ["problem", "section#our-philosophy"],
    ["solution", "section#heritage"],
    ["shop", "section#shop"],
    ["testimonials", "section#testimonials"],
  ];

  for (const [key, selector] of sectionMap) {
    const bg = backgrounds[key as keyof typeof backgrounds];
    if (!bg || bg.type === "transparent") continue;
    const computed = computeBackground(bg);
    sectionBgs.push(`${selector} { background: ${computed} !important; }`);
    if (bg.type === "image") {
      sectionBgs.push(
        `${selector} { background-size: ${bg.imageSize} !important; background-position: center !important; background-repeat: ${bg.imageSize === "repeat" ? "repeat" : "no-repeat"} !important; }`
      );
    }
  }

  const navBg =
    backgrounds.navbar.type !== "transparent"
      ? `nav[data-navbar] { background: ${computeBackground(backgrounds.navbar)} !important; }`
      : "";

  const footerBg = `footer { background: ${computeBackground(backgrounds.footer)} !important; }`;

  const animEnabled = animations.enabled;

  return `
:root {
  --color-brand-orange: ${colors.orange};
  --color-brand-orange-light: ${colors.orangeLight};
  --color-brand-orange-dark: ${colors.orangeDark};
  --color-brand-amber: ${colors.amber};
  --color-brand-black: ${colors.black};
  --color-brand-black-soft: ${colors.blackSoft};
  --color-brand-black-card: ${colors.blackCard};
  --color-brand-purple: ${colors.purple};
  --color-brand-purple-light: ${colors.purpleLight};
  --color-brand-purple-dark: ${colors.purpleDark};
  --color-brand-purple-muted: ${colors.purpleMuted};
  --color-brand-cream: ${colors.cream};
  --color-brand-cream-dark: ${colors.creamDark};
  --font-display: "${typography.displayFont}", Georgia, serif;
  --font-body: "${typography.bodyFont}", system-ui, sans-serif;
  --theme-radius-buttons: ${borderRadius.buttons}rem;
  --theme-radius-cards: ${borderRadius.cards}rem;
  --theme-radius-inputs: ${borderRadius.inputs}rem;
  --theme-radius-badges: ${borderRadius.badges === "9999" ? "9999px" : borderRadius.badges + "rem"};
}

body {
  background: ${computeBackground(backgrounds.page)};
  font-size: ${typography.baseFontSize}px;
  letter-spacing: ${ls};
  line-height: ${typography.lineHeight};
  font-family: "${typography.bodyFont}", system-ui, sans-serif;
  font-weight: ${typography.bodyWeight};
}

h1, h2, h3, h4, h5, h6, [class*="font-display"] {
  font-family: "${typography.displayFont}", Georgia, serif;
  font-weight: ${typography.displayWeight};
}

.gradient-text {
  background: linear-gradient(${highlights.gradientAngle}deg, ${highlights.gradientFrom} 0%, ${highlights.gradientVia} 50%, ${highlights.gradientTo} 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.adinkra-line {
  background: linear-gradient(90deg, transparent, ${highlights.adinkraColor1}, ${highlights.adinkraColor2}, ${highlights.adinkraColor3}, transparent) !important;
}

.hero-glow {
  background: radial-gradient(ellipse at 60% 50%, ${highlights.heroGlowColor1} 0%, ${highlights.heroGlowColor2} 40%, transparent 70%) !important;
}

.card-glow:hover {
  box-shadow: 0 0 40px ${highlights.cardGlowColor1}, 0 0 80px ${highlights.cardGlowColor2} !important;
}

::selection {
  background-color: ${highlights.selectionBg};
  color: ${highlights.selectionText};
}

${animEnabled ? `
.animate-fade-up { animation-duration: ${animations.fadeUpDuration}s !important; }
.animate-fade-in { animation-duration: ${animations.fadeInDuration}s !important; }
.animate-float { animation-duration: ${animations.floatDuration}s !important; }
.marquee-left { animation-duration: ${animations.marqueeSpeed}s !important; }
.marquee-right { animation-duration: ${animations.marqueeSpeed}s !important; }
.marquee-up { animation-duration: ${animations.marqueeUpSpeed}s !important; }
` : `
.animate-fade-up, .animate-fade-in, .animate-float {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
}
`}

${navBg}
${footerBg}
${sectionBgs.join("\n")}
`.trim();
}

function buildFontUrl(theme: ThemeConfig): string {
  const fonts = Array.from(
    new Set([theme.typography.displayFont, theme.typography.bodyFont])
  )
    .filter(Boolean)
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${fonts}&display=swap`;
}

export default function ThemeInjector() {
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const linkRef = useRef<HTMLLinkElement | null>(null);

  function apply() {
    const theme = isPreviewMode() ? getDraftTheme() : getPublishedTheme();

    if (!styleRef.current) {
      const existing = document.getElementById("lk-theme-css");
      if (existing) {
        styleRef.current = existing as HTMLStyleElement;
      } else {
        const el = document.createElement("style");
        el.id = "lk-theme-css";
        document.head.appendChild(el);
        styleRef.current = el;
      }
    }
    styleRef.current.textContent = buildCSS(theme);

    const fontUrl = buildFontUrl(theme);
    if (!linkRef.current) {
      const existing = document.getElementById("lk-theme-fonts");
      if (existing) {
        linkRef.current = existing as HTMLLinkElement;
      } else {
        const el = document.createElement("link");
        el.id = "lk-theme-fonts";
        el.rel = "stylesheet";
        document.head.appendChild(el);
        linkRef.current = el;
      }
    }
    if (linkRef.current.href !== fontUrl) linkRef.current.href = fontUrl;
  }

  useEffect(() => {
    apply();
    return onThemeChange(apply);
  }, []);

  return null;
}
