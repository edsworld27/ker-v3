export interface ProductSize {
  label: string;
  price: number;
}

export type ProductFormat = "bar" | "jar" | "dispenser" | "sachet" | "stone" | "card";

export interface ProductReview {
  name: string;
  location: string;
  stars: number;
  title: string;
  body: string;
}

export interface Product {
  slug: string;
  id: string;
  range: string;           // "odo" | "nkrabea" | "unisex" or any custom range
  name: string;
  tagline: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  image?: string;
  badge?: string;
  badgeColor?: string;
  archived?: boolean;
  hidden?: boolean;
  stockSku?: string;       // links to inventory item SKU
  showLowStock?: boolean;  // show "Only X left" badge when stock is low
  available?: number;      // computed: onHand - reserved (undefined = not tracked)
  rating: number;
  reviewCount: number;
  origin: string;
  shortBullets: string[];
  description: string[];
  note: string;
  formats: ProductFormat[];
  sizes: ProductSize[];
  formatSizes?: Partial<Record<ProductFormat, ProductSize[]>>;
  formatContent?: Partial<Record<ProductFormat, {
    tagline?: string;
    description?: string[];
    shortBullets?: string[];
    note?: string;
    ingredients?: { name: string; note?: string }[];
    directions?: string;
  }>>;
  fragrances: string[];
  fragranceContent?: Record<string, {
    note?: string;
    description?: string[];
    shortBullets?: string[];
  }>;
  ingredients: { name: string; note?: string }[];
  directions: string;
  benefits: { icon: string; title: string; body: string }[];
  reviews: ProductReview[];
  shopifyVariants?: {
    format: string;
    size: string;
    fragrance: string;
    id: string;
  }[];
  // ── Variant system (Wix/Shopify-style) ──────────────────────────────────
  // Options describe the dimensions a customer can pick (Colour, Size,
  // Material…). Variants are the concrete combinations with their own
  // price, image, SKU. Optional — products without options stay as
  // before. See src/lib/variants.ts for the variant resolver.
  options?: ProductOption[];
  variants?: ProductVariant[];
  // Surcharge applied when the customer picks a "custom" colour from the
  // colour wheel (only relevant when an option has allowCustom: true).
  // In pence/cents, in the product's base currency.
  customColorSurcharge?: number;
}

// ── Option groups (Colour, Size, Material…) ─────────────────────────────
//
// `displayType` drives the storefront UI:
//   "swatch"      — square colour chips (hexColor required on values)
//   "color-wheel" — same as "swatch" + a "Custom…" button that opens a
//                   colour wheel; produces an ephemeral custom variant
//   "size"        — pill buttons (label only)
//   "text"        — radio cards (label + optional image)
//   "image"       — image swatches (image url required on values)
//
// `priceModifier` on a value adds/subtracts from the base price when
// that value is selected. When a variant explicitly defines a price for
// the option combination, the variant's price wins.

export type ProductOptionDisplay = "swatch" | "color-wheel" | "size" | "text" | "image";

export interface ProductOptionValue {
  id: string;            // stable id (slug-style)
  label: string;
  hexColor?: string;     // required for swatch / color-wheel
  image?: string;        // required for "image" display
  priceModifier?: number;// pence; positive or negative delta
  available?: boolean;   // default true
}

export interface ProductOption {
  id: string;            // e.g. "colour", "size", "material"
  name: string;          // display name, e.g. "Colour"
  displayType: ProductOptionDisplay;
  values: ProductOptionValue[];
  required?: boolean;    // default true
  allowCustom?: boolean; // colour-wheel only — admin opens picker for any hex
}

export interface ProductVariant {
  id: string;
  // Maps optionId → valueId. Custom variants from the colour wheel use
  // a synthetic valueId of `custom:<hex>` (e.g. `custom:#ff0000`).
  optionValues: Record<string, string>;
  price: number;
  salePrice?: number;
  image?: string;
  sku?: string;
  available?: number;    // undefined = not tracked, infinite stock
  isCustom?: boolean;    // true for ephemeral custom-colour variants
}

