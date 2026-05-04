// Canonical 58-block registry. Maps each block `type` → React component
// + `BlockDescriptor` (defaults, label, category, optional plugin/feature
// gates).
//
// Round 1 contract — full descriptor list with structural placeholder
// components. Pixel-fidelity port of 02's block UIs is Round 2 polish.
// The registry shape is the foundation merge point: ecommerce / blog /
// other plugins extend by appending their own descriptors.

import type { ComponentType } from "react";
import type { BlockDescriptor, BlockCategory } from "../lib/aquaPluginTypes";
import type { Block } from "../types/block";

// ─── Block component imports ───────────────────────────────────────────────

import { AccordionBlock } from "./blocks/AccordionBlock";
import { AppShowcaseBlock } from "./blocks/AppShowcaseBlock";
import { AuthorBioBlock } from "./blocks/AuthorBioBlock";
import { BannerBlock } from "./blocks/BannerBlock";
import { BeforeAfterBlock } from "./blocks/BeforeAfterBlock";
import { BookingWidgetBlock } from "./blocks/BookingWidgetBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { CardGridBlock } from "./blocks/CardGridBlock";
import { CartSummaryBlock } from "./blocks/CartSummaryBlock";
import { CheckoutSummaryBlock } from "./blocks/CheckoutSummaryBlock";
import { CollectionGridBlock } from "./blocks/CollectionGridBlock";
import { ColumnBlock } from "./blocks/ColumnBlock";
import { ContactFormBlock } from "./blocks/ContactFormBlock";
import { ContainerBlock } from "./blocks/ContainerBlock";
import { CountdownTimerBlock } from "./blocks/CountdownTimerBlock";
import { CtaBlock } from "./blocks/CtaBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { DonationButtonBlock } from "./blocks/DonationButtonBlock";
import { FaqBlock } from "./blocks/FaqBlock";
import { FeatureGridBlock } from "./blocks/FeatureGridBlock";
import { FooterBlock } from "./blocks/FooterBlock";
import { FormBlock } from "./blocks/FormBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { GridBlock } from "./blocks/GridBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { HeroBlock } from "./blocks/HeroBlock";
import { HtmlBlock } from "./blocks/HtmlBlock";
import { IconBlock } from "./blocks/IconBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { LanguageSwitcherBlock } from "./blocks/LanguageSwitcherBlock";
import { LoginFormBlock } from "./blocks/LoginFormBlock";
import { LogoGridBlock } from "./blocks/LogoGridBlock";
import { MapBlock } from "./blocks/MapBlock";
import { MarqueeBlock } from "./blocks/MarqueeBlock";
import { MemberGateBlock } from "./blocks/MemberGateBlock";
import { NavbarBlock } from "./blocks/NavbarBlock";
import { NewsletterSignupBlock } from "./blocks/NewsletterSignupBlock";
import { OrderSuccessBlock } from "./blocks/OrderSuccessBlock";
import { PaymentButtonBlock } from "./blocks/PaymentButtonBlock";
import { PricingTableBlock } from "./blocks/PricingTableBlock";
import { ProductCardBlock } from "./blocks/ProductCardBlock";
import { ProductGridBlock } from "./blocks/ProductGridBlock";
import { ProductSearchBlock } from "./blocks/ProductSearchBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { RowBlock } from "./blocks/RowBlock";
import { SectionBlock } from "./blocks/SectionBlock";
import { SignupFormBlock } from "./blocks/SignupFormBlock";
import { SocialAuthBlock } from "./blocks/SocialAuthBlock";
import { SocialProofBarBlock } from "./blocks/SocialProofBarBlock";
import { SpacerBlock } from "./blocks/SpacerBlock";
import { StatsBarBlock } from "./blocks/StatsBarBlock";
import { TabsBlock } from "./blocks/TabsBlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ThemeSelectorBlock } from "./blocks/ThemeSelectorBlock";
import { TimelineBlock } from "./blocks/TimelineBlock";
import { VariantPickerBlock } from "./blocks/VariantPickerBlock";
import { VideoBlock } from "./blocks/VideoBlock";

// ─── Registry entry ────────────────────────────────────────────────────────

export interface BlockComponentProps {
  block: Block;
  children?: React.ReactNode;
}

export interface BlockRegistryEntry {
  descriptor: BlockDescriptor;
  component: ComponentType<BlockComponentProps>;
}

const entry = (
  type: string,
  label: string,
  category: BlockCategory,
  component: ComponentType<BlockComponentProps>,
  extras: Partial<BlockDescriptor> = {},
): BlockRegistryEntry => ({
  descriptor: { type, label, category, ...extras },
  component,
});

// ─── The 58 ────────────────────────────────────────────────────────────────

