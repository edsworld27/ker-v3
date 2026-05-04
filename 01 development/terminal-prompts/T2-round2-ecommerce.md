/loop

# T2 — Round 2: Port ecommerce plugin

You are Terminal 2, Round 2. Your Round-1 fulfillment plugin shipped
(`2dfc7e6`). T1 is wiring fulfillment into the shell + adding a demo seed
(their Round 2). T3 is finishing the website-editor port.

Round 2 goal: port the ecommerce subsystem from
`02 felicias aqua portal work/` into a self-contained
`04 the final portal/plugins/ecommerce/` package, mirroring the shape +
discipline of your fulfillment plugin and T3's website-editor port.

## Working environment

- **Repo**: https://github.com/edsworld27/ker-v3
- **Local working directory**: `~/Desktop/ker-v3/`
- **Branch**: commit directly to `main`. After each commit: `git pull --rebase --autostash && git push`.
- Top-level folder names contain spaces — quote paths in the shell.

## Autonomous mesh — messaging protocol

- **Outbox**: append every meaningful step to `01 development/messages/terminal-2/to-orchestrator.md`.
- **Inbox**: read `01 development/messages/terminal-2/from-orchestrator.md` before each sub-task and after each push.
- Don't stop on questions; log `Q-ASSUMED` and continue. Only stop on `Q-BLOCKED`.

## Mandatory pre-read

1. `01 development/CLAUDE.md`
2. `01 development/context/MASTER.md`
3. `01 development/context/prior research/04-architecture.md`
4. **Your own chapter from Round 1**: `01 development/context/prior research/04-plugin-fulfillment.md` — same patterns apply (ports, container builder, vendored types, tsc-clean standalone).
5. `01 development/context/prior research/aqua-server-modules.md` — the ecommerce server module (`orders.ts`) lives here.
6. `01 development/context/prior research/aqua-admin-routes.md` — every `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/inventory`, `/admin/shipping` route.
7. `01 development/context/prior research/aqua-storefront.md` — `CartContext`, `ProductDetail`, `CartDrawer` patterns.
8. `01 development/context/prior research/aqua-api-routes.md` — `/api/portal/products`, `/api/portal/orders`, `/api/stripe/*`.
9. `01 development/context/prior research/04-foundation.md` — T1's contracts you'll consume.
10. T1's `04 the final portal/portal/src/plugins/_types.ts` (canonical now — your fulfillment vendor can move to import this in a follow-up; in your ecommerce package you can either import T1's types directly OR vendor again — your call).

## Scope — files to lift

From `02 felicias aqua portal work/` into `04 the final portal/plugins/ecommerce/`:

### Admin routes
- `src/app/admin/products/*` (list + new + [slug] + variants)
- `src/app/admin/collections/*`
- `src/app/admin/orders/*` (list + [id] + receipt)
- `src/app/admin/customers/*` (list + [email])
- `src/app/admin/inventory/*`
- `src/app/admin/shipping/*`
- `src/app/admin/marketing/page.tsx` — only the discount-codes slice; UTM tracking is not ecommerce-specific (leave for marketing plugin later)

### Server runtime
- `src/portal/server/orders.ts`
- `src/portal/server/billing.ts`

### Client-side libs
- `src/lib/admin/{products,collections,marketing,inventory,reviews}.ts`
- `src/lib/{products,cart,discounts,giftCards,referralCodes,variants,shopify,shopifyCustomer}.ts`

### Cart context + UI
- `src/context/CartContext.tsx`
- `src/components/{CartDrawer,ProductDetail,ProductVariantPicker,Shop,FeaturedProducts,GiftCardPurchaseForm,DiscountPopup}.tsx`

### API routes
- `src/app/api/portal/products/*`
- `src/app/api/portal/orders/*`
- `src/app/api/stripe/*` (webhook + checkout + billing-portal)

### Stripe lib
- `src/lib/stripe/server.ts`

### Portal config slices
- Any `portal.config.ts` keys related to products / catalog / shop

## Required output structure

