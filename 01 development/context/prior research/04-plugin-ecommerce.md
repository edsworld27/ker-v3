# `04` plugin — Ecommerce

The per-client ecommerce subsystem. Lives at
`04 the final portal/plugins/ecommerce/`. Default-exports an `AquaPlugin`
manifest with `scopePolicy: "client"` and `requires: ["website-editor"]`.
Built on T1's foundation (commit 16bc524) following the same vendoring
+ ports + container-builder discipline as T2's fulfillment plugin and
T3's website-editor plugin.

> Owner: T2 — Round 2.
> Source: lifted from `02 felicias aqua portal work/` per scope below.
> Verified standalone tsc-clean on 2026-05-04.

## Manifest contract

| Field | Value |
|-------|-------|
| `id` | `ecommerce` |
| `version` | `0.1.0` (beta) |
| `category` | `commerce` |
| `scopePolicy` | `client` (foundation refuses agency-scope installs) |
| `requires` | `["website-editor"]` (T3 owns block renderers) |
| `pages` | 13 lazy-loaded server components |
| `api` | 23 routes mounted at `/api/portal/ecommerce/*` |
| `storefront.blocks` | 8 block ids contributed (rendering delegated to T3) |
| `setup` | one step: Stripe API key + webhook secret + publishable key |
| `settings` | 2 groups: Stripe + store defaults |
| `features` | 12 toggles |
| `onInstall` | seeds an empty `collections` list |
| `onUninstall` | **not defined** — order data preserved on uninstall (architecture §7) |
| `healthcheck` | reports Stripe key + webhook configuration |

## Folder layout

```
plugins/ecommerce/
├── package.json                 @aqua/plugin-ecommerce, peer next/react, optional stripe
├── tsconfig.json                strict, react-jsx, bundler resolution
├── README.md
├── index.ts                     default-exported AquaPlugin manifest
└── src/
    ├── lib/
    │   ├── aquaPluginTypes.ts   vendored mirror of T1's contract (TODO: replace)
    │   ├── tenancy.ts           Agency / Client / PluginInstall / Role aliases
    │   ├── ids.ts, time.ts      crypto-strong id + clock indirection
    │   ├── products.ts          Product / ProductVariant / ProductOption types + override math
    │   ├── cart.ts              cart line-item math + reservation map
    │   ├── variants.ts          option resolver: pick → variant + custom-colour
    │   ├── shopify.ts           Shopify Storefront GraphQL wrapper (per-config)
    │   ├── stripe/server.ts     Stripe SDK wrapper — keys come from per-install config
    │   └── admin/               admin-side libs: orders, inventory, shipping, customers, collections, marketing (discount filter), reviews
    ├── server/
    │   ├── ports.ts             foundation port interfaces
    │   ├── orders.ts            ServerOrder + OrderService (CRUD scoped to clientId, idempotent webhook upsert)
    │   ├── billing.ts           per-install plan + subscription registry — vestigial (see §"Vestigial state")
    │   ├── productsStore.ts     ProductService — per-client catalog, override + inventory snapshot merge
    │   ├── giftCards.ts         GiftCardService — issue / redeem / refund
    │   ├── referralCodes.ts     ReferralCodeService — getOrCreate / find / incrementUse
    │   ├── discounts.ts         DiscountService — gift card → referral → static promo → custom code chain
    │   ├── foundationAdapter.ts registerEcommerceFoundation + containerFor(storage)
    │   └── index.ts             barrel + buildEcommerceContainer(deps)
    ├── api/
    │   ├── handlers.ts          23 pure handlers (Web Fetch Response)
    │   └── routes.ts            PluginApiRoute[] manifest entry
    ├── pages/                   server-rendered admin page wrappers
    │   ├── ProductsPage.tsx, ProductNewPage.tsx, ProductDetailPage.tsx, ProductVariantsPage.tsx
    │   ├── CollectionsPage.tsx
    │   ├── OrdersPage.tsx, OrderDetailPage.tsx, OrderReceiptPage.tsx
    │   ├── CustomersPage.tsx, CustomerDetailPage.tsx
    │   ├── InventoryPage.tsx
    │   ├── ShippingPage.tsx
    │   └── DiscountsPage.tsx
    ├── components/              client-side React (use-client)
    │   ├── admin/               ProductsList, ProductEditor, VariantsEditor, OrdersList, OrderDetail, InventoryTable, ShippingEditor, CustomersList, DiscountsEditor, CollectionsEditor
    │   ├── CartDrawer.tsx
    │   ├── ProductDetail.tsx
    │   ├── ProductVariantPicker.tsx
    │   ├── Shop.tsx
    │   ├── FeaturedProducts.tsx
    │   ├── GiftCardPurchaseForm.tsx
    │   └── DiscountPopup.tsx
    └── context/
        └── CartContext.tsx      cart state + localStorage rehydration; reservations sync via API
```

