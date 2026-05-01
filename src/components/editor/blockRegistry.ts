// Block registry for the visual editor (V-B).
//
// Maps each BlockType to:
//   - the React component that renders it
//   - the default props for newly inserted blocks
//   - a property-panel schema (which fields the editor should expose)
//   - an icon + label for the block library sidebar
//
// New block types: add the type to BlockType in src/portal/server/types.ts,
// add the component file under ./blocks/, and append a registry entry here.

import type { ComponentType } from "react";
import type { Block, BlockType } from "@/portal/server/types";
import ContainerBlock from "./blocks/ContainerBlock";
import SectionBlock from "./blocks/SectionBlock";
import RowBlock from "./blocks/RowBlock";
import ColumnBlock from "./blocks/ColumnBlock";
import GridBlock from "./blocks/GridBlock";
import SpacerBlock from "./blocks/SpacerBlock";
import DividerBlock from "./blocks/DividerBlock";
import HeadingBlock from "./blocks/HeadingBlock";
import TextBlock from "./blocks/TextBlock";
import ImageBlock from "./blocks/ImageBlock";
import ButtonBlock from "./blocks/ButtonBlock";
import VideoBlock from "./blocks/VideoBlock";
import IconBlock from "./blocks/IconBlock";
import HtmlBlock from "./blocks/HtmlBlock";
import HeroBlock from "./blocks/HeroBlock";
import CtaBlock from "./blocks/CtaBlock";
import TestimonialsBlock from "./blocks/TestimonialsBlock";
import NavbarBlock from "./blocks/NavbarBlock";
import FooterBlock from "./blocks/FooterBlock";
import FormBlock from "./blocks/FormBlock";
import ProductCardBlock from "./blocks/ProductCardBlock";
import ProductGridBlock from "./blocks/ProductGridBlock";
import CollectionGridBlock from "./blocks/CollectionGridBlock";
import CartSummaryBlock from "./blocks/CartSummaryBlock";
import CheckoutSummaryBlock from "./blocks/CheckoutSummaryBlock";
import PaymentButtonBlock from "./blocks/PaymentButtonBlock";
import OrderSuccessBlock from "./blocks/OrderSuccessBlock";
import VariantPickerBlock from "./blocks/VariantPickerBlock";
import ProductSearchBlock from "./blocks/ProductSearchBlock";
import LoginFormBlock from "./blocks/LoginFormBlock";
import SignupFormBlock from "./blocks/SignupFormBlock";
import ThemeSelectorBlock from "./blocks/ThemeSelectorBlock";
import SocialAuthBlock from "./blocks/SocialAuthBlock";
import PricingTableBlock from "./blocks/PricingTableBlock";
import FaqBlock from "./blocks/FaqBlock";
import ContactFormBlock from "./blocks/ContactFormBlock";
import StatsBarBlock from "./blocks/StatsBarBlock";
import LogoGridBlock from "./blocks/LogoGridBlock";
import FeatureGridBlock from "./blocks/FeatureGridBlock";
import NewsletterSignupBlock from "./blocks/NewsletterSignupBlock";
import CountdownTimerBlock from "./blocks/CountdownTimerBlock";
import LanguageSwitcherBlock from "./blocks/LanguageSwitcherBlock";
import GalleryBlock from "./blocks/GalleryBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import MapBlock from "./blocks/MapBlock";
import BannerBlock from "./blocks/BannerBlock";
import AuthorBioBlock from "./blocks/AuthorBioBlock";
import MemberGateBlock from "./blocks/MemberGateBlock";
import DonationButtonBlock from "./blocks/DonationButtonBlock";

export interface BlockRenderProps {
  block: Block;
  // The renderer doesn't know about React state at the block level —
  // children are rendered by the registry recursively. The optional
  // editorMode flag lets blocks render placeholders for empty containers
  // so the canvas isn't a wall of zero-height boxes.
  editorMode?: boolean;
  renderChildren?: (children: Block[] | undefined) => React.ReactNode;
}

export type PropFieldType =
  | "text" | "textarea" | "url" | "color" | "select" | "number" | "boolean" | "image" | "richtext";

