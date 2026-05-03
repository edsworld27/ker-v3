# Aqua storefront (`02 felicias aqua portal work/src/app/` + `src/components/`)

The customer-facing surface — Felicia's storefront. Public storefront pages
+ supporting components + storefront-side libs. Auth + editor + plugins
admin live separately under `/admin` and `/aqua`.

> Source: agent 4 sweep of `02 felicias aqua portal work/src/app/` (non-admin/aqua) and `src/components/` (non-admin/editor).

## Storefront route catalogue

| route | file | purpose | dynamic? | auth | uses portal overrides? |
|-------|------|---------|----------|------|------------------------|
| `/` | `app/page.tsx` | Homepage — hero, featured sections, footer | no | public | yes (useContent for hero fields) |
| `/about` | `app/about/page.tsx` | About the brand | no | public | yes |
| `/account` | `app/account/page.tsx` | Login + customer dashboard (orders, referrals, privacy) | no | public (dashboard requires login) | yes (mock orders; production = Shopify API) |
| `/affiliates` | `app/affiliates/page.tsx` | Referral-program landing | no | public | yes (or active portal variant) |
| `/blog` + `/blog/[slug]` | `app/blog/...` | Blog listing + posts | yes | public | yes (admin/blog) |
| `/cart` | `app/cart/page.tsx` | Cart view (mirrors CartContext) | no | public | no — CartContext-backed |
| `/checkout/success` | `app/checkout/success/page.tsx` | Stripe redirect target | no | public | no |
| `/contact` | `app/contact/page.tsx` | Contact form | no | public | yes |
| `/faq` | `app/faq/page.tsx` | FAQ list | no | public | yes (admin/faq) |
| `/help` | `app/help/page.tsx` | Help docs index | no | public | yes |
| `/ingredients` | `app/ingredients/page.tsx` | Ingredient library | no | public | INGREDIENTS const + IngredientGrid |
| `/lab-tests` | `app/lab-tests/page.tsx` | Lab results | no | public | yes |
| `/our-philosophy` + `/our-story` | `app/our-{philosophy,story}/page.tsx` | Brand narrative | no | public | yes |
| `/p/[slug]` + `/p/[...slug]` | `app/p/[slug]/page.tsx` | Visual-editor-rendered custom pages — Felicia's content stays online even if portal is down | yes | public | direct (PortalPageRenderer) |
| `/portal/embed.js`, `/portal/tag.js` | (route handlers) | Embed bootstrap scripts | no | n/a | embed bootstrap |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy | no | public | yes |
| `/products` + `/products/[slug]` | `app/products/...` | Catalog list + detail | yes | public | yes (getProducts + useContent) |
| `/redeem` | `app/redeem/page.tsx` | Gift card redemption | no | public | yes |
| `/refer` | `app/refer/page.tsx` | Customer referral dashboard | no | public | yes |
| `/reviews` | `app/reviews/page.tsx` | Customer reviews | no | public | yes |
| `/shipping-returns` | `app/shipping-returns/page.tsx` | Policies | no | public | yes |
| `/support-us` | `app/support-us/page.tsx` | Donation page | no | public | yes |
| `/sustainability` | `app/sustainability/page.tsx` | Sustainability info | no | public | yes |
| `/the-problem` | `app/the-problem/page.tsx` | Problem statement landing | no | public | yes |
| `/embed/login` | `app/embed/login/page.tsx` | **Iframe-able self-contained portal sign-in.** Uses localStorage scoped to portal origin (no cookies). postMessages parent (`ready`/`resize`/`auth-changed`). Theme customisable per-siteId via `/api/portal/embed-theme/[siteId]`. | no | public | per-site theme |

## Storefront components — `src/components/` (non-admin, non-editor)

### Chrome + nav
- **Navbar.tsx** — fixed top, three-tier dropdowns (About / Shop / Top Links). Reads `useCart()`. Pulls `navbar.wordmark1`/`wordmark2`/`subtitle` via `useContent()`. Fetches published nav pages via `listPublishedNavPages()`. Auth-state listener via `AUTH_EVENT`.
- **Footer.tsx** — multi-column (Shop / Company / Support / Social). `useContent()`-driven copy.
- **ImpersonationBar.tsx** — red banner when `isImpersonating()` is true. Click stops impersonation.
- **ForcePasswordChange.tsx** — modal blocking the page if `needsPasswordChange()`. Required after admin-created accounts with temp passwords.
- **PreviewBar.tsx** — admin preview indicator when preview mode is on.

### Hero + sections
- **Hero.tsx** — full-screen banner. Pulls `home.hero.*` via `useContent()`. Stats display, responsive grid.
- **HomeSections.tsx**, **FeaturedProducts.tsx**, **Problem.tsx**, **Solution.tsx** — narrative + featured-products sections.
- **PurpleSideScroller.tsx** — visual scroll element.

### Products + cart
- **ProductDetail.tsx** — complex. Multiple formats (bar/jar/dispenser/etc), sizes, fragrances, color-wheel hex picker. Merges base + format + fragrance overrides. Includes `ProductVariantPicker`, ingredient list, benefits grid, reviews. Integrates with `useCart()`. DiscountPopup + GiftCardPurchaseForm fallbacks.
- **ProductVariantPicker.tsx** — handles format/size/fragrance/colour selection. Emits variantId, customHex, image overrides.
- **Shop.tsx** — product grid. Filters by `?range=odo` / `?tab=gift-cards` / collection.
- **CartDrawer.tsx** — slide-out cart. Subtotal, discounts, checkout. Discount-code form. POSTs `/api/stripe/checkout`. Stashes pending sale to inventory; sets `odo_has_purchased=true` in localStorage before Stripe redirect.
- **GiftCardPurchaseForm.tsx** — gift card purchase. Generates ODO-XXXX-XXXX-XXXX codes in localStorage.
- **DiscountPopup.tsx** — first-order discount modal (ODO10).

