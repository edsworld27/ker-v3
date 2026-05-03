# Claude Understands — Project Summary for Luv & Ker (Odo by Felicia)

Read this file at the start of any session to get full context without needing to explore the codebase.

---

## What This Project Is

**Luv & Ker** is a premium e-commerce site for **Odo by Felicia**, a heritage skincare brand selling 100% natural, hormone-safe African soap handcrafted in Accra, Ghana. Two product ranges:

- **Odo** ("love" in Twi) — women's skincare line
- **Nkrabea** ("destiny" in Twi) — men's strength rituals line

Brand values: ethical sourcing from named Ghanaian farms, fair wages, zero synthetics (no parabens, phthalates, SLS, synthetic fragrance).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 — **App Router** (not Pages Router) |
| Language | TypeScript 5 — strict mode |
| UI | React 19.2.4 |
| Styling | Tailwind CSS 4 + PostCSS |
| State | React Context API (`CartContext`) |
| E-commerce | Shopify Storefront API (GraphQL) |
| Fonts | Playfair Display (headings), DM Sans (body) — via Next.js font optimisation |
| Images | Next.js Image component; Unsplash allowed as remote pattern |

> **Important:** This is Next.js 16, which has breaking changes vs older versions. Before writing any Next.js-specific code, read the guide in `node_modules/next/dist/docs/`.

---

## Directory Structure

```
src/
├── app/                    # App Router pages
│   ├── page.tsx           # Homepage (Hero → Shop → Testimonials)
│   ├── layout.tsx         # Root layout: CartProvider, ChatBot, metadata
│   ├── globals.css        # Global styles
│   ├── products/
│   │   ├── page.tsx       # Shop listing with range filter
│   │   └── [slug]/        # Dynamic product detail pages
│   ├── ingredients/       # Ingredient details
│   ├── our-story/
│   ├── our-philosophy/
│   ├── sustainability/
│   ├── lab-tests/
│   ├── reviews/
│   ├── faq/
│   ├── refer/             # Referral/affiliate program
│   ├── account/           # User dashboard (orders, affiliates)
│   ├── redeem/            # Gift card redemption
│   ├── shipping-returns/
│   ├── privacy/
│   ├── contact/
│   └── the-problem/
│
├── components/            # Reusable components
│   ├── Navbar.tsx         # Fixed nav with dropdowns (~310 lines)
│   ├── Hero.tsx
│   ├── Shop.tsx
│   ├── ProductDetail.tsx  # Full product page (~596 lines)
│   ├── CartDrawer.tsx     # Slide-out cart (~270 lines)
│   ├── Testimonials.tsx   # Reviews carousel (~360 lines)
│   ├── SocialStrip.tsx    # Social proof tiles (~420 lines)
│   ├── ChatBot.tsx        # AI chat assistant
│   ├── IngredientGrid.tsx
│   ├── InfoPage.tsx       # Reusable info page template
│   ├── GiftCardPurchaseForm.tsx
│   ├── DiscountPopup.tsx
│   ├── Problem.tsx
│   ├── Solution.tsx
│   └── Footer.tsx
│
├── lib/                   # Data & business logic
│   ├── products.ts        # Product catalog PRODUCTS array (~650 lines)
│   ├── ingredients.ts     # Ingredient details with sourcing/benefits
│   ├── shopify.ts         # Shopify Storefront API client
│   ├── giftCards.ts       # Gift card management (localStorage-backed)
│   └── reviews.ts         # Customer reviews
│
└── context/
    └── CartContext.tsx    # Cart state, gift card application, drawer toggle
```

---

## Products (11 total)

**Odo Range (women's):** Hands, Face, Body, Pumice, Ritual Set  
**Nkrabea Range (men's):** Face, Body, Shave, Ritual Set  
**Gift Cards:** Digital gift card (£15–£100)

Each product has: slug, range, name, price/salePrice, badge, rating, formats (bar/jar/dispenser/sachet/stone/card), sizes, fragrances, ingredients, directions, benefits, reviews, and optional Shopify variant IDs.

---

## Key Data Models

```typescript
// Product — src/lib/products.ts
interface Product {
  slug: string
  id: string
  range: "odo" | "nkrabea"
  name: string
  price: number
  salePrice?: number
  formats: ProductFormat[]
  sizes: ProductSize[]
  formatSizes?: Record<string, ProductSize[]>
  fragrances: string[]
  ingredients: Ingredient[]
  shopifyVariants?: { [key: string]: string }
  // ... reviews, benefits, directions, etc.
}

// Cart — src/context/CartContext.tsx
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  variant?: string
  shopifyVariantId?: string
}

// Gift Card — src/lib/giftCards.ts
interface GiftCard {
  code: string          // ODO-XXXX-XXXX-XXXX format
  amount: number
  balance: number
  recipientName/Email/senderName/message: string
  createdAt: number
  redemptions: [...]
}
```

---

## Shopify Integration

File: `src/lib/shopify.ts`  
Endpoint: `https://{SHOPIFY_DOMAIN}/api/2024-01/graphql.json`  
Auth header: `X-Shopify-Storefront-Access-Token`

Operations: `cartCreate`, `addToCart`, `updateCart`, `removeFromCart`, `getCart`

**Env vars required (in `.env.local`):**
```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
```

---

## Tailwind Theme (custom colors)

```
brand-black   #0A0A0A    brand-cream   #FAF5EE
brand-orange  #E8621A    brand-amber   #F2A23C
brand-purple  #6B2D8B
```

Each color has dark/light/muted variants. Dark theme throughout (black bg, cream text).

Custom animations: `fade-up`, `fade-in`, `float`

---

## How to Run

```bash
npm install
# add .env.local with Shopify vars
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # ESLint check
```

---

## Key Patterns & Conventions

- `"use client"` directive required on all interactive components
- Product pages use `generateStaticParams()` for static generation
- Path alias: `@/` resolves to `src/`
- Mobile-first Tailwind (sm → md → lg → xl)
- No form library — native HTML forms with React state
- No Redux/Zustand — React Context only
- No backend database — product data is hardcoded; gift cards use localStorage
- Account/auth pages exist in UI but auth logic is not implemented
- No email service integrated

---

## What Is NOT Built Yet

- User authentication / registration / login
- Order history backend integration
- Email delivery for gift cards (UI exists, no mailer)
- Site-wide search
- Wishlist / favourites
- Backend API (Shopify handles checkout entirely)

---

## Development Branch

Active branch: `claude/create-project-summary-Zqkd9`  
Repo: `edsworld27/ker-v3`