## Server domain

### `OrderService` (`server/orders.ts`)

- Per-install storage: `order:<id>` keys.
- Read API: `getOrder`, `getOrderByStripeSession`, `getOrderByPaymentIntent`, `listOrdersForClient`.
- Write API: `upsertOrderByStripeSession` (idempotent on `stripeSessionId`), `markOrderRefunded`, `updateOrderStatus`.
- Tracking + carrier surfaced on `updateOrderStatus`.
- Status enum: `pending → paid → fulfilled → shipped → delivered`, plus `refunded` and `cancelled`.

### `ProductService` (`server/productsStore.ts`)

- Per-client catalog under `products/<slug>` keys.
- `applyOverride` + `computeAvailable` from `lib/products.ts` merge override + inventory snapshot into the public Product shape.
- Inventory keys: `inventory/<sku>` with `{ onHand, reserved, lowAt, unlimited? }`.
- Reservation API: `reserveStock`, `releaseReserved`, `commitSale`.

### `BillingService` (`server/billing.ts`)

Vestigial — see §"Vestigial state" below. Keeps the 02 PLANS registry and
per-install Subscription state but doesn't drive new behaviour.

### `GiftCardService`, `ReferralCodeService`, `DiscountService`

All server-side, all backed by the per-install storage slice. The
`DiscountService.resolveCode` chain is unchanged from 02 in spirit:

1. Gift card (auto-debits the balance)
2. Referral code (£10 cap)
3. Static promo / staff codes (defaults + per-install overrides)
4. Per-install custom discount code (admin-created via `/discounts` page)

### `buildEcommerceContainer(deps)` (`server/index.ts`)

Container builder — same pattern as T2's fulfillment + T3's website-editor.
Deps shape:

```ts
interface EcommerceDeps {
  storage: StoragePort;
  tenant: TenantPort;
  activity: ActivityPort;
  events: EventBusPort;
  pluginInstalls: PluginInstallStorePort;
}
```

Returns `{ orders, billing, products, giftCards, referrals, discounts,
activity, events, tenant, pluginInstalls }`.

### Foundation adapter (`server/foundationAdapter.ts`)

Bridge between T1's runtime and the plugin's per-request services. T1
calls `registerEcommerceFoundation({ tenant, activity, events, pluginInstalls })`
once at boot; pages + handlers call `containerFor(ctx.storage)` per
request to assemble the bundle.

This pattern is necessary because T1's canonical `PluginCtx` is just
`{ agencyId, clientId?, install, storage }` — services are passed via a
sidechannel rather than inflating the ctx shape.

## API surface

All routes mount at `/api/portal/ecommerce/<path>`.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `products` | list (`?includeHidden=true&includeArchived=true`) |
| `GET` | `products/get?slug=` | single product |
| `POST` | `products` | upsert |
| `DELETE` | `products?slug=` | remove |
| `GET` | `orders` | list orders for current client |
| `GET` | `orders/get?id=` | single order |
| `POST` | `orders/status` | update status + tracking |
| `POST` | `stripe/checkout` | create Stripe Checkout Session |
| `POST` | `stripe/webhook` | Stripe webhook receiver (idempotent on event id) |
| `POST` | `stripe/billing-portal` | mint a Stripe Billing Portal URL |
| `GET` | `discounts` | list custom codes |
| `POST` | `discounts` | upsert custom code |
| `DELETE` | `discounts?code=` | remove |
| `POST` | `discounts/apply` | resolve `{ code, subtotal, alreadyApplied[] }` → `AppliedDiscount` |
| `GET` | `giftcards` | list issued cards |
| `POST` | `giftcards` | issue a new card |
| `GET` | `inventory` | list snapshots |
| `POST` | `inventory` | upsert one item |
| `POST` | `inventory/reserve` | cart → SKU reservations |
| `GET` | `shipping` | zones + rates |
| `POST` | `shipping` | save zones + rates |
| `GET` | `collections` | list collections |
| `POST` | `collections` | save collections |

