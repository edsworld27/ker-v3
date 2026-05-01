// Starter page templates surfaced on /admin/sites/[siteId]/pages when the
// admin clicks "New page". Each template seeds a block tree the operator
// can then edit. Mirrors the structure Wix / Squarespace use ("Start from
// a template, then customise").

import type { Block, BlockType } from "@/portal/server/types";
import { getBlockDefinition } from "./blockRegistry";

function blk(type: BlockType, props: Record<string, unknown> = {}, children?: Block[]): Block {
  const def = getBlockDefinition(type);
  return {
    id: `b_${Math.random().toString(36).slice(2, 10)}`,
    type,
    props: { ...(def?.defaultProps ?? {}), ...props },
    children,
  };
}

export interface PageTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  defaultSlug: string;
  defaultTitle: string;
  build: () => Block[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "blank",
    label: "Blank",
    description: "Start from an empty canvas.",
    icon: "▢",
    defaultSlug: "/page",
    defaultTitle: "New page",
    build: () => [],
  },
  {
    id: "homepage",
    label: "Homepage",
    description: "Hero, featured products, testimonials, CTA.",
    icon: "🏠",
    defaultSlug: "/",
    defaultTitle: "Home",
    build: () => [
      blk("hero", {
        eyebrow: "Welcome",
        headline: "Build something beautiful",
        subhead: "A short tagline that explains the value proposition. Edit me.",
        ctaLabel: "Shop now",
        ctaHref: "/shop",
      }),
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Featured products", level: 2 }),
        blk("product-grid", { collectionHandle: "all", columns: 3, limit: 6 }),
      ]),
      blk("testimonials", {
        title: "Loved by our customers",
        items: [
          { quote: "This is the future of skincare.", author: "Felicia", role: "Founder" },
          { quote: "Shipped my whole site in a day.", author: "Ed", role: "CTO" },
          { quote: "Best portal I've ever used.", author: "Ada", role: "Product" },
        ],
      }),
      blk("cta", {
        headline: "Ready to start?",
        subhead: "Join thousands of customers already shopping with us.",
        ctaLabel: "Get started",
        ctaHref: "/account",
      }),
    ],
  },
  {
    id: "about",
    label: "About",
    description: "Story + values + team.",
    icon: "✦",
    defaultSlug: "/about",
    defaultTitle: "About",
    build: () => [
      blk("hero", {
        eyebrow: "Our story",
        headline: "Crafted in Ghana",
        subhead: "Heritage, intention, and pure ingredients — passed down through generations.",
        ctaLabel: "",
        ctaHref: "",
      }),
      blk("section", { fullWidth: false }, [
        blk("grid", { columns: 2, gap: "32px" }, [
          blk("column", {}, [
            blk("heading", { text: "Our values", level: 2 }),
            blk("text", { text: "Pure, hormone-safe, fertility-friendly. We believe in skincare that works with your body, not against it." }),
          ]),
          blk("column", {}, [
            blk("image", { src: "", alt: "Team", width: "100%" }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: "contact",
    label: "Contact",
    description: "Hero + contact form + map.",
    icon: "✉",
    defaultSlug: "/contact",
    defaultTitle: "Contact",
    build: () => [
      blk("hero", {
        eyebrow: "Get in touch",
        headline: "We'd love to hear from you",
        subhead: "Questions, feedback, partnerships — drop us a line.",
        ctaLabel: "",
        ctaHref: "",
      }),
      blk("section", { fullWidth: false }, [
        blk("form", {
          title: "Send us a message",
          action: "/api/contact",
          submitLabel: "Send",
          fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "message", label: "Message", type: "textarea", required: true },
          ],
        }),
      ]),
    ],
  },
  {
    id: "shop",
    label: "Shop",
    description: "Collection grid with filters.",
    icon: "🛍",
    defaultSlug: "/shop",
    defaultTitle: "Shop",
    build: () => [
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Shop all", level: 1 }),
        blk("text", { text: "Browse our full catalog." }),
        blk("collection-grid", { showFilters: true, sortKey: "title" }),
      ]),
    ],
  },
  {
    id: "cart",
    label: "Cart",
    description: "Cart summary + checkout button.",
    icon: "🛒",
    defaultSlug: "/cart",
    defaultTitle: "Cart",
    build: () => [
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Your cart", level: 1 }),
        blk("cart-summary", { showThumbnails: true, showQuantitySelector: true }),
      ]),
    ],
  },
  {
    id: "checkout",
    label: "Checkout",
    description: "Order summary + payment.",
    icon: "💳",
    defaultSlug: "/checkout",
    defaultTitle: "Checkout",
    build: () => [
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Checkout", level: 1 }),
        blk("grid", { columns: 2, gap: "32px" }, [
          blk("column", {}, [
            blk("form", {
              title: "Shipping details",
              action: "/api/checkout",
              submitLabel: "Continue to payment",
              fields: [
                { name: "email", label: "Email", type: "email", required: true },
                { name: "name", label: "Full name", type: "text", required: true },
                { name: "address", label: "Address", type: "text", required: true },
                { name: "city", label: "City", type: "text", required: true },
                { name: "postcode", label: "Postcode", type: "text", required: true },
              ],
            }),
          ]),
          blk("column", {}, [
            blk("checkout-summary", { showLineItems: true, showShipping: true, showTax: true }),
            blk("payment-button", { label: "Pay now", provider: "stripe" }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: "order-success",
    label: "Order success",
    description: "Thank-you page after checkout.",
    icon: "✓",
    defaultSlug: "/order-confirmed",
    defaultTitle: "Order confirmed",
    build: () => [
      blk("order-success", {
        headline: "Thanks for your order!",
        subhead: "We've sent a receipt to your email. Your order will ship within 2 business days.",
        ctaLabel: "Continue shopping",
        ctaHref: "/shop",
      }),
    ],
  },
];
