# Performance audit (T1 #6)

Targeted Core Web Vitals / Lighthouse polish for the Felicia storefront.
Focus was high-impact, low-risk wins; nothing here changes data shape or
behaviour, only how/when the browser sees the UI.

## Done

### Image optimisation
- Audited every storefront component listed in scope
  (`Hero`, `Problem`, `Solution`, `FeaturedProducts`, `Testimonials`,
  `IngredientGrid`, `ProductDetail`, `Footer`, `Navbar`, `Shop`,
  `SocialStrip`).
- The bulk of those already use `next/image` correctly: `Hero` (with
  `priority` on the LCP image and a `data:` URL fallback), `Testimonials`,
  and `IngredientGrid` (with `sizes` set, `priority` on the modal hero).
- `Problem`, `Solution`, `FeaturedProducts`, `Footer`, `Navbar`,
  `SocialStrip`, `ProductDetail` contain no `<img>` tags — `<svg>` icons
  and CSS gradients only — so no conversion was needed.
- The remaining `<img>` tags were left as plain `<img>` deliberately;
  see "Skipped" below.

### Font loading
- Confirmed `subsets: ["latin"]` on both `Playfair_Display` and `DM_Sans`
  — the storefront copy is Latin-only so this keeps the downloaded byte
  count minimal.
- Added `fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto",
  "sans-serif"]` to both `next/font` calls. Combined with the existing
  `display: "swap"`, this means a slow webfont fetch shows the user a
  system-stack glyph immediately rather than invisible text (no FOIT)
  and the layout shift on swap is dampened by `next/font`'s automatic
  size-adjust descriptor.

### Lazy-loading below-the-fold heavy components
- `Testimonials` and `SocialStrip` (the two heaviest below-the-fold
  client components on the home page) are now imported via `next/dynamic`
  with `{ ssr: true, loading: () => null }`. SSR stays on so crawlers
  and the no-JS path see them; only the JS hydration is deferred.
- `ChatBot` is now imported via `next/dynamic` with `{ ssr: false }`
  in `layout.tsx`. It's purely client-side, only matters once a user
  clicks the launcher, and pulls in a per-site config fetch + a chunk
  of UI it doesn't need to ship in the initial bundle.

### Third-party script timing
- Confirmed `SiteHead.tsx` already loads GA4, GTM, Meta pixel, TikTok
  pixel, Hotjar, and Plausible via `next/script` with
  `strategy="afterInteractive"`. No change required.
- Confirmed `PortalTagInjector.tsx` injects `/portal/tag.js` via
  `useEffect` (post-mount, async). No paint blocking.
- `/portal/tag.js` itself is served with `defer`. No change required.

### Real-user Core Web Vitals reporting
- New `src/components/web-vitals-reporter.tsx` uses
  `useReportWebVitals` from `next/web-vitals` (ships with Next, no new
  dep) and posts each metric to the existing
  `/api/portal/heartbeat` endpoint with `event: "web-vitals"`. Uses
  `navigator.sendBeacon` with a `keepalive: true` `fetch` fallback so
  reports survive `pagehide`. Wired into the root layout.

### Image hosts (`next.config.ts`)
- Reviewed every external image URL in storefront components and
  `lib/`. Only `images.unsplash.com` is referenced today, and it's
  already in `remotePatterns`. No new hosts added — the task said keep
  it minimal and only add what's actually used.

## Skipped (deliberate)

- **`Hero.tsx` data-URL `<img>` fallback** — `next/image`'s loader
  rejects `data:` URLs. The current code already routes data URLs to a
  plain `<img>` and everything else to `<Image>`. Correct as-is.
- **`Shop.tsx`'s `ProductCard` `<img>` for `product.image`** — admin
  uploads via `FileReader.readAsDataURL` (see
  `src/app/admin/products/[slug]/page.tsx`), so `product.image` can be
  a `data:` URL. `next/image` would 500 on those. Left as a plain
  `<img>` per task instructions.
- **`src/app/blog/**`, `src/app/p/[slug]/**`, `src/app/account/page.tsx`,
  `src/app/embed/login/page.tsx`** — these `<img>` tags pass URLs
  through `resolveMediaRef()` or per-site theme config (admin-pasted
  external URLs). Configuring `next.config.ts` to permit every host an
  admin might paste is impractical. Left as plain `<img>`.
- **Admin pages** — internal-audience UI; not in scope for storefront
  CWV polish.
- **Bundle-splitting `Problem` / `Solution` / `Shop` / `FeaturedProducts`**
  — these are above-the-fold or near-fold on the home page and the
  initial paint depends on them. Lazy-loading would *hurt* LCP and TTI.

## Recommended next steps (when there's time)

These are real wins but they're either build-tool changes or external
work; they don't fit the "low-risk, do-it-now" frame of T1 #6.

1. **Compress source images in `public/images/**`.** Each large hero
   asset (e.g. `public/images/hero/elephants.png`) likely ships as a
   multi-MB PNG. Re-encode as WebP/AVIF (or at least mozjpeg) and let
   `next/image` serve the optimised variant. Tools: `sharp` CLI,
   `squoosh-cli`, or `vercel/og`'s build-time pipeline.
2. **Self-host the two Google fonts.** `next/font/google` already
   inlines them, but you can drop the build-time fetch entirely by
   downloading the woff2 files into `public/fonts/` and using
   `next/font/local`. Saves a DNS lookup + initial-render network
   round-trip.
3. **Set up a CDN in front of `/api/og`, `/portal/tag.js`,
   `/portal/embed.js`** — these are static-ish and currently re-rendered
   on every request through the app server.
4. **Run an actual Lighthouse pass on production** (the dev server
   masks bundle sizes and disables image optimisation). Track scores
   over time via `@lhci/cli` so regressions show up in CI.
5. **Add a `<link rel="preload">` for the LCP image** in `Hero.tsx`
   (`elephants.png`) — `next/image priority` already does this for the
   LCP variant, but a manual preload of the highest-priority size would
   shave a few ms off the LCP measurement.
6. **Consider `loading="lazy"` for the long-tail testimonials photos**
   inside the marquee. They're already off-screen and the marquee is
   inside a lazy-loaded chunk, but explicit lazy attributes belt-and-
   brace it.
7. **Audit the JS bundle with `@next/bundle-analyzer`.** Likely
   suspects for large chunks: the admin code paths, `ChatBot`'s
   per-site config logic, and the marquee animations.
8. **Make `WebVitalsReporter` rate-limit on the client side.** Right
   now every metric posts a heartbeat; long sessions could send 10+
   beacons. The server already 60-per-minute rate-limits per siteId so
   it's safe, but a 1-per-metric-per-pageload guard on the client would
   be cleaner.
9. **Persist web-vitals into a real metrics sink.** The current path
   piggy-backs on the heartbeat envelope; a dedicated `event: web-vitals`
   handler that stores into Supabase / KV with `name`, `value`,
   `rating`, `path`, and `siteId` columns would unlock dashboards.