Every handler returns `{ ok: boolean, … }` JSON; 4xx with `{ ok: false, error }`.

### Stripe webhook idempotency

Module-level `processedEventIds` Set dedupes within a single Node process.
For HA, swap to a SETNX/Redis or a `processed_webhook_events` table —
flagged as a follow-up TODO.

Subscribed event types:

| Event | Effect |
|-------|--------|
| `checkout.session.completed` | `OrderService.upsertOrderByStripeSession` + `order.paid` event + activity log |
| `charge.refunded` | `OrderService.markOrderRefunded` + `order.refunded` event |

## Stripe configuration — per install, NOT env

The 02 implementation read `process.env.STRIPE_SECRET_KEY` /
`STRIPE_WEBHOOK_SECRET`. The new plugin reads them from the per-install
config:

```ts
install.config = {
  stripeSecretKey: "sk_test_…",
  stripeWebhookSecret: "whsec_…",
  stripePublishableKey: "pk_test_…",
  defaultCurrency: "gbp",
  successUrl: "https://luvandker.com/checkout/success",
  cancelUrl: "https://luvandker.com/cart",
}
```

Set up via the manifest's `setup` step on first install. Operator can
rotate keys later from the plugin's settings page.

The Stripe SDK is loaded via dynamic import wrapped in a Function-eval
specifier so tsc doesn't try to resolve the module at typecheck (the
`stripe` package is an optional peer dep — installed only when an agency
turns Stripe Checkout on).

## Block contributions (T3 owns rendering)

The manifest contributes 8 block ids to T3's editor palette:

| `type` | `name` |
|--------|--------|
| `product-card` | Product card |
| `product-grid` | Product grid |
| `cart-summary` | Cart summary |
| `checkout-summary` | Checkout summary |
| `payment-button` | Pay now button |
| `order-success` | Order success |
| `variant-picker` | Variant picker |
| `product-search` | Product search |

Each block's `render` is a placeholder that **throws** if invoked from
this plugin — it documents the integration explicitly: T3's
website-editor plugin must register a concrete renderer for each block
type. The chief commander brokers the cross-plugin handoff; the plan is
that T3's `blockRegistry` is augmented by the foundation at boot with
the contributed types from each commerce plugin (this one, future
memberships, donations, etc.).

The headless React components in `src/components/` (CartDrawer,
ProductDetail, ProductVariantPicker, Shop, FeaturedProducts,
GiftCardPurchaseForm, DiscountPopup) are the **direct-use** path —
storefronts that don't go through the visual editor mount these
components directly via `<CartProvider apiBase=… installId=…>` + the
relevant component children.

## Cart context

`CartProvider` lives in `src/context/CartContext.tsx`. Storefront wraps
its tree:

```tsx
<CartProvider apiBase="/api/portal/ecommerce" installId={install.id}>
  <Shop products={…} />
  <CartDrawer apiBase="/api/portal/ecommerce" />
</CartProvider>
```

LocalStorage hydration on mount; per-store storage key suffix derived
from `installId` so multiple per-client storefronts don't collide. Cart
state mirrors to `inventory.reserved` via `POST /inventory/reserve` on
every change.

`applyDiscount(code)` calls `POST /discounts/apply` and pushes the
returned `AppliedDiscount` into state. `clearCart()` is wired to the
`/checkout/success` page so the customer doesn't return to a stale bag.

## Foundation port surface

| Port | Owner | Methods consumed |
|------|-------|------------------|
| `StoragePort` | T1 (per-install storage from `PluginCtx.storage`) | get / set / del / list |
| `TenantPort` | T1 (`server/tenants.ts`) | getClient, getClientForAgency |
| `ActivityPort` | T1 (`server/activity.ts`) | logActivity, listActivity |
| `EventBusPort` | T1 (`server/eventBus.ts`) | emit |
| `PluginInstallStorePort` | T1 (`server/pluginInstalls.ts`) | getInstall |

## Events emitted

`order.created`, `order.paid`, `order.refunded`, `order.fulfilled`,
`order.shipped`, `order.cancelled`, `product.created`, `product.updated`,
`product.deleted`, `inventory.updated`, `discount.applied`.

Aligned with T1's `eventBus.ts` shape: `emit({ agencyId, clientId }, name, payload)`.

