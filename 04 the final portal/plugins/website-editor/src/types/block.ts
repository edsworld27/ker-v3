// Block — leaf unit of an EditorPage tree. Faithful copy of
// `02 felicias aqua portal work/src/components/editor/types.ts` (or
// embedded in blockRegistry.ts there).
//
// `type` is an open string so plugins (commerce, blog, etc.) can extend
// the registry. The website-editor plugin contributes the canonical 58
// types; their values are aliased in `BlockType` for in-tree references.

export interface Block {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: Block[];
  // Optional split-test metadata. Resolved by `variantResolver.ts`.
  variants?: BlockVariant[];
  // Optional theme + style overrides applied per-block.
  styleOverrides?: Record<string, string | number>;
  responsive?: Record<"sm" | "md" | "lg" | "xl", Record<string, string | number>>;
  animation?: BlockAnimation;
  visibility?: BlockVisibility;
}

export interface BlockVariant {
  id: string;
  name: string;
  weight?: number;
  props?: Record<string, unknown>;
  children?: Block[];
}

export interface BlockAnimation {
  kind: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "none";
  delayMs?: number;
  durationMs?: number;
}

export interface BlockVisibility {
  hidden?: boolean;
  hiddenOnMobile?: boolean;
  hiddenOnDesktop?: boolean;
  showAfterLogin?: boolean;
  hideAfterLogin?: boolean;
  requiresFeature?: string;
}

// Convenience aliases — the canonical 58 block types contributed by the
// website-editor plugin. Open string remains valid.
export type BlockType =
  // layout
  | "container" | "section" | "row" | "column" | "grid" | "spacer" | "divider"
  // content
  | "heading" | "text" | "button" | "hero" | "cta" | "testimonials"
  | "pricing-table" | "faq" | "quote" | "banner" | "author-bio" | "stats-bar"
  | "logo-grid" | "feature-grid" | "tabs" | "accordion" | "card-grid"
  | "footer" | "navbar" | "timeline" | "form" | "contact-form"
  // media
  | "image" | "video" | "icon" | "gallery" | "map" | "before-after" | "marquee"
  // commerce
  | "product-card" | "product-grid" | "collection-grid" | "cart-summary"
  | "checkout-summary" | "payment-button" | "order-success" | "variant-picker"
  | "product-search" | "donation-button" | "booking-widget"
  // auth
  | "login-form" | "signup-form" | "theme-selector" | "social-auth" | "member-gate"
  // advanced
  | "html" | "countdown-timer" | "language-switcher" | "newsletter-signup"
  | "app-showcase" | "social-proof-bar"
  // open extension
  | (string & {});

export type BlockTreeJSON = Block[];