export const BLOCK_REGISTRY: Record<string, BlockRegistryEntry> = {
  // Layout (7)
  container: entry("container", "Container", "layout", ContainerBlock),
  section: entry("section", "Section", "layout", SectionBlock),
  row: entry("row", "Row", "layout", RowBlock),
  column: entry("column", "Column", "layout", ColumnBlock),
  grid: entry("grid", "Grid", "layout", GridBlock),
  spacer: entry("spacer", "Spacer", "layout", SpacerBlock),
  divider: entry("divider", "Divider", "layout", DividerBlock),

  // Content (16)
  heading: entry("heading", "Heading", "content", HeadingBlock),
  text: entry("text", "Text", "content", TextBlock),
  button: entry("button", "Button", "content", ButtonBlock),
  hero: entry("hero", "Hero", "content", HeroBlock),
  cta: entry("cta", "Call to action", "content", CtaBlock),
  testimonials: entry("testimonials", "Testimonials", "content", TestimonialsBlock),
  "pricing-table": entry("pricing-table", "Pricing table", "content", PricingTableBlock),
  faq: entry("faq", "FAQ", "content", FaqBlock),
  quote: entry("quote", "Quote", "content", QuoteBlock),
  banner: entry("banner", "Banner", "content", BannerBlock),
  "author-bio": entry("author-bio", "Author bio", "content", AuthorBioBlock),
  "stats-bar": entry("stats-bar", "Stats bar", "content", StatsBarBlock),
  "logo-grid": entry("logo-grid", "Logo grid", "content", LogoGridBlock),
  "feature-grid": entry("feature-grid", "Feature grid", "content", FeatureGridBlock),
  tabs: entry("tabs", "Tabs", "content", TabsBlock),
  accordion: entry("accordion", "Accordion", "content", AccordionBlock),
  "card-grid": entry("card-grid", "Card grid", "content", CardGridBlock),
  footer: entry("footer", "Footer", "content", FooterBlock),
  navbar: entry("navbar", "Navigation bar", "content", NavbarBlock),
  timeline: entry("timeline", "Timeline", "content", TimelineBlock),
  form: entry("form", "Form", "content", FormBlock),
  "contact-form": entry("contact-form", "Contact form", "content", ContactFormBlock),

  // Media (7)
  image: entry("image", "Image", "media", ImageBlock),
  video: entry("video", "Video", "media", VideoBlock),
  icon: entry("icon", "Icon", "media", IconBlock),
  gallery: entry("gallery", "Gallery", "media", GalleryBlock),
  map: entry("map", "Map", "media", MapBlock),
  "before-after": entry("before-after", "Before / after", "media", BeforeAfterBlock),
  marquee: entry("marquee", "Marquee", "media", MarqueeBlock),

  // Commerce (11) — gated on ecommerce plugin (Round 2)
  "product-card": entry("product-card", "Product card", "commerce", ProductCardBlock, { requiresPlugin: "ecommerce" }),
  "product-grid": entry("product-grid", "Product grid", "commerce", ProductGridBlock, { requiresPlugin: "ecommerce" }),
  "collection-grid": entry("collection-grid", "Collection grid", "commerce", CollectionGridBlock, { requiresPlugin: "ecommerce" }),
  "cart-summary": entry("cart-summary", "Cart summary", "commerce", CartSummaryBlock, { requiresPlugin: "ecommerce" }),
  "checkout-summary": entry("checkout-summary", "Checkout summary", "commerce", CheckoutSummaryBlock, { requiresPlugin: "ecommerce" }),
  "payment-button": entry("payment-button", "Payment button", "commerce", PaymentButtonBlock, { requiresPlugin: "ecommerce" }),
  "order-success": entry("order-success", "Order success", "commerce", OrderSuccessBlock, { requiresPlugin: "ecommerce" }),
  "variant-picker": entry("variant-picker", "Variant picker", "commerce", VariantPickerBlock, { requiresPlugin: "ecommerce" }),
  "product-search": entry("product-search", "Product search", "commerce", ProductSearchBlock, { requiresPlugin: "ecommerce" }),
  "donation-button": entry("donation-button", "Donation button", "commerce", DonationButtonBlock),
  "booking-widget": entry("booking-widget", "Booking widget", "commerce", BookingWidgetBlock),

  // Auth (5)
  "login-form": entry("login-form", "Login form", "auth", LoginFormBlock),
  "signup-form": entry("signup-form", "Signup form", "auth", SignupFormBlock),
  "theme-selector": entry("theme-selector", "Theme selector", "auth", ThemeSelectorBlock),
  "social-auth": entry("social-auth", "Social auth", "auth", SocialAuthBlock),
  "member-gate": entry("member-gate", "Member gate", "auth", MemberGateBlock),

  // Advanced (8)
  html: entry("html", "Raw HTML", "advanced", HtmlBlock),
  "countdown-timer": entry("countdown-timer", "Countdown timer", "advanced", CountdownTimerBlock),
  "language-switcher": entry("language-switcher", "Language switcher", "advanced", LanguageSwitcherBlock),
  "newsletter-signup": entry("newsletter-signup", "Newsletter signup", "advanced", NewsletterSignupBlock),
  "app-showcase": entry("app-showcase", "App showcase", "advanced", AppShowcaseBlock),
  "social-proof-bar": entry("social-proof-bar", "Social proof bar", "advanced", SocialProofBarBlock),
};

export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY);
export const BLOCK_DESCRIPTORS: BlockDescriptor[] = Object.values(BLOCK_REGISTRY).map((e) => e.descriptor);

export function getBlockEntry(type: string): BlockRegistryEntry | undefined {
  return BLOCK_REGISTRY[type];
}

export function getBlockDescriptor(type: string): BlockDescriptor | undefined {
  return BLOCK_REGISTRY[type]?.descriptor;
}
