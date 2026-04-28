export interface ProductSize {
  label: string;
  price: number;
}

export type ProductFormat = "bar" | "jar" | "dispenser" | "sachet" | "stone";

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
  name: string;
  tagline: string;
  price: number;
  salePrice?: number;
  badge?: string;
  badgeColor?: string;
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
}

export const PRODUCTS: Product[] = [
  {
    slug: "odo-hands",
    id: "odo-hands",
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
          "Zero parabens, SLS, or hormone-disrupting additives",
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
      { icon: "🕊", title: "Hormone-safe", body: "Free from parabens, SLS, and synthetic fragrance." },
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
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}
