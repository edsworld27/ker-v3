# T3 — Plugin Porter: Ecommerce

You are Terminal 3 of three parallel Claude Opus 4.7 sessions building
`04 the final portal/`. T1 is scaffolding the portal foundation. T2 is
porting the website-editor plugin. Your job: extract the ecommerce
subsystem (products / variants / orders / cart / checkout / Stripe) from
`02 felicias aqua portal work/` into a self-contained plugin package at
`04 the final portal/plugins/ecommerce/`.

## Your goal

The ecommerce plugin is one of two pre-vetted plugins that drop into the
new agency platform. By end-of-task, the plugin folder should be self-
contained, have a manifest exporting an `AquaPlugin`, and be ready for
T1's portal to mount it once T1's foundation lands.

## Coordination — read these first

1. `01 development/CLAUDE.md`
2. `01 development/context/MASTER.md`
3. `01 development/context/prior research/aqua-plugin-system.md` — plugin contract.
4. `01 development/context/prior research/aqua-server-modules.md` — server modules; the ecommerce ones live in `src/portal/server/orders.ts` etc.
5. `01 development/context/prior research/aqua-admin-routes.md` — every `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/inventory`, `/admin/shipping`, etc.
6. `01 development/context/prior research/aqua-storefront.md` — for `CartContext`, `ProductDetail`, `CartDrawer` etc.
7. `01 development/context/prior research/aqua-api-routes.md` — for `/api/portal/products`, `/api/portal/orders`, `/api/stripe/*`.
8. `01 development/eds requirments.md` if non-empty.

## Scope of work — files to lift

From `02 felicias aqua portal work/` into `04 the final portal/plugins/ecommerce/`:

### Admin routes
- `src/app/admin/products/*` (list + new + [slug] + variants)
- `src/app/admin/collections/*`
- `src/app/admin/orders/*` (list + [id] + receipt)
- `src/app/admin/customers/*` (list + [email])
- `src/app/admin/inventory/*`
- `src/app/admin/shipping/*`
- `src/app/admin/marketing/page.tsx` (UTM + discount codes — verify it's ecommerce-bound, lift only the discount-codes slice if so)

### Server runtime
- `src/portal/server/orders.ts`
- `src/portal/server/billing.ts`
- (Inventory + shipping if they have dedicated server modules — check `src/portal/server/` for any `inventory.ts`, `shipping.ts`)

### Client-side libs
- `src/lib/admin/products.ts`
- `src/lib/admin/collections.ts`
- `src/lib/admin/marketing.ts`
- `src/lib/admin/inventory.ts`
- `src/lib/admin/reviews.ts`
- `src/lib/products.ts` (storefront-side)
- `src/lib/cart.ts`, `discounts.ts`
- `src/lib/giftCards.ts`
- `src/lib/referralCodes.ts`
- `src/lib/variants.ts`
- `src/lib/shopify.ts`, `shopifyCustomer.ts` (TODO markers preserved)

### Cart context + UI
- `src/context/CartContext.tsx`
- `src/components/CartDrawer.tsx`
- `src/components/ProductDetail.tsx`
- `src/components/ProductVariantPicker.tsx`
- `src/components/Shop.tsx`
- `src/components/FeaturedProducts.tsx`
- `src/components/GiftCardPurchaseForm.tsx`
- `src/components/DiscountPopup.tsx`

### API routes
- `src/app/api/portal/products/*`
- `src/app/api/portal/orders/*`
- `src/app/api/portal/promote/[siteId]/route.ts` — only if related to ecommerce (verify; T2 may own this)
- `src/app/api/stripe/*` (webhook + checkout + billing-portal)
- `src/app/api/donations/checkout/route.ts` — verify which plugin owns this. Probably **donations**, not ecommerce. Skip unless certain.

### Stripe lib
- `src/lib/stripe/server.ts`

### Portal config slices
- Any `portal.config.ts` keys related to products / catalog / shop

## Required output structure

```
04 the final portal/plugins/ecommerce/
├── package.json              name: "@aqua/plugin-ecommerce"
├── README.md                 what the plugin does + how to mount
├── index.ts                  manifest — exports default AquaPlugin
├── src/
│   ├── pages/                admin pages
│   ├── api/                  api route handlers
│   ├── components/           CartDrawer, ProductDetail, etc.
│   ├── server/               orders, billing
│   ├── context/              CartContext
│   └── lib/                  client-side helpers
└── README.md
```

The plugin manifest (`index.ts`) must export an `AquaPlugin` with:
- `id: 'ecommerce'`
- `name`, `version`, `status: 'stable'`, `category: 'commerce'`
- `requires: ['website-editor']` (yes — `02`'s ecommerce manifest declares
  `requires: ['website']`; equivalent here. Cross-check.)
- `pages: PluginPage[]` — every admin route
- `api: PluginApiRoute[]` — products, orders, Stripe
- `storefront: { blocks: BlockDescriptor[] }` — `product-card`, `product-grid`, `cart-summary`, `checkout-summary`, `payment-button`, `order-success`, `variant-picker`, `product-search`, `donation-button` (verify last one belongs here)
- `settings: SettingsSchema` — Stripe keys, store defaults (currency, tax-incl flags), digital delivery options
- `features: PluginFeature[]` — physicalProducts, digitalProducts, variants, inventory, shipping, discountCodes, reviews, subscriptions (pro plan), stripeCheckout, downloadDelivery, licenseKeys, multiCurrency (ent)
- `setup: SetupStep[]` — Stripe key wizard
- Lifecycle hooks: `onInstall` likely empty (no migration needed); `onUninstall` should NOT delete order data (operator can reinstall)

## NOT in scope

- Don't touch foundation (T1).
- Don't port editor / blocks / portal-variants (T2).
- Don't port `src/components/editor/blocks/product-*` files — those go with
  T2's block library. Just register them in your manifest's
  `storefront.blocks` so the runtime knows the ecommerce plugin contributes them.
  The actual block components live in T2's plugin folder.
- Don't lift `affiliates.ts`, `memberships.ts`, `donations.ts`, `subscriptions/*` — those are separate plugins for later.
- Don't change Stripe API contracts; keep webhook handling identical to `02`.

## Cross-team handoff (expected)

Some files might genuinely span ecommerce + editor:
- `LoginCustomisation` (editor) but uses CartContext (ecommerce) — leave with T2.
- `ProductDetail.tsx` — yours.
- `BlockRenderer` (`src/components/editor/BlockRenderer.tsx`) — T2's. Your blocks reference it but don't lift it.
- `useContent()` — T2 owns it, you import.

If you find a genuine ambiguity, don't guess. Add a "Cross-team handoff"
section to your chapter and flag it for the chief commander.

## When done

1. Verify `tsc --noEmit` clean inside `04 the final portal/plugins/ecommerce/`.
2. Verify the manifest exports correctly.
3. Add `01 development/context/prior research/04-plugin-ecommerce.md`
   documenting:
   - Manifest contract
   - Admin route mount points
   - API route mount points
   - Stripe config flow
   - Block contributions (and which terminal owns the actual block components)
   - Outstanding TODOs (especially: Shopify integration paths preserved)
4. Add a MASTER.md row.
5. Update `tasks.md`.
6. Commit + push.

Stay terse in your output to Ed; long-form decisions go in the chapter.