## Vestigial state

Two carry-overs from 02 that may belong elsewhere:

1. **`server/billing.ts`** — the SaaS PLANS registry (free / starter /
   pro / enterprise) ported under the same name. In 04 each agency
   bills its clients independently of the platform's internal plan
   tiers, so this module is unused by the rest of the plugin. Kept for
   shape compatibility while the chief commander decides whether to
   move it to a future `@aqua/plugin-saas-billing` or delete it
   entirely. No external callers in this plugin.

2. **`lib/shopify.ts`** + **`server/.../shopifyCustomer.ts` (deferred)**
   — the Shopify Storefront wrapper. 02 used it for Felicia's existing
   Shopify catalog; agencies that route checkout through Shopify
   instead of Stripe will reuse it. Per-`ShopifyConfig` (no env vars).
   `shopifyCustomer.ts` from 02 was NOT ported in this round (login
   flow is foundation territory) — flagged in §"Cross-team handoff".

## Cross-team handoff

Files audited during the port that don't belong in this plugin:

| File | Rationale |
|------|-----------|
| `02/.../components/editor/blocks/*.tsx` | T3 (`@aqua/plugin-website-editor`) — block rendering |
| `02/.../lib/affiliates.ts` | future `@aqua/plugin-affiliates` |
| `02/.../lib/memberships.ts` | future `@aqua/plugin-memberships` |
| `02/.../lib/donations.ts` | future `@aqua/plugin-donations` |
| `02/.../lib/subscriptions/*` | future `@aqua/plugin-subscriptions` |
| `02/.../lib/admin/marketing.ts` UTM-attribution slice | future marketing/analytics plugin |
| `02/.../lib/shopifyCustomer.ts` | foundation (auth) — Shopify customer login is part of the auth surface, not commerce |

Files **renamed / refactored** during the port:

| 02 path | 04 path | Why |
|---------|---------|-----|
| `src/portal/server/orders.ts::orgId` | `src/server/orders.ts::clientId` | tenancy renamed |
| `src/portal/server/billing.ts` | `src/server/billing.ts` | per-install storage; same shape |
| `src/lib/products.ts::PRODUCTS` array | (dropped) | hardcoded Felicia catalog → product CRUD per-client |
| `src/lib/products.ts::loadOverrides/loadInventory` | `src/server/productsStore.ts::loadOverrideMap/loadInventoryMap` | server-side, per-install storage |
| `src/lib/giftCards.ts` (localStorage) | `src/server/giftCards.ts` (StoragePort) | server-only |
| `src/lib/referralCodes.ts` (localStorage) | `src/server/referralCodes.ts` (StoragePort) | server-only |
| `src/lib/discounts.ts` (sync, browser) | `src/server/discounts.ts` (async, server) | resolver chain unchanged |
| `src/lib/stripe/server.ts` (env vars) | `src/lib/stripe/server.ts` (`StripeKeys` arg) | per-install config |
| `src/context/CartContext.tsx` | `src/context/CartContext.tsx` | API-driven reservation sync; per-install storage key |

## Cross-team integration TODOs

| Item | Owner | Action |
|------|-------|--------|
| `aquaPluginTypes.ts` vendor | chief commander | replace with import from `04/portal/src/plugins/_types` |
| `registerEcommerceFoundation` call site | T1 (foundation runtime) | invoke once at boot with concrete adapters |
| Block renderers | T3 (`@aqua/plugin-website-editor`) | register concrete renderers for the 8 contributed block types |
| `applyStarterVariant` integration | T3 | already shipped — chief commander wires the Stripe ecommerce starter as a `portalVariantId` carried by the Onboarding / Live phases |
| Webhook idempotency persistence | T1 (storage backend) | swap `processedEventIds` Set for a SETNX/Redis or `processed_webhook_events` table |
| `aqua_cart_<installId>_v1` localStorage key | foundation chrome | nothing to do, but flag if the chrome ever exposes a per-tenant cart from another plugin |
| `billing.ts` placement | chief commander | decide: keep as vestigial / move to a `saas-billing` plugin / delete |

## Verifying

```sh
cd "04 the final portal/plugins/ecommerce"
npm install
npm run typecheck      # tsc --noEmit — clean (verified 2026-05-04)
```

The plugin compiles **standalone** — no foundation imports inside the
package. The runtime ports are interfaces the manifest expects to be
bound by the foundation registration call.