export const PRODUCTS: Product[] = [
  {
    slug: "odo-hands",
    id: "odo-hands",
    range: "odo",
    name: "Odo Hands",
    tagline: "Purifying · Hand Soap",
    price: 18.0,
    badge: "Daily Essential",
    badgeColor: "bg-brand-orange",
    rating: 4.9,
    reviewCount: 84,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "Deep-cleansing formula that nourishes without stripping",
      "Available in solid bar, elegant glass dispenser, or eco-refill sachets",
      "Rich shea butter base leaves hands soft and supple after washing",
      "Naturally antibacterial without harsh chemicals",
    ],
    description: [
      "Odo Hands brings our heritage formulation to your sink. A deeply moisturising black soap blend built on centuries of Ghanaian skincare wisdom. We blend raw shea butter with traditional black soap base and cold-processed palm kernel oil to cleanse gently while feeding the skin.",
      "Choose from our classic hand-cut bar, a beautiful glass dispenser for your bathroom, or sustainable sachet refills to reduce waste.",
    ],
    note: "Citrus & Vanilla notes",
    formats: ["bar", "dispenser", "sachet"],
    sizes: [
      { label: "100g", price: 18.0 },
    ],
    formatSizes: {
      bar: [
        { label: "100g", price: 18.0 },
        { label: "200g", price: 30.0 },
      ],
      dispenser: [
        { label: "250ml", price: 28.0 },
        { label: "500ml", price: 48.0 },
      ],
      sachet: [
        { label: "Single Sachet", price: 8.0 },
        { label: "3 Sachets", price: 22.0 },
        { label: "6 Sachets", price: 40.0 },
      ],
    },
    formatContent: {
      bar: {
        tagline: "Hand Soap · Solid Bar",
        note: "Citrus & Vanilla · lathers richly",
        description: [
          "The Odo Hands bar is our heritage black soap formulation brought to your sink. Cold-processed with raw shea butter and palm kernel oil, it creates a rich, creamy lather that cleanses deeply without stripping your hands.",
          "Each bar is hand-cut from a single batch in Accra. Long-lasting and plastic-free — one bar replaces several bottles of liquid soap.",
        ],
        shortBullets: [
          "Replaces multiple bottles of liquid soap — long lasting",
          "Rich, creamy lather from shea butter and black soap base",
          "Plastic-free and zero waste",
          "Naturally antibacterial without harsh chemicals",
        ],
        ingredients: [
          { name: "Shea Butter", note: "Northern Ghana" },
          { name: "Black Soap Base", note: "Kumasi, Ashanti" },
          { name: "Palm Kernel Oil", note: "Western Ghana" },
          { name: "Sweet Orange Oil" },
          { name: "Vanilla Absolute" },
        ],
        directions: "Wet hands with warm water. Lather the bar between your palms and wash thoroughly. Rinse and pat dry. Store on a soap dish between uses.",
      },
      dispenser: {
        tagline: "Hand Soap · Glass Dispenser",
        note: "Citrus & Vanilla · ready to pump",
        description: [
          "The Odo Hands Dispenser is our liquid black soap formulation housed in a beautiful, refillable glass bottle. Designed to sit on your sink and make a statement — elegant, minimal, and zero plastic.",
          "When empty, simply order a sachet refill. The glass bottle is yours to keep forever.",
        ],
        shortBullets: [
          "Beautiful refillable glass bottle — zero single-use plastic",
          "Liquid black soap formula — same heritage formulation, pourable",
          "Pump dispenser for effortless, mess-free use",
          "Designed to last a lifetime with sachet refills",
        ],
        ingredients: [
          { name: "Shea Butter", note: "Northern Ghana" },
          { name: "Black Soap Liquid Base", note: "Kumasi, Ashanti" },
          { name: "Palm Kernel Oil", note: "Western Ghana" },
          { name: "Sweet Orange Oil" },
          { name: "Vanilla Absolute" },
          { name: "Distilled Water" },
        ],
        directions: "Pump 1–2 times onto wet hands. Lather thoroughly and rinse. When the bottle is empty, refill with an Odo Hands Sachet — no wastage, no new bottle needed.",
      },
      sachet: {
        tagline: "Hand Soap · Refill Sachet",
        note: "Eco refill · no new bottle needed",
        description: [
          "The Odo Hands Sachet is a concentrated liquid refill for your Odo Hands Dispenser. Packaged in a minimal, compostable sachet — no glass, no plastic, just pure product.",
          "Simply pour the sachet into your empty dispenser and top with a small amount of water. One sachet refills your dispenser completely.",
        ],
        shortBullets: [
          "Compostable sachet packaging — no plastic, no glass",
          "Refills your Odo Hands Dispenser perfectly",
          "Concentrated formula — just add a splash of water",
          "Lowest cost-per-wash in the Odo Hands range",
        ],
        ingredients: [
          { name: "Shea Butter", note: "Northern Ghana" },
          { name: "Black Soap Liquid Base", note: "Kumasi, Ashanti" },
          { name: "Palm Kernel Oil", note: "Western Ghana" },
          { name: "Sweet Orange Oil" },
          { name: "Vanilla Absolute" },
        ],
        directions: "Open sachet and pour slowly into your empty Odo Hands Dispenser. Add 1–2 tablespoons of water if needed. Replace pump and shake gently.",
      },
    },
    fragrances: ["Wild Orange", "Lavender", "Frankincense", "Unscented"],
    fragranceContent: {
      "Wild Orange": {
        note: "doTERRA Wild Orange · bright & uplifting",
        description: [
          "Scented with doTERRA Wild Orange essential oil — cold-pressed from the rind of sun-ripened oranges grown without pesticides. Clinically shown to elevate mood and reduce cortisol levels, it transforms hand-washing into a moment of pure sensory joy.",
          "Zero synthetic fragrance. Zero endocrine disruptors. Just the real oil, in the right amount.",
        ],
        shortBullets: [
          "doTERRA Wild Orange — cold-pressed, pesticide-free",
          "Mood-lifting citrus scent without synthetic fragrance",
          "Rich shea butter lather keeps hands soft and nourished",
          "Zero parabens, phthalates, SLS, or hormone-disrupting additives",
        ],
      },
      "Lavender": {
        note: "doTERRA Lavender · calming & floral",
        description: [
          "Scented with doTERRA Lavender essential oil — steam-distilled from Bulgarian lavender fields at peak bloom. Known for its cortisol-lowering and skin-soothing properties, it turns every hand wash into a moment of calm.",
          "Completely synthetic-fragrance-free. What you smell is pure lavender — nothing added, nothing faked.",
        ],
        shortBullets: [
          "doTERRA Bulgarian Lavender — steam-distilled at peak bloom",
          "Naturally calming and skin-soothing",
          "Perfect for bedtime rituals or sensitive skin",
          "Zero synthetic fragrance — pure essential oil only",
        ],
      },
      "Frankincense": {
        note: "doTERRA Frankincense · grounding & ancestral",
        description: [
          "Scented with doTERRA Frankincense (Boswellia sacra) — steam-distilled from sacred resin harvested by hand in Oman. One of the world's most premium essential oils. Revered for millennia across Africa and the Middle East for its grounding and regenerative properties.",
          "This is our most elevated scent. Earthy, warm, and deeply ceremonial. Completely BS-free — no synthetic fragrance, ever.",
        ],
        shortBullets: [
          "doTERRA Frankincense — hand-harvested Boswellia resin, Oman",
          "One of the world's most prized and ancient essential oils",
          "Deeply grounding, anti-inflammatory, and regenerative",
          "Our most premium scent — completely synthetic-fragrance-free",
        ],
      },
      "Unscented": {
        note: "Pure formula · no fragrance added",
        description: [
          "Our Unscented formula is the pure Odo Hands base — nothing added, nothing masked. Ideal for those with fragrance sensitivities, allergies, or very young skin.",
          "The same deeply nourishing shea butter and black soap formula. Zero essential oils. Zero fragrance of any kind.",
        ],
        shortBullets: [
          "Pure formula — zero fragrance of any kind",
          "Ideal for fragrance sensitivities and allergies",
          "Safe for children and very sensitive skin",
          "Same deeply nourishing base formula",
        ],
      },
    },
    ingredients: [
      { name: "Shea Butter", note: "Northern Ghana" },
      { name: "Black Soap Base", note: "Kumasi, Ashanti" },
      { name: "Palm Kernel Oil", note: "Western Ghana" },
      { name: "Sweet Orange Oil" },
      { name: "Vanilla Absolute" },
    ],
    directions: "Lather onto wet hands, massage thoroughly, and rinse. Follow with a natural oil or hand cream.",
    benefits: [
      { icon: "🌿", title: "All-natural", body: "Zero synthetic ingredients." },
      { icon: "💧", title: "Non-drying", body: "Shea butter restores the barrier." },
      { icon: "♻️", title: "Eco-friendly", body: "Refill sachets reduce plastic waste." },
      { icon: "🤲", title: "Gentle", body: "Safe for frequent hand-washing." },
    ],
    reviews: [
      { name: "Sarah L.", location: "London, UK", stars: 5, title: "Finally, a soap that doesn't dry my hands", body: "I wash my hands constantly and they used to crack. Since switching to Odo Hands, they are perfectly soft." }
    ],
  },
  {
    slug: "odo-face",
    id: "odo-face",
    range: "odo",
    name: "Odo Face",
    tagline: "Exfoliating · Honey Cleanser",
    price: 24.0,
    badge: "Best Seller",
    badgeColor: "bg-brand-purple",
    rating: 4.8,
    reviewCount: 156,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "Gently exfoliates with cocoa pod ash and raw Ghanaian honey",
      "Lifts dullness and reveals luminous, even-toned skin",
      "Vitamin-rich for visible radiance and acne control",
      "Available as a whipped jar cleanser or a solid exfoliating scrub bar",
    ],
    description: [
      "Odo Face is your brightening ritual. Built on our original base and supercharged with raw Ghanaian honey, cocoa pod ash, and plantain skin ash, it gently polishes away dullness while keeping skin perfectly balanced.",
      "Available in a whipped jar format featuring a rich honey mix, or a solid bar format for a slightly more textured scrub."
    ],
    note: "Raw Honey & Earth scent",
    formats: ["jar", "bar"],
    sizes: [
      { label: "100ml", price: 24.0 },
      { label: "200ml", price: 40.0 },
    ],
    fragrances: ["Wild Orange", "Lavender", "Frankincense", "Unscented"],
    ingredients: [
      { name: "Raw Honey", note: "Northern Ghana" },
      { name: "Shea Butter", note: "Northern Ghana" },
      { name: "Cocoa Pod Ash", note: "Eastern Region" },
      { name: "Black Soap Base", note: "Kumasi, Ashanti" },
    ],
    directions: "Wet face. Lather a small amount in your palms and massage gently into the face in small circular motions. Leave for 30 seconds, then rinse with warm water.",
    benefits: [
      { icon: "🍯", title: "Raw Honey", body: "Naturally antibacterial and incredibly soothing." },
      { icon: "✨", title: "Visible radiance", body: "Cocoa pod ash polishes away dullness." },
      { icon: "🌿", title: "Plant-powered", body: "Every active is sourced from a named Ghanaian farm." },
      { icon: "💆🏾‍♀️", title: "Gentle", body: "No microplastics, just fine plant ash." },
    ],
    reviews: [
      { name: "Nana A.", location: "Manchester, UK", stars: 5, title: "Glow is back", body: "Two weeks in and my skin looks like it did in my twenties." }
    ],
  },
  {
    slug: "odo-body",
    id: "odo-body",
    range: "odo",
    name: "Odo Body",
    tagline: "Hydrating · Body Wash",
    price: 22.0,
    rating: 4.9,
    reviewCount: 92,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "Rich, creamy lather for full-body hydration",
      "Soothes dry skin, eczema, and body breakouts",
      "Available in a classic solid bar or a whipped jar format",
      "Naturally derived earth and citrus scent",
    ],
    description: [
      "Odo Body is the ultimate shower ritual. A deeply moisturising wash that transforms your daily shower into a moment of ancestral care. Formulated to soothe dry skin and maintain your body's natural moisture barrier.",
      "Available as a classic, long-lasting solid bar, or a luxurious whipped paste in a jar."
    ],
    note: "Earth & Citrus scent",
    formats: ["bar", "jar"],
    sizes: [
      { label: "200g", price: 22.0 },
      { label: "400g", price: 38.0 },
    ],
    fragrances: ["Wild Orange", "Lavender", "Frankincense", "Unscented"],
    ingredients: [
      { name: "Shea Butter", note: "Northern Ghana" },
      { name: "Black Soap Base", note: "Kumasi, Ashanti" },
      { name: "Coconut Oil", note: "Volta Region" },
      { name: "Sweet Orange Oil" },
    ],
    directions: "In the shower, massage into damp skin. For best results, use with the Odo Pumice Stone for gentle body exfoliation. Rinse thoroughly.",
    benefits: [
      { icon: "💧", title: "Deeply hydrating", body: "Raw shea butter restores the skin barrier." },
      { icon: "🕊", title: "Hormone-safe", body: "Free from parabens, phthalates, SLS, and synthetic fragrance." },
      { icon: "🤲", title: "Small-batch", body: "Cold-processed and hand-cut." },
      { icon: "🚿", title: "Rich lather", body: "Creates a luxurious, creamy foam." },
    ],
    reviews: [
      { name: "Akosua M.", location: "Accra, Ghana", stars: 5, title: "This feels like coming home", body: "The scent, the texture, the story behind it. It's ancestral wisdom in your hands." }
    ],
  },
  {
    slug: "odo-pumice",
    id: "odo-pumice",
    range: "odo",
    name: "Odo Pumice",
    tagline: "Natural · Exfoliating Stone",
    price: 12.0,
    rating: 4.8,
    reviewCount: 34,
    origin: "Ethically sourced",
    shortBullets: [
      "100% natural volcanic pumice stone",
      "Non-toxic, plastic-free alternative to synthetic loofahs",
      "Perfect for smoothing rough skin on feet, elbows, and body",
      "Ergonomic shape fits perfectly in the palm of your hand",
    ],
    description: [
      "Complete your ritual with the Odo Pumice. Unlike synthetic loofahs that harbor bacteria and shed microplastics into the ocean, our natural volcanic pumice stone is safe, hygienic, and earth-friendly.",
      "Use it in combination with Odo Body to gently buff away dead skin cells, leaving your body exceptionally smooth and prepared to absorb oils and moisturizers."
    ],
    note: "Volcanic stone",
    formats: ["stone"],
    sizes: [
      { label: "Standard", price: 12.0 },
    ],
    fragrances: ["Unscented"],
    ingredients: [
      { name: "Natural Volcanic Pumice", note: "100% pure stone" },
    ],
    directions: "Soak skin in warm water. Wet the stone and gently rub over rough areas like heels, elbows, or body in circular motions. Rinse the stone and hang to dry.",
    benefits: [
      { icon: "🌋", title: "100% Natural", body: "Pure volcanic stone." },
      { icon: "🌍", title: "Zero Microplastics", body: "A sustainable alternative to plastic loofahs." },
      { icon: "✨", title: "Silky Smooth", body: "Effortlessly removes calluses and dead skin." },
      { icon: "🧼", title: "Hygienic", body: "Dries quickly and doesn't harbor bacteria like sponges." },
    ],
    reviews: [
      { name: "Chloe T.", location: "Bristol, UK", stars: 5, title: "Best exfoliator", body: "I threw away all my plastic loofahs. This paired with the body wash is incredible." }
    ],
  },
  {
    slug: "odo-ritual-set",
    id: "odo-ritual-set",
    range: "odo",
    name: "The Ritual Set",
    tagline: "Hands, Face, Body",
    price: 55.0,
    badge: "Save £9",
    badgeColor: "bg-brand-amber",
    rating: 5.0,
    reviewCount: 67,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "The complete Odo ecosystem: Hands, Face, and Body",
      "Arrives in a handwoven Ghanaian ritual pouch",
      "Saves £9 vs buying the items individually",
      "The perfect introduction — or a meaningful gift",
    ],
    description: [
      "The Ritual Set is the complete Odo experience. You receive Odo Hands, Odo Face, and Odo Body, arriving beautifully nestled in a handwoven pouch made by women artisans in Bolgatanga, northern Ghana.",
      "Designed as a gift — for yourself, or for someone you love to elevate their daily bathroom routine."
    ],
    note: "Limited handwoven pouches",
    formats: ["bar"],
    sizes: [{ label: "Gift Set", price: 55.0 }],
    fragrances: ["Signature Scents"],
    ingredients: [
      { name: "Odo Hands 100g" },
      { name: "Odo Face 100ml" },
      { name: "Odo Body 200g" },
      { name: "Handwoven Bolga pouch" },
    ],
    directions: "Use Odo Hands at the sink. Use Odo Face morning and night. Use Odo Body in the shower. Store your items in the pouch between washes to let them breathe.",
    benefits: [
      { icon: "🎁", title: "Ready to gift", body: "Arrives wrapped — no assembly required." },
      { icon: "🧺", title: "Handwoven pouch", body: "Made by women artisans in Bolgatanga, Ghana." },
      { icon: "💛", title: "Save £9", body: "The set is £9 less than buying separately." },
      { icon: "🌍", title: "Zero-waste", body: "Fully compostable packaging." },
    ],
    reviews: [
      { name: "Kofi B.", location: "London, UK", stars: 5, title: "The best gift I've ever given", body: "Bought this for my mum. She called me crying. The pouch alone is a work of art." }
    ],
  },
  {
    slug: "odo-gift-card",
    id: "odo-gift-card",
    range: "odo",
    name: "Odo Gift Card",
    tagline: "The Gift of Choice · Digital Delivery",
    price: 25.0,
    badge: "Gift",
    badgeColor: "bg-brand-purple",
    rating: 5.0,
    reviewCount: 18,
    origin: "Delivered by email · use anytime",
    shortBullets: [
      "Choose from £15, £25, £50 or £100 denominations",
      "Delivered instantly to your inbox — print or forward",
      "Recipient picks any Odo bar, jar, dispenser or set",
      "Never expires — give the gift of ritual on their schedule",
    ],
    description: [
      "An Odo Gift Card is the gift of choice. The recipient picks the format, the fragrance and the moment. Whether they want to start with a hand soap bar or go straight for the Ritual Set, you've handed them the door — they choose how to walk through it.",
      "Cards are sent by email within minutes of purchase, beautifully designed and ready to forward or print. They never expire, and any unused balance stays on the card for next time.",
    ],
    note: "Digital · email delivery within minutes",
    formats: ["card"],
    sizes: [
      { label: "£15", price: 15.0 },
      { label: "£25", price: 25.0 },
      { label: "£50", price: 50.0 },
      { label: "£100", price: 100.0 },
    ],
    fragrances: ["Standard design"],
    ingredients: [
      { name: "Digital gift card" },
      { name: "Personalised message" },
      { name: "Beautiful PDF design" },
    ],
    directions:
      "At checkout, enter the recipient's email and an optional personalised message. The card arrives in their inbox within minutes. They can redeem it on any Odo product at checkout.",
    benefits: [
      { icon: "🎁", title: "Effortless gift", body: "No wrapping. No shipping. Beautifully designed digital delivery." },
      { icon: "💌", title: "Personalised", body: "Add your own message and a delivery date — schedule it for their birthday." },
      { icon: "♾", title: "Never expires", body: "Unused balance stays on the card forever." },
      { icon: "🌍", title: "Zero waste", body: "Fully digital — no plastic, no card, no carbon footprint." },
    ],
    reviews: [
      { name: "Jess W.", location: "Edinburgh, UK", stars: 5, title: "Saved my Mother's Day", body: "Last-minute panic — bought this at 9pm and it was in mum's inbox before bedtime. She loved being able to pick her own bars." },
      { name: "Tomi A.", location: "London, UK", stars: 5, title: "Beautiful design", body: "The card itself is gorgeous. Felt like a proper gift, not just a code in an email." },
    ],
  },

  // ── Nkrabea · For Him ──────────────────────────────────────────────────────
  {
    slug: "nkrabea-face",
    id: "nkrabea-face",
    range: "nkrabea",
    name: "Nkrabea Face",
    tagline: "Deep Clean · Men's Charcoal Wash",
    price: 22.0,
    badge: "New Range",
    badgeColor: "bg-brand-black border border-white/20",
    rating: 4.9,
    reviewCount: 0,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "Activated charcoal draws out impurities and excess oil",
      "Black soap base strengthens the skin barrier",
      "Shea butter prevents post-wash tightness",
      "Designed for daily use on all skin types",
    ],
    description: [
      "Nkrabea Face is built for clarity. Activated charcoal and cocoa pod ash pull impurities and excess sebum from deep in the pore, while our raw shea butter base ensures skin never feels stripped or tight after washing.",
      "The result is clean, balanced, fresh-feeling skin — every morning, no fuss.",
    ],
    note: "Charcoal & Cedar notes",
    formats: ["bar", "jar"],
    sizes: [
      { label: "100g", price: 22.0 },
      { label: "200g", price: 38.0 },
    ],
    fragrances: ["Cedarwood", "Frankincense", "Peppermint", "Unscented"],
    ingredients: [
      { name: "Activated Charcoal", note: "Food-grade" },
      { name: "Shea Butter", note: "Northern Ghana" },
      { name: "Black Soap Base", note: "Kumasi, Ashanti" },
      { name: "Cocoa Pod Ash", note: "Eastern Region" },
      { name: "Cedarwood Essential Oil" },
    ],
    directions: "Wet face with warm water. Work the bar into a lather and massage into skin for 30–60 seconds. Rinse with cool water and pat dry.",
    benefits: [
      { icon: "⚫", title: "Deep Clean", body: "Charcoal pulls oil and debris from the pore." },
      { icon: "🌿", title: "No Stripping", body: "Shea butter keeps the barrier intact." },
      { icon: "💧", title: "Daily Use", body: "Balanced formula for morning and night." },
      { icon: "🧴", title: "Hormone-safe", body: "Zero synthetic fragrance or parabens." },
    ],
    reviews: [],
  },
  {
    slug: "nkrabea-body",
    id: "nkrabea-body",
    range: "nkrabea",
    name: "Nkrabea Body",
    tagline: "Strength & Recovery · Body Wash",
    price: 20.0,
    badge: "New Range",
    badgeColor: "bg-brand-black border border-white/20",
    rating: 4.9,
    reviewCount: 0,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "Rich, dense lather built for daily showers",
      "Soothes razor burn, ingrown hairs, and body breakouts",
      "Cedarwood and black pepper essential oils — earthy and grounding",
      "Anti-inflammatory shea base calms skin post-workout",
    ],
    description: [
      "Nkrabea Body is a no-compromise wash for men who know what goes on their skin matters. A dense, luxurious black soap lather scented with Cedarwood and Black Pepper — grounding, masculine, and completely free of synthetic fragrance.",
      "Long-lasting solid bar format — one bar outlasts three bottles of shower gel.",
    ],
    note: "Cedarwood & Black Pepper",
    formats: ["bar", "jar"],
    sizes: [
      { label: "200g", price: 20.0 },
      { label: "400g", price: 36.0 },
    ],
    fragrances: ["Cedarwood", "Frankincense", "Wild Orange", "Unscented"],
    ingredients: [
      { name: "Shea Butter", note: "Northern Ghana" },
      { name: "Black Soap Base", note: "Kumasi, Ashanti" },
      { name: "Coconut Oil", note: "Volta Region" },
      { name: "Cedarwood Essential Oil" },
      { name: "Black Pepper Essential Oil" },
    ],
    directions: "In the shower, work the bar into a rich lather. Massage into skin from shoulders to feet. Leave for 30 seconds and rinse. Hang bar to dry between uses.",
    benefits: [
      { icon: "🌲", title: "Grounding Scent", body: "Cedarwood and black pepper — no synthetic fragrance." },
      { icon: "🔥", title: "Post-workout", body: "Anti-inflammatory shea soothes tired muscles." },
      { icon: "🪒", title: "Razor Calm", body: "Reduces ingrown hairs and razor burn." },
      { icon: "💪", title: "Long-lasting", body: "One bar replaces three bottles of shower gel." },
    ],
    reviews: [],
  },
  {
    slug: "nkrabea-shave",
    id: "nkrabea-shave",
    range: "nkrabea",
    name: "Nkrabea Shave",
    tagline: "Precision · Shave Soap Bar",
    price: 18.0,
    badge: "New Range",
    badgeColor: "bg-brand-black border border-white/20",
    rating: 5.0,
    reviewCount: 0,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "Dense, cushioning lather for a close, comfortable shave",
      "Anti-inflammatory formula reduces razor burn and irritation",
      "Shea butter and palm kernel oil soften stubble before the blade",
      "Works with any shave brush or directly by hand",
    ],
    description: [
      "Nkrabea Shave replaces every aerosol can in your bathroom. A traditional hard soap lather that creates dense, glycerin-rich foam to lift stubble, cushion the blade, and leave skin calm after every shave.",
      "Formulated with the same black soap heritage base as the full Nkrabea range.",
    ],
    note: "Sandalwood & Vetiver",
    formats: ["bar"],
    sizes: [
      { label: "100g", price: 18.0 },
      { label: "200g", price: 30.0 },
    ],
    fragrances: ["Sandalwood & Vetiver", "Frankincense", "Unscented"],
    ingredients: [
      { name: "Shea Butter", note: "Northern Ghana" },
      { name: "Black Soap Base", note: "Kumasi, Ashanti" },
      { name: "Palm Kernel Oil", note: "Western Ghana" },
      { name: "Sandalwood Essential Oil" },
      { name: "Vetiver Essential Oil" },
    ],
    directions: "Wet the bar and face. Swirl a damp brush on the bar, then work into the beard in circles. Shave as normal. No brush? Rub directly onto damp skin and lather with hands.",
    benefits: [
      { icon: "🪒", title: "Close Shave", body: "Dense lather lifts and softens stubble." },
      { icon: "🕊", title: "Calm Skin", body: "Anti-inflammatory formula cuts razor burn." },
      { icon: "🌿", title: "No Aerosol", body: "Zero synthetic propellants or chemicals." },
      { icon: "🏺", title: "Sandalwood", body: "Deep, warm, heritage scent." },
    ],
    reviews: [],
  },
  {
    slug: "nkrabea-ritual-set",
    id: "nkrabea-ritual-set",
    range: "nkrabea",
    name: "The Nkrabea Set",
    tagline: "Face, Body, Shave · Men's Ritual",
    price: 52.0,
    badge: "New Range",
    badgeColor: "bg-brand-black border border-white/20",
    rating: 5.0,
    reviewCount: 0,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "The complete Nkrabea trio: Face, Body, Shave",
      "Arrives in a handwoven Ghanaian ritual pouch",
      "Saves £8 vs buying the items individually",
      "The perfect introduction — or a meaningful gift for him",
    ],
    description: [
      "The Nkrabea Set brings the complete men's ritual together. Nkrabea Face, Nkrabea Body, and Nkrabea Shave — all three, arriving in a handwoven pouch made by women artisans in Bolgatanga, northern Ghana.",
      "Everything a man needs, in one considered package.",
    ],
    note: "Limited handwoven pouches",
    formats: ["bar"],
    sizes: [{ label: "Gift Set", price: 52.0 }],
    fragrances: ["Signature Nkrabea Scents"],
    ingredients: [
      { name: "Nkrabea Face 100g" },
      { name: "Nkrabea Body 200g" },
      { name: "Nkrabea Shave 100g" },
      { name: "Handwoven Bolga pouch" },
    ],
    directions: "Use Nkrabea Face morning and night. Use Nkrabea Body in the shower. Use Nkrabea Shave before the blade. Store everything in the pouch between uses.",
    benefits: [
      { icon: "🎁", title: "Ready to gift", body: "Arrives wrapped — no assembly required." },
      { icon: "🧺", title: "Handwoven pouch", body: "Made by women artisans in Bolgatanga, Ghana." },
      { icon: "💛", title: "Save £8", body: "The set is £8 less than buying separately." },
      { icon: "🌍", title: "Zero-waste", body: "Fully compostable packaging." },
    ],
    reviews: [],
  },
  {
    slug: "black-soap",
    id: "black-soap",
    range: "unisex",
    name: "Original Black Soap",
    tagline: "The Signature · Unisex Formula",
    price: 12.0,
    badge: "Felicia's Original",
    badgeColor: "bg-brand-purple",
    rating: 5.0,
    reviewCount: 214,
    origin: "Handcrafted in Accra, Ghana",
    shortBullets: [
      "Felicia's original formula — the soap that started it all",
      "Works on face, body, and hands — one bar does everything",
      "100% raw African black soap: no sulphates, no synthetics, ever",
      "Suitable for all skin types including sensitive and acne-prone",
    ],
    description: [
      "Before Odo. Before Nkrabea. There was this. Felicia's original black soap — the formula she gave to neighbours, sold at markets, and perfected over years of listening to what skin actually needs.",
      "Made from plantain ash, raw shea butter, palm kernel oil, and cocoa pod ash, sourced from farms across Ghana. It lathers gently, cleanses deeply, and leaves skin soft without stripping it. Use it everywhere. Face, body, hands — it does it all.",
      "This is the soap Felicia is known for. Simple. Honest. Unbeatable.",
    ],
    note: "The one that started it all",
    formats: ["bar", "jar", "sachet"],
    sizes: [{ label: "100g", price: 12.0 }],
    formatSizes: {
      bar: [
        { label: "100g", price: 12.0 },
        { label: "200g", price: 22.0 },
      ],
      jar: [
        { label: "250ml", price: 24.0 },
        { label: "500ml", price: 42.0 },
      ],
      sachet: [
        { label: "Single Sachet", price: 5.0 },
        { label: "3 Sachets", price: 13.0 },
        { label: "6 Sachets", price: 24.0 },
      ],
    },
    formatContent: {
      bar: {
        tagline: "Black Soap · Solid Bar",
        description: ["The classic. Cut from a hand-poured batch, wrapped in kraft paper. Works on face, body, and hands."],
      },
      jar: {
        tagline: "Black Soap · Liquid Jar",
        description: ["The original formula in a pourable liquid form. Same ingredients, same effect — perfect for the shower or bathroom sink."],
      },
      sachet: {
        tagline: "Black Soap · Travel Sachet",
        description: ["Single-use sachets of the liquid formula. Take the ritual anywhere."],
      },
    },
    fragrances: ["Unscented", "Wild Orange", "Lavender", "Frankincense"],
    ingredients: [
      { name: "Plantain Skin Ash", note: "Volta Region, Ghana" },
      { name: "Raw Shea Butter", note: "Northern Ghana" },
      { name: "Palm Kernel Oil", note: "Western Ghana" },
      { name: "Cocoa Pod Ash", note: "Eastern Region, Ghana" },
      { name: "Water" },
    ],
    directions: "Wet skin, lather the bar between your hands or directly on skin. Rinse well. Use on face, body, or hands. No limit — this soap does it all.",
    benefits: [
      { icon: "✦", title: "One bar, everywhere", body: "Face, body, hands — formulated to work on all of them." },
      { icon: "🌿", title: "Five ingredients", body: "Nothing hidden. Everything sourced from named Ghanaian farms." },
      { icon: "💧", title: "Doesn't dry you out", body: "Raw shea keeps moisture locked in after every wash." },
      { icon: "🌍", title: "The original", body: "This is the formula Felicia built her name on." },
    ],
    reviews: [
      { name: "Priya T.", location: "Birmingham, UK", stars: 5, title: "Never buying another soap", body: "I've tried everything. This is the only soap that doesn't make my skin feel tight after washing. And it works on my face too — I've thrown out my face wash." },
      { name: "Marcus O.", location: "London, UK", stars: 5, title: "Simple and brilliant", body: "My partner got this and now we share it. One bar on the bathroom shelf, does everything. Skin feels genuinely different after two weeks." },
      { name: "Yaa B.", location: "Manchester, UK", stars: 5, title: "Grew up with black soap, this is the real thing", body: "My mum used to make something similar. This tastes me back home. The quality is exactly right — not the stuff you get in generic shops." },
    ],
  },
];