export interface PropField {
  key: string;
  label: string;
  type: PropFieldType;
  default?: unknown;
  options?: Array<{ value: string; label: string }>;  // for "select"
  placeholder?: string;
  help?: string;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: "layout" | "content" | "media" | "commerce" | "advanced";
  isContainer: boolean;
  Component: ComponentType<BlockRenderProps>;
  defaultProps: Record<string, unknown>;
  defaultChildren?: Block[];
  fields: PropField[];                  // properties panel schema
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  // ── Layout ─────────────────────────────────────────────────────────────
  container: {
    type: "container",
    label: "Container",
    icon: "▭",
    category: "layout",
    isContainer: true,
    Component: ContainerBlock,
    defaultProps: {},
    fields: [],
  },
  section: {
    type: "section",
    label: "Section",
    icon: "⫷⫸",
    category: "layout",
    isContainer: true,
    Component: SectionBlock,
    defaultProps: { fullWidth: false },
    fields: [
      { key: "fullWidth", label: "Full-bleed background", type: "boolean", default: false },
    ],
  },
  row: {
    type: "row",
    label: "Row",
    icon: "▤",
    category: "layout",
    isContainer: true,
    Component: RowBlock,
    defaultProps: { gap: "16px" },
    fields: [
      { key: "gap", label: "Gap", type: "text", default: "16px" },
    ],
  },
  column: {
    type: "column",
    label: "Column",
    icon: "▥",
    category: "layout",
    isContainer: true,
    Component: ColumnBlock,
    defaultProps: { gap: "12px" },
    fields: [
      { key: "gap", label: "Gap", type: "text", default: "12px" },
    ],
  },
  grid: {
    type: "grid",
    label: "Grid",
    icon: "▦",
    category: "layout",
    isContainer: true,
    Component: GridBlock,
    defaultProps: { columns: 3, gap: "24px" },
    fields: [
      { key: "columns", label: "Columns", type: "number", default: 3 },
      { key: "gap", label: "Gap", type: "text", default: "24px" },
    ],
  },
  spacer: {
    type: "spacer",
    label: "Spacer",
    icon: "↕",
    category: "layout",
    isContainer: false,
    Component: SpacerBlock,
    defaultProps: { height: "32px" },
    fields: [
      { key: "height", label: "Height", type: "text", default: "32px" },
    ],
  },
  divider: {
    type: "divider",
    label: "Divider",
    icon: "—",
    category: "layout",
    isContainer: false,
    Component: DividerBlock,
    defaultProps: { color: "rgba(255,255,255,0.1)" },
    fields: [
      { key: "color", label: "Colour", type: "color", default: "#1a1a1a" },
    ],
  },
  // ── Content ────────────────────────────────────────────────────────────
  heading: {
    type: "heading",
    label: "Heading",
    icon: "H",
    category: "content",
    isContainer: false,
    Component: HeadingBlock,
    defaultProps: { text: "Your headline", level: 2 },
    fields: [
      { key: "text", label: "Text", type: "text", default: "Your headline" },
      { key: "level", label: "Level", type: "select", default: 2, options: [
        { value: "1", label: "H1" }, { value: "2", label: "H2" }, { value: "3", label: "H3" },
        { value: "4", label: "H4" }, { value: "5", label: "H5" }, { value: "6", label: "H6" },
      ] },
    ],
  },
  text: {
    type: "text",
    label: "Text",
    icon: "T",
    category: "content",
    isContainer: false,
    Component: TextBlock,
    defaultProps: { text: "Add your copy here. Click to edit." },
    fields: [
      { key: "text", label: "Text", type: "richtext", default: "Add your copy here." },
    ],
  },
  image: {
    type: "image",
    label: "Image",
    icon: "🖼",
    category: "media",
    isContainer: false,
    Component: ImageBlock,
    defaultProps: { src: "", alt: "", width: "100%", filenameForSeo: true },
    fields: [
      { key: "src", label: "Image URL", type: "image", default: "" },
      { key: "alt", label: "Alt text", type: "text", default: "", help: "Describes the image for screen readers + search engines" },
      { key: "title", label: "Title (hover tooltip)", type: "text", default: "" },
      { key: "width", label: "Width", type: "text", default: "100%" },
      { key: "href", label: "Link URL (optional)", type: "url", default: "" },
      { key: "filenameForSeo", label: "Use filename as fallback alt", type: "boolean", default: true, help: "When alt is empty, derives one from the image filename — bonus SEO" },
    ],
  },
  button: {
    type: "button",
    label: "Button",
    icon: "▶",
    category: "content",
    isContainer: false,
    Component: ButtonBlock,
    defaultProps: { label: "Click me", href: "#", variant: "primary", hoverAnim: "lift" },
    fields: [
      { key: "label", label: "Label", type: "text", default: "Click me" },
      { key: "href", label: "URL", type: "url", default: "#" },
      { key: "variant", label: "Style", type: "select", default: "primary", options: [
        { value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "ghost", label: "Ghost" },
      ] },
      { key: "hoverAnim", label: "Hover effect", type: "select", default: "lift", options: [
        { value: "none",   label: "None" },
        { value: "lift",   label: "Lift" },
        { value: "glow",   label: "Glow" },
        { value: "shrink", label: "Shrink" },
        { value: "shine",  label: "Shine" },
        { value: "wiggle", label: "Wiggle" },
      ] },
    ],
  },
  video: {
    type: "video",
    label: "Video",
    icon: "▶︎",
    category: "media",
    isContainer: false,
    Component: VideoBlock,
    defaultProps: { src: "", autoplay: false, controls: true },
    fields: [
      { key: "src", label: "Video URL (mp4 or YouTube)", type: "url", default: "" },
      { key: "autoplay", label: "Autoplay", type: "boolean", default: false },
      { key: "controls", label: "Show controls", type: "boolean", default: true },
    ],
  },
  icon: {
    type: "icon",
    label: "Icon",
    icon: "✦",
    category: "content",
    isContainer: false,
    Component: IconBlock,
    defaultProps: { glyph: "✦", size: "32px", color: "#ff6b35" },
    fields: [
      { key: "glyph", label: "Icon character", type: "text", default: "✦" },
      { key: "size", label: "Size", type: "text", default: "32px" },
      { key: "color", label: "Colour", type: "color", default: "#ff6b35" },
    ],
  },
  html: {
    type: "html",
    label: "Custom HTML",
    icon: "</>",
    category: "advanced",
    isContainer: false,
    Component: HtmlBlock,
    defaultProps: { html: "<p>Custom HTML here</p>" },
    fields: [
      { key: "html", label: "HTML", type: "textarea", default: "<p>Custom HTML</p>" },
    ],
  },
  // ── Composite ──────────────────────────────────────────────────────────
  hero: {
    type: "hero",
    label: "Hero",
    icon: "★",
    category: "content",
    isContainer: false,
    Component: HeroBlock,
    defaultProps: {
      eyebrow: "Welcome",
      headline: "Build something beautiful",
      subhead: "A short tagline that explains the value proposition.",
      ctaLabel: "Get started",
      ctaHref: "#",
      backgroundImage: "",
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", default: "Welcome" },
      { key: "headline", label: "Headline", type: "text", default: "Build something beautiful" },
      { key: "subhead", label: "Sub-headline", type: "textarea", default: "A short tagline." },
      { key: "ctaLabel", label: "CTA label", type: "text", default: "Get started" },
      { key: "ctaHref", label: "CTA URL", type: "url", default: "#" },
      { key: "backgroundImage", label: "Background image URL", type: "image", default: "" },
    ],
  },
  cta: {
    type: "cta",
    label: "CTA banner",
    icon: "❯",
    category: "content",
    isContainer: false,
    Component: CtaBlock,
    defaultProps: { headline: "Ready to start?", ctaLabel: "Sign up", ctaHref: "#" },
    fields: [
      { key: "headline", label: "Headline", type: "text", default: "Ready to start?" },
      { key: "subhead", label: "Sub-headline", type: "text", default: "" },
      { key: "ctaLabel", label: "CTA label", type: "text", default: "Sign up" },
      { key: "ctaHref", label: "CTA URL", type: "url", default: "#" },
    ],
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    icon: "❝",
    category: "content",
    isContainer: false,
    Component: TestimonialsBlock,
    defaultProps: {
      title: "Loved by founders",
      items: [
        { quote: "This is the future.", author: "Felicia", role: "Founder, Odo" },
        { quote: "Shipped our portal in a day.", author: "Ed", role: "CTO" },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text", default: "Loved by founders" },
    ],
  },
  navbar: {
    type: "navbar",
    label: "Navbar",
    icon: "≡",
    category: "content",
    isContainer: false,
    Component: NavbarBlock,
    defaultProps: {
      brand: "Brand",
      links: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Shop", href: "/shop" },
      ],
      ctaLabel: "Sign in",
      ctaHref: "/account",
    },
    fields: [
      { key: "brand", label: "Brand name", type: "text", default: "Brand" },
      { key: "ctaLabel", label: "CTA label", type: "text", default: "Sign in" },
      { key: "ctaHref", label: "CTA URL", type: "url", default: "/account" },
    ],
  },
  footer: {
    type: "footer",
    label: "Footer",
    icon: "⌐",
    category: "content",
    isContainer: false,
    Component: FooterBlock,
    defaultProps: {
      brand: "Brand",
      tagline: "Crafted with care.",
      columns: [
        { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
        { title: "Products", links: [{ label: "Shop", href: "/shop" }, { label: "Catalog", href: "/catalog" }] },
      ],
    },
    fields: [
      { key: "brand", label: "Brand name", type: "text", default: "Brand" },
      { key: "tagline", label: "Tagline", type: "text", default: "Crafted with care." },
    ],
  },
  form: {
    type: "form",
    label: "Form",
    icon: "▤",
    category: "content",
    isContainer: false,
    Component: FormBlock,
    defaultProps: {
      title: "Get in touch",
      action: "/api/contact",
      fields: [
        { name: "email", label: "Email", type: "email", required: true },
        { name: "message", label: "Message", type: "textarea", required: true },
      ],
      submitLabel: "Send",
    },
    fields: [
      { key: "title", label: "Title", type: "text", default: "Get in touch" },
      { key: "action", label: "Submit URL", type: "url", default: "/api/contact" },
      { key: "submitLabel", label: "Submit label", type: "text", default: "Send" },
    ],
  },
  // ── Commerce ───────────────────────────────────────────────────────────
  "product-card": {
    type: "product-card",
    label: "Product card",
    icon: "🛍",
    category: "commerce",
    isContainer: false,
    Component: ProductCardBlock,
    defaultProps: {
      productHandle: "",
      title: "Product name",
      price: "£0.00",
      image: "",
      ctaLabel: "Add to cart",
    },
    fields: [
      { key: "productHandle", label: "Product handle", type: "text", default: "", help: "Used at runtime to fetch live data" },
      { key: "title", label: "Title (preview)", type: "text", default: "Product name" },
      { key: "price", label: "Price (preview)", type: "text", default: "£0.00" },
      { key: "image", label: "Image URL (preview)", type: "image", default: "" },
      { key: "ctaLabel", label: "CTA label", type: "text", default: "Add to cart" },
    ],
  },
  "product-grid": {
    type: "product-grid",
    label: "Product grid",
    icon: "▦",
    category: "commerce",
    isContainer: false,
    Component: ProductGridBlock,
    defaultProps: { collectionHandle: "all", columns: 3, limit: 9 },
    fields: [
      { key: "collectionHandle", label: "Collection handle", type: "text", default: "all" },
      { key: "columns", label: "Columns", type: "number", default: 3 },
      { key: "limit", label: "Max items", type: "number", default: 9 },
    ],
  },
  "collection-grid": {
    type: "collection-grid",
    label: "Collection grid",
    icon: "▦",
    category: "commerce",
    isContainer: false,
    Component: CollectionGridBlock,
    defaultProps: { showFilters: true, sortKey: "title" },
    fields: [
      { key: "showFilters", label: "Show filter sidebar", type: "boolean", default: true },
      { key: "sortKey", label: "Default sort", type: "select", default: "title", options: [
        { value: "title", label: "Title" }, { value: "price", label: "Price" }, { value: "newest", label: "Newest" },
      ] },
    ],
  },
  "cart-summary": {
    type: "cart-summary",
    label: "Cart summary",
    icon: "🛒",
    category: "commerce",
    isContainer: false,
    Component: CartSummaryBlock,
    defaultProps: { showThumbnails: true, showQuantitySelector: true },
    fields: [
      { key: "showThumbnails", label: "Show thumbnails", type: "boolean", default: true },
      { key: "showQuantitySelector", label: "Quantity controls", type: "boolean", default: true },
    ],
  },
  "checkout-summary": {
    type: "checkout-summary",
    label: "Checkout summary",
    icon: "➔",
    category: "commerce",
    isContainer: false,
    Component: CheckoutSummaryBlock,
    defaultProps: { showLineItems: true, showShipping: true, showTax: true },
    fields: [
      { key: "showLineItems", label: "Show line items", type: "boolean", default: true },
      { key: "showShipping", label: "Show shipping", type: "boolean", default: true },
      { key: "showTax", label: "Show tax", type: "boolean", default: true },
    ],
  },
  "payment-button": {
    type: "payment-button",
    label: "Payment button",
    icon: "💳",
    category: "commerce",
    isContainer: false,
    Component: PaymentButtonBlock,
    defaultProps: { label: "Pay now", provider: "stripe" },
    fields: [
      { key: "label", label: "Label", type: "text", default: "Pay now" },
      { key: "provider", label: "Provider", type: "select", default: "stripe", options: [
        { value: "stripe", label: "Stripe" }, { value: "paypal", label: "PayPal" }, { value: "applepay", label: "Apple Pay" },
      ] },
    ],
  },
  "product-search": {
    type: "product-search",
    label: "Product search",
    icon: "🔍",
    category: "commerce",
    isContainer: false,
    Component: ProductSearchBlock,
    defaultProps: { placeholder: "Search products…", showPlaceholder: true },
    fields: [
      { key: "placeholder", label: "Placeholder", type: "text", default: "Search products…" },
      { key: "showPlaceholder", label: "Show placeholder", type: "boolean", default: true },
    ],
  },
  "login-form": {
    type: "login-form",
    label: "Login form",
    icon: "🔑",
    category: "content",
    isContainer: false,
    Component: LoginFormBlock,
    defaultProps: { title: "Sign in", action: "/api/auth/login", submitLabel: "Sign in", showRemember: true, showForgot: true, showSignupLink: true, signupHref: "/signup", forgotHref: "/account/forgot-password" },
    fields: [
      { key: "title",         label: "Title",          type: "text",     default: "Sign in" },
      { key: "subtitle",      label: "Subtitle",       type: "text",     default: "" },
      { key: "action",        label: "Submit URL",     type: "url",      default: "/api/auth/login" },
      { key: "submitLabel",   label: "Submit label",   type: "text",     default: "Sign in" },
      { key: "showRemember",  label: "Show remember",  type: "boolean",  default: true },
      { key: "showForgot",    label: "Show forgot link", type: "boolean", default: true },
      { key: "forgotHref",    label: "Forgot URL",     type: "url",      default: "/account/forgot-password" },
      { key: "showSignupLink",label: "Show sign-up link", type: "boolean", default: true },
      { key: "signupHref",    label: "Sign-up URL",    type: "url",      default: "/signup" },
    ],
  },
  "signup-form": {
    type: "signup-form",
    label: "Sign-up form",
    icon: "✏",
    category: "content",
    isContainer: false,
    Component: SignupFormBlock,
    defaultProps: { title: "Create your account", action: "/api/auth/signup", submitLabel: "Create account", showName: true, requireTerms: false, termsHref: "/terms", showLoginLink: true, loginHref: "/login" },
    fields: [
      { key: "title",         label: "Title",          type: "text",     default: "Create your account" },
      { key: "action",        label: "Submit URL",     type: "url",      default: "/api/auth/signup" },
      { key: "submitLabel",   label: "Submit label",   type: "text",     default: "Create account" },
      { key: "showName",      label: "Show name field", type: "boolean", default: true },
      { key: "requireTerms",  label: "Require terms checkbox", type: "boolean", default: false },
      { key: "termsHref",     label: "Terms URL",      type: "url",      default: "/terms" },
      { key: "showLoginLink", label: "Show login link", type: "boolean", default: true },
      { key: "loginHref",     label: "Login URL",      type: "url",      default: "/login" },
    ],
  },
  "theme-selector": {
    type: "theme-selector",
    label: "Theme selector",
    icon: "🎨",
    category: "content",
    isContainer: false,
    Component: ThemeSelectorBlock,
    defaultProps: { label: "Theme", variant: "select" },
    fields: [
      { key: "label",   label: "Label",  type: "text",   default: "Theme" },
      { key: "variant", label: "Variant", type: "select", default: "select", options: [
        { value: "select",  label: "Dropdown" },
        { value: "buttons", label: "Pill buttons" },
      ] },
    ],
  },
  "social-auth": {
    type: "social-auth",
    label: "Social auth buttons",
    icon: "🔐",
    category: "content",
    isContainer: false,
    Component: SocialAuthBlock,
    defaultProps: { enabled: ["google", "github"], baseUrl: "/api/auth", showDivider: true, dividerLabel: "or" },
    fields: [
      { key: "baseUrl",       label: "Base URL",       type: "url",     default: "/api/auth", help: "Each button links to {baseUrl}/{provider}." },
      { key: "showDivider",   label: "Show divider",   type: "boolean", default: true },
      { key: "dividerLabel",  label: "Divider label",  type: "text",    default: "or" },
    ],
  },
  "variant-picker": {
    type: "variant-picker",
    label: "Variant picker",
    icon: "🎨",
    category: "commerce",
    isContainer: false,
    Component: VariantPickerBlock,
    defaultProps: { productHandle: "", showPrice: true, showCta: true, ctaLabel: "Add to cart" },
    fields: [
      { key: "productHandle", label: "Product handle", type: "text", default: "" },
      { key: "showPrice", label: "Show price", type: "boolean", default: true },
      { key: "showCta", label: "Show add-to-cart button", type: "boolean", default: true },
      { key: "ctaLabel", label: "CTA label", type: "text", default: "Add to cart" },
    ],
  },
  "order-success": {
    type: "order-success",
    label: "Order success",
    icon: "✓",
    category: "commerce",
    isContainer: false,
    Component: OrderSuccessBlock,
    defaultProps: {
      headline: "Thanks for your order!",
      subhead: "We've sent a receipt to your email. Your order will ship soon.",
      ctaLabel: "Continue shopping",
      ctaHref: "/shop",
    },
    fields: [
      { key: "headline", label: "Headline", type: "text", default: "Thanks for your order!" },
      { key: "subhead", label: "Sub-headline", type: "textarea", default: "" },
      { key: "ctaLabel", label: "CTA label", type: "text", default: "Continue shopping" },
      { key: "ctaHref", label: "CTA URL", type: "url", default: "/shop" },
    ],
  },

  // ── Marketing / content (added with the plugin platform) ───────────────
  "pricing-table": {
    type: "pricing-table",
    label: "Pricing table",
    icon: "💲",
    category: "content",
    isContainer: false,
    Component: PricingTableBlock,
    defaultProps: {
      heading: "Simple, honest pricing",
      subheading: "Pick the plan that fits.",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Sub-heading", type: "textarea" },
    ],
  },
  "faq": {
    type: "faq",
    label: "FAQ",
    icon: "?",
    category: "content",
    isContainer: false,
    Component: FaqBlock,
    defaultProps: { heading: "Frequently asked" },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
    ],
  },
  "contact-form": {
    type: "contact-form",
    label: "Contact form",
    icon: "✉",
    category: "content",
    isContainer: false,
    Component: ContactFormBlock,
    defaultProps: {
      heading: "Get in touch",
      subheading: "We'll get back to you within 1 business day.",
      submitLabel: "Send message",
      showPhone: true,
      formName: "contact",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Sub-heading", type: "textarea" },
      { key: "submitLabel", label: "Submit label", type: "text" },
      { key: "showPhone", label: "Show phone field", type: "boolean" },
      { key: "formName", label: "Form name (admin)", type: "text" },
    ],
  },
  "stats-bar": {
    type: "stats-bar",
    label: "Stats bar",
    icon: "📊",
    category: "content",
    isContainer: false,
    Component: StatsBarBlock,
    defaultProps: {},
    fields: [],
  },
  "logo-grid": {
    type: "logo-grid",
    label: "Logo grid",
    icon: "▦",
    category: "content",
    isContainer: false,
    Component: LogoGridBlock,
    defaultProps: { heading: "As featured in", logos: [] },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
    ],
  },
  "feature-grid": {
    type: "feature-grid",
    label: "Feature grid",
    icon: "▥",
    category: "content",
    isContainer: false,
    Component: FeatureGridBlock,
    defaultProps: {
      heading: "What's included",
      columns: 3,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Sub-heading", type: "textarea" },
      { key: "columns", label: "Columns", type: "number", default: 3 },
    ],
  },
  "newsletter-signup": {
    type: "newsletter-signup",
    label: "Newsletter signup",
    icon: "📧",
    category: "content",
    isContainer: false,
    Component: NewsletterSignupBlock,
    defaultProps: {
      heading: "Stay in the loop",
      subheading: "One email a month. New launches, no spam.",
      submitLabel: "Subscribe",
      successMessage: "You're in. Welcome!",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Sub-heading", type: "textarea" },
      { key: "submitLabel", label: "Submit label", type: "text" },
      { key: "successMessage", label: "Success message", type: "text" },
    ],
  },
  "countdown-timer": {
    type: "countdown-timer",
    label: "Countdown timer",
    icon: "⏱",
    category: "content",
    isContainer: false,
    Component: CountdownTimerBlock,
    defaultProps: {
      heading: "Sale ends in",
      target: "+7d",
      expiredText: "Sale has ended.",
      showSeconds: true,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "target", label: "Target (ISO date or +Nd/+Nh/+Nm)", type: "text", placeholder: "+7d" },
      { key: "expiredText", label: "Expired text", type: "text" },
      { key: "showSeconds", label: "Show seconds", type: "boolean" },
    ],
  },
  "language-switcher": {
    type: "language-switcher",
    label: "Language switcher",
    icon: "🌐",
    category: "content",
    isContainer: false,
    Component: LanguageSwitcherBlock,
    defaultProps: {
      variant: "dropdown",
      enabledLocales: "en,fr,es",
    },
    fields: [
      { key: "variant", label: "Variant", type: "select", default: "dropdown",
        options: [{ value: "dropdown", label: "Dropdown" }, { value: "pills", label: "Pills" }] },
      { key: "enabledLocales", label: "Enabled locales (csv)", type: "text" },
    ],
  },
  "gallery": {
    type: "gallery",
    label: "Gallery",
    icon: "🖼",
    category: "media",
    isContainer: false,
    Component: GalleryBlock,
    defaultProps: { columns: 3, gap: 12, lightbox: true, photos: [] },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "columns", label: "Columns", type: "number", default: 3 },
      { key: "gap",     label: "Gap (px)", type: "number", default: 12 },
      { key: "lightbox", label: "Lightbox on click", type: "boolean", default: true },
    ],
  },
  "quote": {
    type: "quote",
    label: "Quote",
    icon: "❝",
    category: "content",
    isContainer: false,
    Component: QuoteBlock,
    defaultProps: { text: "Design is intelligence made visible.", align: "center" },
    fields: [
      { key: "text",   label: "Quote",   type: "textarea" },
      { key: "author", label: "Author",  type: "text" },
      { key: "role",   label: "Role / context", type: "text" },
      { key: "align",  label: "Align",   type: "select", default: "center",
        options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }] },
    ],
  },
  "map": {
    type: "map",
    label: "Map",
    icon: "📍",
    category: "media",
    isContainer: false,
    Component: MapBlock,
    defaultProps: { lat: 51.5074, lng: -0.1278, zoom: 14, height: 360 },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "lat",     label: "Latitude",  type: "number" },
      { key: "lng",     label: "Longitude", type: "number" },
      { key: "zoom",    label: "Zoom",      type: "number", default: 14 },
      { key: "height",  label: "Height (px)", type: "number", default: 360 },
      { key: "iframeUrl", label: "Custom embed URL (overrides above)", type: "url" },
    ],
  },
  "banner": {
    type: "banner",
    label: "Banner / promo strip",
    icon: "▬",
    category: "content",
    isContainer: false,
    Component: BannerBlock,
    defaultProps: {
      text: "Free UK shipping over £40",
      tone: "promo",
      dismissible: true,
      sticky: false,
    },
    fields: [
      { key: "text",       label: "Text",       type: "text" },
      { key: "ctaLabel",   label: "CTA label",  type: "text" },
      { key: "ctaHref",    label: "CTA URL",    type: "url" },
      { key: "tone",       label: "Tone",       type: "select", default: "promo",
        options: [
          { value: "info",  label: "Info" },
          { value: "promo", label: "Promo" },
          { value: "alert", label: "Alert" },
        ] },
      { key: "dismissible", label: "Dismissible", type: "boolean", default: true },
      { key: "sticky",      label: "Stick to top", type: "boolean", default: false },
    ],
  },
  "author-bio": {
    type: "author-bio",
    label: "Author bio",
    icon: "👤",
    category: "content",
    isContainer: false,
    Component: AuthorBioBlock,
    defaultProps: { name: "Felicia", role: "Founder", bio: "" },
    fields: [
      { key: "name",      label: "Name", type: "text" },
      { key: "role",      label: "Role / title", type: "text" },
      { key: "bio",       label: "Bio",  type: "textarea" },
      { key: "avatarUrl", label: "Avatar URL", type: "url" },
    ],
  },
  "member-gate": {
    type: "member-gate",
    label: "Member gate",
    icon: "🔒",
    category: "advanced",
    isContainer: true,
    Component: MemberGateBlock,
    defaultProps: {
      tier: "free",
      lockMessage: "Members only — sign in or join to read.",
      ctaLabel: "Sign in or join",
      ctaHref: "/account?mode=signup",
    },
    fields: [
      { key: "tier",        label: "Required tier", type: "text", default: "free" },
      { key: "lockMessage", label: "Lock message",  type: "textarea" },
      { key: "ctaLabel",    label: "CTA label",     type: "text" },
      { key: "ctaHref",     label: "CTA URL",       type: "url" },
    ],
  },
  "donation-button": {
    type: "donation-button",
    label: "Donation button",
    icon: "♡",
    category: "commerce",
    isContainer: false,
    Component: DonationButtonBlock,
    defaultProps: {
      heading: "Support our work",
      subheading: "Every donation goes directly to the cause.",
      currency: "GBP",
      amounts: "5,10,25,50,100",
      allowCustom: true,
      allowRecurring: true,
    },
    fields: [
      { key: "heading",        label: "Heading", type: "text" },
      { key: "subheading",     label: "Sub-heading", type: "textarea" },
      { key: "currency",       label: "Currency", type: "select", default: "GBP",
        options: [
          { value: "GBP", label: "GBP" }, { value: "USD", label: "USD" }, { value: "EUR", label: "EUR" },
        ] },
      { key: "amounts",        label: "Amounts (comma-separated)", type: "text" },
      { key: "allowCustom",    label: "Allow custom amount", type: "boolean", default: true },
      { key: "allowRecurring", label: "Show monthly toggle", type: "boolean", default: true },
    ],
  },
};

export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_REGISTRY[type];
}

export function listBlockDefinitions(): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY);
}

export function listBlocksByCategory(category: BlockDefinition["category"]): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY).filter(d => d.category === category);
}