```
04 the final portal/plugins/ecommerce/
├── package.json              name: "@aqua/plugin-ecommerce"
├── README.md
├── index.ts                  default-exported AquaPlugin manifest
├── tsconfig.json             strict, react-jsx
├── src/
│   ├── lib/                  vendored types (or import from foundation), tenancy, ids, time
│   ├── server/               orders, billing, container builder, ports
│   ├── api/                  routes + handlers
│   ├── pages/                admin pages (lazy-loaded server components)
│   ├── components/           Cart UI + ProductDetail + variant picker
│   └── context/              CartContext
└── tsconfig.tsbuildinfo
```

## Manifest contract

```ts
const ecommercePlugin: AquaPlugin = {
  id: 'ecommerce',
  name: 'E-commerce',
  version: '0.1.0',
  status: 'beta',
  category: 'commerce',
  tagline: 'Products, variants, Stripe, orders',
  description: 'Sell physical or digital goods. Cart, checkout via Stripe, order management, customers, inventory, shipping.',
  requires: ['website-editor'],   // needs visual editor blocks (product-card, cart-summary, etc.)
  scopePolicy: 'client',          // ecommerce always installs at the client level, not the agency
  pages: [...],
  api: [...],
  storefront: { blocks: [...] },  // contributed: product-card, product-grid, cart-summary, checkout-summary, payment-button, order-success, variant-picker, product-search
  settings: SettingsSchema,        // Stripe keys, store defaults
  features: [
    'physicalProducts', 'digitalProducts', 'variants', 'inventory', 'shipping',
    'discountCodes', 'reviews', 'subscriptions', 'stripeCheckout',
    'downloadDelivery', 'licenseKeys', 'multiCurrency'
  ],
  setup: SetupStep[],              // Stripe key wizard
  onInstall, onUninstall: lifecycle hooks (don't delete order data on uninstall)
};
```

## Cross-team integration via ports

Mirror your fulfillment-plugin pattern:

- `src/server/ports.ts` — declare what the foundation must provide (StoragePort, ActivityPort, TenantPort, EventBusPort).
- `src/server/index.ts` — `buildEcommerceContainer(deps)` returns the service surface.
- API handlers receive the container.
- Page components consume the container via a thin adapter layer.

For the Stripe integration: keep `lib/stripe/server.ts` exactly as it is in
`02`. The webhook handler reads `STRIPE_WEBHOOK_SECRET` from env. Don't
hardcode keys — they come from per-install settings via `install.config`.

## NOT in scope

- Don't touch foundation (T1 wires you in).
- Don't touch fulfillment (your own Round-1 plugin — leave it alone).
- Don't touch website-editor (T3's plugin).
- Don't lift block components like `product-card.tsx` from `src/components/editor/blocks/` — those belong to T3's website-editor plugin. Your manifest just registers their ids in `storefront.blocks`; T3's plugin owns the rendering.
- Don't lift `affiliates.ts`, `memberships.ts`, `donations.ts`, `subscriptions/*` — those are separate plugins for later rounds.
- Don't change Stripe API contracts.

## Loop discipline

Same as Round 1. Pass `<<autonomous-loop-dynamic>>` to `ScheduleWakeup`.

## When done

1. `tsc --noEmit` clean inside `04 the final portal/plugins/ecommerce/`.
2. Manifest exports correctly.
3. Add `01 development/context/prior research/04-plugin-ecommerce.md` chapter:
   - Manifest contract
   - Folder layout
   - Server domain (orders, billing, ports, container)
   - API surface (`/api/portal/ecommerce/*` and `/api/stripe/*` integration)
   - Block contributions (referencing T3's editor blocks by id)
   - Stripe config flow (per-install, not env)
   - Cross-team integration TODOs (T1 wires runtime/registry/ports; T3 must register the ecommerce-relevant blocks)
4. Add MASTER.md row.
5. Update `tasks.md` — mark Round 2 T2 done.
6. Append `DONE` to your outbox + final `COMMIT`.

If you find a file that genuinely belongs elsewhere (T1 foundation or T3
website-editor or an affiliate/membership plugin), don't guess. Add a
"Cross-team handoff" section in your chapter listing it.
