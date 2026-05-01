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
  {
    id: "landing",
    label: "Landing page",
    description: "Hero + features grid + testimonial + CTA.",
    icon: "★",
    defaultSlug: "/landing",
    defaultTitle: "Landing",
    build: () => [
      blk("hero", {
        eyebrow: "Launch offer",
        headline: "Ship faster, look better",
        subhead: "A focused landing page built block-by-block.",
        ctaLabel: "Get started",
        ctaHref: "/signup",
      }),
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Why us", level: 2 }),
        blk("grid", { columns: 3, gap: "24px" }, [
          blk("column", {}, [blk("icon", { glyph: "⚡", size: "32px", color: "#ff6b35" }), blk("heading", { text: "Fast", level: 3 }), blk("text", { text: "Drag, drop, publish — minutes not weeks." })]),
          blk("column", {}, [blk("icon", { glyph: "🎨", size: "32px", color: "#ff6b35" }), blk("heading", { text: "Beautiful", level: 3 }), blk("text", { text: "Themes that look custom out of the box." })]),
          blk("column", {}, [blk("icon", { glyph: "🛒", size: "32px", color: "#ff6b35" }), blk("heading", { text: "Commerce-ready", level: 3 }), blk("text", { text: "Variants, cart, checkout — all built in." })]),
        ]),
      ]),
      blk("testimonials", {
        title: "Customers say",
        items: [{ quote: "Best builder I've used in years.", author: "Jamie", role: "Founder" }],
      }),
      blk("cta", { headline: "Ready to launch?", subhead: "It's faster than booking a meeting.", ctaLabel: "Start free", ctaHref: "/signup" }),
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "3-tier pricing table.",
    icon: "💰",
    defaultSlug: "/pricing",
    defaultTitle: "Pricing",
    build: () => [
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Simple, honest pricing", level: 1 }),
        blk("text", { text: "No surprises. Cancel anytime." }),
        blk("grid", { columns: 3, gap: "24px" }, [
          blk("column", { gap: "12px" }, [
            blk("heading", { text: "Starter", level: 3 }),
            blk("heading", { text: "£0", level: 2 }),
            blk("text", { text: "per month" }),
            blk("text", { text: "1 site\nUp to 50 products\nCommunity support" }),
            blk("button", { label: "Get started", href: "/signup", variant: "secondary" }),
          ]),
          blk("column", { gap: "12px" }, [
            blk("heading", { text: "Pro", level: 3 }),
            blk("heading", { text: "£49", level: 2 }),
            blk("text", { text: "per month" }),
            blk("text", { text: "5 sites\nUnlimited products\nVariants + analytics\nPriority support" }),
            blk("button", { label: "Start free trial", href: "/signup?plan=pro", variant: "primary" }),
          ]),
          blk("column", { gap: "12px" }, [
            blk("heading", { text: "Enterprise", level: 3 }),
            blk("heading", { text: "£199", level: 2 }),
            blk("text", { text: "per month" }),
            blk("text", { text: "Unlimited everything\nWhite-label\nDedicated manager\nSLA" }),
            blk("button", { label: "Contact sales", href: "/contact", variant: "secondary" }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Common questions + answers.",
    icon: "?",
    defaultSlug: "/faq",
    defaultTitle: "FAQ",
    build: () => [
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Frequently asked questions", level: 1 }),
        blk("html", {
          html: `
<details style="border-bottom:1px solid rgba(255,255,255,0.08); padding:16px 0;">
  <summary style="cursor:pointer; font-weight:600; font-size:16px;">How long does setup take?</summary>
  <p style="margin-top:8px; opacity:0.75;">Most stores ship their first page within 30 minutes.</p>
</details>
<details style="border-bottom:1px solid rgba(255,255,255,0.08); padding:16px 0;">
  <summary style="cursor:pointer; font-weight:600; font-size:16px;">Can I import my existing products?</summary>
  <p style="margin-top:8px; opacity:0.75;">Yes — CSV or Shopify import works in one click.</p>
</details>
<details style="border-bottom:1px solid rgba(255,255,255,0.08); padding:16px 0;">
  <summary style="cursor:pointer; font-weight:600; font-size:16px;">Do you charge transaction fees?</summary>
  <p style="margin-top:8px; opacity:0.75;">No. You pay only your payment provider's fees.</p>
</details>
        `.trim() }),
      ]),
    ],
  },
  {
    id: "services",
    label: "Services",
    description: "Service grid with offerings.",
    icon: "✨",
    defaultSlug: "/services",
    defaultTitle: "Services",
    build: () => [
      blk("hero", {
        eyebrow: "What we do",
        headline: "Services tailored to you",
        subhead: "Browse our offerings or get in touch for a custom quote.",
        ctaLabel: "Contact us",
        ctaHref: "/contact",
      }),
      blk("section", { fullWidth: false }, [
        blk("grid", { columns: 2, gap: "24px" }, [
          blk("column", { gap: "8px" }, [blk("heading", { text: "Strategy", level: 3 }), blk("text", { text: "Brand, positioning, audience research." })]),
          blk("column", { gap: "8px" }, [blk("heading", { text: "Design", level: 3 }), blk("text", { text: "Identity systems, visual languages, packaging." })]),
          blk("column", { gap: "8px" }, [blk("heading", { text: "Development", level: 3 }), blk("text", { text: "Web + mobile builds with conversion baked in." })]),
          blk("column", { gap: "8px" }, [blk("heading", { text: "Growth", level: 3 }), blk("text", { text: "Ads, SEO, retention loops, lifecycle." })]),
        ]),
      ]),
    ],
  },
  {
    id: "blog-index",
    label: "Blog index",
    description: "Latest posts grid.",
    icon: "📝",
    defaultSlug: "/blog",
    defaultTitle: "Blog",
    build: () => [
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Latest posts", level: 1 }),
        blk("text", { text: "Notes from the team." }),
        blk("html", {
          html: `
<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
  <article style="padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
    <p style="font-size:11px; opacity:0.5; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.18em;">Notes · 5 min read</p>
    <h3 style="font-family:var(--font-playfair, Georgia, serif); font-size:20px; margin:0 0 8px;">First post title</h3>
    <p style="opacity:0.75; line-height:1.5; margin:0;">Replace with the latest post excerpt. Wire to /admin/blog when you're ready.</p>
  </article>
  <article style="padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
    <p style="font-size:11px; opacity:0.5; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.18em;">Tutorial · 8 min read</p>
    <h3 style="font-family:var(--font-playfair, Georgia, serif); font-size:20px; margin:0 0 8px;">Second post title</h3>
    <p style="opacity:0.75; line-height:1.5; margin:0;">Another placeholder excerpt.</p>
  </article>
</div>
        `.trim() }),
      ]),
    ],
  },
];
