import { NextResponse } from "next/server";
import { ensureHydrated, getState, mutate } from "@/portal/server/storage";
import { createOrg, getOrg } from "@/portal/server/orgs";
import { createPage, listPages } from "@/portal/server/pages";
import type { Block, EditorPage } from "@/portal/server/types";

// POST /api/portal/example — idempotently seed an example portal:
//   • org "Example Co" (orgId "example")
//   • homepage / shop / cart / checkout pages built from the visual
//     editor's block schema, so the operator can immediately drop into
//     the editor and see a fully-laid-out portal.
//
// Re-running the endpoint is safe; missing pieces are filled in,
// existing ones are left alone.

export const dynamic = "force-dynamic";

const EXAMPLE_ORG_ID = "example";
const EXAMPLE_SITE_ID = "example-site";

function blk(type: Block["type"], props: Record<string, unknown> = {}, children?: Block[]): Block {
  return {
    id: `b_${Math.random().toString(36).slice(2, 10)}`,
    type,
    props,
    children,
  };
}

const TEMPLATES: Array<{ slug: string; title: string; build: () => Block[] }> = [
  {
    slug: "/",
    title: "Home",
    build: () => [
      blk("hero", {
        eyebrow: "Example Co · Demo",
        headline: "Crafted with the Aqua portal",
        subhead: "This whole homepage was built in the visual editor — drag, drop, click to edit. Try it.",
        ctaLabel: "Shop the demo",
        ctaHref: "/shop",
      }),
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Featured products", level: 2 }),
        blk("text", { text: "Live from the catalog. Each card pulls real data via /api/portal/products." }),
        blk("product-grid", { collectionHandle: "all", columns: 3, limit: 6 }),
      ]),
      blk("section", { fullWidth: true, } , [
        blk("cta", {
          headline: "Build your own portal",
          subhead: "Drag-drop builder, variant picker with custom-colour wheel, real cart + checkout. All in one tool.",
          ctaLabel: "Get started",
          ctaHref: "/aqua/new",
        }),
      ]),
      blk("testimonials", {
        title: "Loved by founders",
        items: [
          { quote: "The variant picker wheel is exactly what we needed for custom orders.", author: "Felicia", role: "Founder, Odo" },
          { quote: "Drag-and-drop pages and live cart in one canvas — never going back.", author: "Ed", role: "CTO" },
          { quote: "We onboarded three clients in a day.", author: "Ada", role: "Agency owner" },
        ],
      }),
    ],
  },
  {
    slug: "/shop",
    title: "Shop",
    build: () => [
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Shop the example catalog", level: 1 }),
        blk("text", { text: "Filter, sort, browse — fully wired to /api/portal/products." }),
        blk("collection-grid", { showFilters: true, sortKey: "title" }),
      ]),
    ],
  },
  {
    slug: "/cart",
    title: "Cart",
    build: () => [
      blk("section", { fullWidth: false }, [
        blk("heading", { text: "Your cart", level: 1 }),
        blk("cart-summary", { showThumbnails: true, showQuantitySelector: true }),
      ]),
    ],
  },
  {
    slug: "/checkout",
    title: "Checkout",
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
            blk("payment-button", { label: "Pay £49.20 now", provider: "stripe" }),
          ]),
        ]),
      ]),
    ],
  },
];

export async function POST() {
  await ensureHydrated();

  // Org
  let org = getOrg(EXAMPLE_ORG_ID);
  if (!org) {
    org = createOrg({
      name: "Example Co",
      slug: "example",
      ownerEmail: "demo@example.com",
      brandColor: "#06b6d4",
    });
    // Force the id we want so links are stable.
    if (org.id !== EXAMPLE_ORG_ID) {
      mutate(state => {
        delete state.orgs[org!.id];
        state.orgs[EXAMPLE_ORG_ID] = { ...org!, id: EXAMPLE_ORG_ID, slug: "example" };
      });
      org = getOrg(EXAMPLE_ORG_ID)!;
    }
  }

  // Pages — only seed missing slugs so the operator's edits survive a
  // second click on "Open example".
  const existing = listPages(EXAMPLE_SITE_ID);
  const existingSlugs = new Set(existing.map(p => p.slug));
  const created: EditorPage[] = [];
  for (const tpl of TEMPLATES) {
    if (existingSlugs.has(tpl.slug)) continue;
    const page = createPage({
      siteId: EXAMPLE_SITE_ID,
      slug: tpl.slug,
      title: tpl.title,
      blocks: tpl.build(),
    });
    created.push(page);
  }

  return NextResponse.json({
    ok: true,
    orgId: EXAMPLE_ORG_ID,
    siteId: EXAMPLE_SITE_ID,
    pages: listPages(EXAMPLE_SITE_ID),
    seeded: created.length,
    note: getState().pages[EXAMPLE_SITE_ID] ? undefined : "no pages bucket yet",
  });
}

export async function GET() {
  await ensureHydrated();
  const org = getOrg(EXAMPLE_ORG_ID);
  return NextResponse.json({
    ok: true,
    seeded: !!org,
    orgId: EXAMPLE_ORG_ID,
    siteId: EXAMPLE_SITE_ID,
    pages: org ? listPages(EXAMPLE_SITE_ID) : [],
  });
}