### Content + info
- **InfoPage.tsx**, **InfoPageHeader.tsx** — wrappers for info-style pages.
- **IngredientGrid.tsx** — grid of ingredient cards (INGREDIENTS const).
- **Testimonials.tsx** — testimonials carousel.
- **SocialStrip.tsx** — Instagram/TikTok feed/links.

### Theming + admin overlays (mounted in layout.tsx)
- **ThemeInjector.tsx** — injects CSS variables for brand colours (`--brand-orange`, `--brand-cream`, etc.). Light/dark toggle.
- **ThemeSwitcher.tsx** — light/dark switcher (persists to localStorage).
- **PortalEditOverlay.tsx** — massive (~35KB). Renders the in-context visual editor when `editorMode` is on. Wraps content, captures clicks, lets operator edit in-place. Posts to `/api/portal/content/[siteId]`.
- **PortalTagInjector.tsx** — injects `<script src="/portal/tag.js">` and `<script src="/portal/embed.js">` so external sites can embed via `<portal-embed data-site="…">` tags.
- **SiteResolver.tsx** — determines active site (customer / preview / admin). Sets `data-org-id` on `<html>` for analytics.
- **SiteUX.tsx** — top-level UX provider (theme, modal stacking).

### Analytics + tracking
- **AnalyticsTracker.tsx** — auto-pageview + click/scroll/form instrumentation. Honours `lk_analytics_off=1` opt-out. POSTs `/api/portal/analytics/track`.
- **AnalyticsResolver.tsx** — wraps AnalyticsTracker with active config.
- **web-vitals-reporter.tsx** — measures LCP/FID/CLS, beacons via `navigator.sendBeacon` to `/api/portal/heartbeat`.
- **ABTestRunner.tsx** — assigns visitor variant from active tests, persists in localStorage.
- **FeatureGate.tsx** — feature-flag gate (returns null if off).

### Chat + help
- **ChatBot.tsx** — full chat widget. Connects to `/api/portal/help/ask` (AI) or `/api/portal/support` (escalation).
- **ChatBotLazy.tsx** — Suspense wrapper, lazy-loads.

### Special
- **CookiePreferencesModal.tsx** — GDPR consent. Persists to `lk_consent_*` keys.
- **EmbeddedPortal.tsx** — renders the Aqua admin in an iframe on customer pages.
- **SiteHead.tsx** — global `<Head>` meta/og, schema.org structured data.

## Storefront-side libs — `src/lib/`

| file | purpose |
|------|---------|
| `useContent.ts` | Hook returning editable text. 3-tier lookup: portal published → legacy admin → fallback. |
| `useContentImage.ts` | Same, resolves media refs to data URLs. |
| `products.ts` | `PRODUCTS` const + `getProducts()` + `onProductsChange()` listener. |
| `discounts.ts` | `resolveCode(code, subtotal, applied)` — validates gift cards, referrals, promos, admin codes. |
| `giftCards.ts` | `getGiftCard(code)`, `redeemGiftCard()`, `refundGiftCard()` — localStorage-backed. |
| `reviews.ts` | `getProductReviews(productId)`. |
| `referralCodes.ts` | `getOrCreateCodeForUser(email)`, `findCode(code)`. |
| `ingredients.ts` | `INGREDIENTS` const (IngredientDetail[]). |
| `shopify.ts` | GraphQL queries for Shopify Storefront API (not yet wired). |
| `shopifyCustomer.ts` | Shopify customer mutations (TODO). |
| `variants.ts` | Format/size/fragrance variant selection helper. |
| `seoScore.ts` | SEO audit checker. |
| `consent.ts` | GDPR consent state (`lk_consent_*`). |
| `portalCache.ts` | `loadPortalCache()`, `getPortalValue(key)` — fetches `/api/portal/config/[siteId]` once + caches. |
| `portalEditMode.ts` | Thin wrapper over admin/editorMode. |

## Cart context — `src/context/CartContext.tsx`

`useCart()` provides: `{ items, count, subtotal, total, discounts, applyDiscount, removeDiscount, addItem, removeItem, updateQty, clearCart, isOpen, openCart, closeCart }`.

- Hydrates from `lk_cart_v1` localStorage on mount
- Persists on every change (useEffect with `[items, hydrated]`)
- `applyDiscount(code)` async-resolves via `resolveCode()` + dynamic require of marketing module
- `removeDiscount()` handles gift card refunds via `giftCards.refundGiftCard()`
- Syncs reserved stock to `inventory.syncReservations(map)` on every item change
- Checkout calls `/api/stripe/checkout`, stashes pending sale, clears cart on success

## Portal-aware patterns

The storefront is "portal-aware":
- `useContent()` does 3-tier lookup: portal published → localStorage admin → fallback
- Visual editor wraps the page (`PortalEditOverlay`) and allows in-context edits
- Admin can toggle preview mode to see drafts live
- Published portal config is cached client-side via `loadPortalCache()`
