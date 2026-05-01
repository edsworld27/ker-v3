// Example portal.config.ts — drop a copy at the root of your host site,
// adapt the sections to your layout, then run:
//
//   node scripts/portal-sync.mjs --site=<id> --portal=<url> \
//     --config=portal.config.ts
//
// In your app code, import it the same way:
//
//   import portal from "./portal.config";
//   import { loadPortalContent } from "@ker/portal/client";
//   const c = await loadPortalContent({ siteId, portal: portalUrl, schema: portal });
//   c.hero.headline      // typed as string

import { definePortal } from "../src/portal/client";

export default definePortal({
  hero: {
    headline: { type: "text",      default: "Welcome to Felicia" },
    subtitle: { type: "html",      default: "Real ingredients. <strong>Real impact.</strong>" },
    image:    { type: "image-src", default: "/hero.jpg" },
    ctaUrl:   { type: "href",      default: "/shop" },
  },
  about: {
    body: {
      type: "text",
      default: "We started Felicia in 2024 because…",
      multiline: true,
    },
  },
});
