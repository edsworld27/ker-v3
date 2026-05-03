# Aqua block library (`02 felicias aqua portal work/src/components/editor/blocks/`)

58 storefront blocks usable in the visual editor and rendered to the
storefront via `BlockRenderer`. Categories: layout, content, media, commerce,
auth, advanced.

> Source: agent 3 sweep of `02 felicias aqua portal work/src/components/editor/`.

## Block catalogue

| id | name | category | description | interactive? |
|----|------|----------|-------------|--------------|
| `container` | Container | layout | Flexbox wrapper (column) | no |
| `section` | Section | layout | Full-bleed sectioning with background | no |
| `row` | Row | layout | Horizontal layout (flex row) | no |
| `column` | Column | layout | Vertical layout (flex column) | no |
| `grid` | Grid | layout | CSS Grid with configurable columns | no |
| `spacer` | Spacer | layout | Vertical spacing | no |
| `divider` | Divider | layout | Horizontal rule | no |
| `heading` | Heading | content | H1–H6 with `text` prop | no |
| `text` | Text | content | Paragraph with rich HTML | no |
| `image` | Image | media | `<img>` with src/alt/link | no |
| `button` | Button | content | Link button with hover variants | no |
| `video` | Video | media | YouTube/Vimeo embed or HTML5 | no |
| `icon` | Icon | media | Icon from sprite or SVG | no |
| `html` | Html | advanced | `dangerouslySetInnerHTML` raw HTML | no |
| `hero` | Hero | content | Full-bleed hero (eyebrow / headline / CTA) | no |
| `cta` | Cta | content | Headline + button | no |
| `testimonials` | Testimonials | content | Carousel/grid of testimonial cards | no |
| `navbar` | Navbar | layout | Editable navigation bar | no |
| `footer` | Footer | layout | Editable footer | no |
| `form` | Form | content | Generic multi-field form | yes (POST) |
| `product-card` | ProductCard | commerce | Single product card (title, image, price, add-to-cart) | yes |
| `product-grid` | ProductGrid | commerce | Grid of product cards | yes |
| `collection-grid` | CollectionGrid | commerce | Grid of collection cards | no |
| `cart-summary` | CartSummary | commerce | Reads from `CartContext` | yes |
| `checkout-summary` | CheckoutSummary | commerce | Order summary at checkout | no |
| `payment-button` | PaymentButton | commerce | Stripe/PayPal payment trigger | yes |
| `order-success` | OrderSuccess | commerce | Confirmation page after success | no |
| `variant-picker` | VariantPicker | commerce | Color / size / fragrance picker | yes |
| `product-search` | ProductSearch | commerce | Search with autocomplete | yes |
| `login-form` | LoginForm | auth | Email/password — submits to `/api/auth/login` by default | yes |
| `signup-form` | SignupForm | auth | Registration form | yes |
| `theme-selector` | ThemeSelector | advanced | Theme switcher dropdown | yes |
| `social-auth` | SocialAuth | auth | Google / Apple / GitHub buttons | yes |
| `pricing-table` | PricingTable | content | Plan comparison table | no |
| `faq` | Faq | content | Q/A accordion | no |
| `contact-form` | ContactForm | content | Contact form (name/email/message) | yes |
| `stats-bar` | StatsBar | content | Three-column stat display | no |
| `logo-grid` | LogoGrid | content | Partner / client logos grid | no |
| `feature-grid` | FeatureGrid | content | Feature cards grid (icon + description) | no |
| `newsletter-signup` | NewsletterSignup | content | Email capture | yes |
| `countdown-timer` | CountdownTimer | advanced | Countdown to date/time | yes (auto-updates) |
| `language-switcher` | LanguageSwitcher | advanced | i18n language picker | yes |
| `gallery` | Gallery | media | Lightbox image gallery | no |
| `quote` | Quote | content | Blockquote with attribution | no |
| `map` | Map | media | Embedded Google / Mapbox map | no |
| `banner` | Banner | content | Alert banner (title/message + CTA) | no |
| `author-bio` | AuthorBio | content | Profile card (photo / name / bio / social) | no |
| `member-gate` | MemberGate | advanced | Show/hide content based on login | yes |
| `donation-button` | DonationButton | commerce | Donation amount + pay button | yes |
| `tabs` | Tabs | content | Tabbed content panes | yes |
| `accordion` | Accordion | content | Collapsible sections | yes |
| `timeline` | Timeline | content | Vertical timeline | no |
| `card-grid` | CardGrid | content | Grid of card blocks | no |
| `before-after` | BeforeAfter | media | Before/after image slider | yes |
| `marquee` | Marquee | content | Scrolling text ticker | no |
| `app-showcase` | AppShowcase | content | App store download cards (iOS / Android) | no |
| `social-proof-bar` | SocialProofBar | content | Horizontal scrolling proof | no |
| `booking-widget` | BookingWidget | advanced | Calendar booking form | yes |

## BlockRenderer (`src/components/editor/BlockRenderer.tsx`)

Recursive tree renderer used by both the editor canvas and the storefront via
`PortalPageRenderer`.

Key mechanics (`BlockRenderer.tsx:22-147`):

1. **Split-test resolution** — when `block.variantsByGroup` is set, walks running split-test groups, finds the visitor's variant assignment, applies the variant's style overrides, records exposure.
2. **Theme overlay** — `block.themeStyles?.[themeId]` layered on top of base `block.styles`.
3. **Block lookup** — fetches `BlockDefinition` from registry; unknown types render a red error box in editor mode, silent fallback live.
4. **Component render** — passes `{ block, editorMode, renderChildren }` to the component. Containers call `renderChildren(block.children)` for nested blocks.
5. **A11y wrapper** — when block has aria attrs (aria-label / role / htmlId / tabIndex), wraps in a `<div style={{display:"contents"}}>` (preserves semantics without adding DOM).
6. **Responsive CSS** — when block has tablet/mobile style overrides, emits a scoped `<style>` tag targeting `[data-block-id="<id>"]` with media queries.
7. **Scroll animations** — `AnimateOnScroll` wrapper (only outside editor mode) for entrance animations from `block.styles.animate`.
8. **Exposure tracking** — wraps split-test-resolved blocks in `SplitTestExposure` to fire-and-forget record the exposure.

## Adding a block

1. Create `src/components/editor/blocks/MyBlock.tsx`. Default-export a component:
   ```ts
   export default function MyBlock({ block, editorMode, renderChildren }: BlockRenderProps) { … }
   ```
2. Import it in `blockRegistry.ts`.
3. Add an entry to `BLOCK_REGISTRY` with icon, category, fields schema, default props.
4. Add the new `BlockType` literal to the union in `src/portal/server/types.ts`.

## Block data shape

```ts
interface Block {
  id: string;
  type: BlockType;
  styles?: Record<string, string>;
  themeStyles?: Record<string, Record<string, string>>;
  responsiveStyles?: { tablet?: Record<string, string>; mobile?: Record<string, string> };
  variantsByGroup?: Record<string, BlockVariant[]>;
  a11y?: { ariaLabel?: string; role?: string; htmlId?: string; tabIndex?: number };
  children?: Block[];
  // … per-block-type props
}
```