// ── Override layer ────────────────────────────────────────────────────────────
//
// Admin edits live in localStorage (src/lib/admin/productOverrides.ts).
// applyOverride() merges them on top of the static catalog at read time.
// On the server this is a no-op — SSR renders defaults; the client re-merges
// on hydration. Once a real DB lands, `loadOverrides()` becomes a fetch.

interface OverrideShape {
  slug: string;
  price?: number;
  salePrice?: number;
  onSale?: boolean;
  description?: string[];
  image?: string;
  badge?: string;
  badgeColor?: string;
  archived?: boolean;
  hidden?: boolean;
  stockSku?: string;
  showLowStock?: boolean;
}

interface CustomProduct extends Product {
  _custom: true;
}

function loadOverrides(): Record<string, OverrideShape> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("lk_admin_product_overrides_v1") || "{}"); }
  catch { return {}; }
}

function loadCustomProducts(): CustomProduct[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("lk_admin_custom_products_v1") || "[]"); }
  catch { return []; }
}

function loadInventory(): Record<string, { onHand: number; reserved: number; lowAt: number; unlimited?: boolean }> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("lk_admin_inventory_v1") || "{}"); }
  catch { return {}; }
}

function applyOverride(p: Product, o: OverrideShape | undefined): Product {
  if (!o) return p;
  return {
    ...p,
    price:        o.price        ?? p.price,
    salePrice:    o.salePrice    ?? p.salePrice,
    onSale:       o.onSale       ?? p.onSale,
    description:  o.description  ?? p.description,
    image:        o.image        ?? p.image,
    badge:        o.badge        ?? p.badge,
    badgeColor:   o.badgeColor   ?? p.badgeColor,
    archived:     o.archived     ?? p.archived,
    hidden:       o.hidden ?? p.hidden,
    stockSku:     o.stockSku     ?? p.stockSku,
    showLowStock: o.showLowStock ?? p.showLowStock,
  };
}

function withAvailable(p: Product, inv: Record<string, { onHand: number; reserved: number; lowAt: number; unlimited?: boolean }>): Product {
  if (!p.stockSku) return p;
  const item = inv[p.stockSku];
  if (!item) return p;
  if (item.unlimited) return p; // unlimited stock — don't expose `available`, never sold-out
  return { ...p, available: Math.max(0, item.onHand - item.reserved) };
}

export function getProduct(slug: string): Product | undefined {
  const inv = loadInventory();
  const overrides = loadOverrides();
  const base = [...PRODUCTS, ...loadCustomProducts()].find((p) => p.slug === slug);
  if (!base) return undefined;
  return withAvailable(applyOverride(base, overrides[slug]), inv);
}

export function getProducts(opts?: { includeHidden?: boolean }): Product[] {
  const overrides = loadOverrides();
  const inv = loadInventory();
  const all = [...PRODUCTS, ...loadCustomProducts()];
  return all
    .map((p) => withAvailable(applyOverride(p, overrides[p.slug]), inv))
    .filter((p) => opts?.includeHidden || !p.hidden);
}

export const CHANGE_EVENT = "lk-products-change";

export function onProductsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const events = [CHANGE_EVENT, "lk-admin-products-change", "storage"];
  events.forEach(e => window.addEventListener(e, handler));
  return () => events.forEach(e => window.removeEventListener(e, handler));
}
