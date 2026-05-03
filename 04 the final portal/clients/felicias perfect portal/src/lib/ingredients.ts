export interface IngredientDetail {
  slug: string;
  name: string;
  origin: string;
  oneLiner: string;
  image: string;
  imageAlt: string;
  partner: string;
  sourcing: string;
  processing: string;
  benefits: string[];
  usedIn: string[];
}

// Photos hosted on Unsplash. Hostname is allow-listed in next.config.ts.
export const INGREDIENTS: IngredientDetail[] = [
  {
    slug: "shea-butter",
    name: "Shea Butter",
    origin: "Northern Ghana",
    oneLiner: "Deep moisture and skin barrier repair.",
    image: "/images/ingredients/shea-butter.png",
    imageAlt: "Raw shea butter being hand-pressed in a wooden bowl",
    partner: "Bolgatanga Women's Shea Co-operative",
    sourcing:
      "Karité nuts are hand-collected during the rainy season by women across northern Ghana. They are sun-dried, roasted gently, ground, and kneaded by hand into raw butter. We are the co-op's largest UK buyer and pay above-market rates direct.",
    processing:
      "Cold-clarified — never bleached, deodorised or hexane-extracted. Retains its full vitamin A, E and F content along with its natural nutty scent.",
    benefits: [
      "Restores the skin barrier with every wash",
      "Rich in vitamins A and E for skin elasticity",
      "Naturally anti-inflammatory — calms reactive skin",
      "Provides UV-A and UV-B protection (SPF ~6)",
    ],
    usedIn: ["Odo Hands", "Odo Face", "Odo Body"],
  },
  {
    slug: "black-soap-base",
    name: "Black Soap Base",
    origin: "Kumasi, Ashanti",
    oneLiner: "Gentle cleansing with antimicrobial properties.",
    image: "/images/ingredients/black-soap-base.png",
    imageAlt: "Traditional Ghanaian black soap blocks stacked together",
    partner: "Ashanti Soapmakers' Collective",
    sourcing:
      "Plantain skins, cocoa pod husks and palm leaves are sun-dried and slow-roasted in clay ovens for 24 hours. The ash is sifted and combined with cold-pressed shea oil and palm kernel oil — the recipe is unchanged from how it was made 400 years ago in the Ashanti kingdom.",
    processing:
      "Cured for a minimum of 28 days in open trays. Each batch is pH-tested and trimmed by hand before it ships to our Accra workshop.",
    benefits: [
      "Naturally cleansing without sulphates or surfactants",
      "Mildly antimicrobial — supports clear skin",
      "Balances oil production",
      "Fully biodegradable — what washes off doesn't pollute",
    ],
    usedIn: ["Odo Hands", "Odo Face", "Odo Body", "Odo Radiance"],
  },
  {
    slug: "cocoa-pod-ash",
    name: "Cocoa Pod Ash",
    origin: "Eastern Region",
    oneLiner: "Natural exfoliant; balances skin pH.",
    image: "/images/ingredients/cocoa-pod-ash.png",
    imageAlt: "Cocoa pods cracked open showing beans",
    partner: "Suhum Cocoa Pod Collective",
    sourcing:
      "Spent cocoa pods are usually discarded as waste after the beans are harvested. We pay 23 farmers in Suhum a second income for the pods, which they sun-dry and slow-roast on traditional wood fires.",
    processing:
      "The carbonised pods are ground to a fine, talc-soft powder. Particle size is below 200 microns — small enough to lift dullness without scratching.",
    benefits: [
      "Polishes away dull, dead skin without abrasion",
      "Balances skin pH naturally (~5.5)",
      "Rich in potassium for cellular hydration",
      "Up-cycles waste from existing chocolate production",
    ],
    usedIn: ["Odo Radiance", "Odo Face"],
  },
  {
    slug: "palm-kernel-oil",
    name: "Palm Kernel Oil",
    origin: "Western Ghana",
    oneLiner: "Rich in antioxidants; protects the skin barrier.",
    image: "/images/ingredients/palm-kernel-oil.png",
    imageAlt: "Palm kernel nuts in a wooden bowl",
    partner: "Tarkwa Smallholder Federation",
    sourcing:
      "From mixed-species agroforestry plots — entirely different to the industrial monoculture palm oil linked to deforestation. The federation has been certified by the Ghana Cocoa Board for sustainable land use since 2018.",
    processing:
      "Kernels are cracked, expeller-pressed cold (no hexane, no heat above 50°C) and bottle-filtered. The oil retains its golden hue and natural scent.",
    benefits: [
      "Saturated with vitamin K and tocotrienols",
      "Helps lather without sulphates — soap behaves like soap",
      "Locks in moisture without leaving a film",
      "Stable and long-lasting in cold-process bars",
    ],
    usedIn: ["Odo Hands", "Odo Body", "Odo Original"],
  },
  {
    slug: "plantain-skin",
    name: "Plantain Skin",
    origin: "Brong-Ahafo",
    oneLiner: "Vitamins A, E and K for radiant skin.",
    image: "/images/ingredients/plantain-skin.png",
    imageAlt: "Ripe plantains on a market stall",
    partner: "Sunyani Women's Plantain Co-op",
    sourcing:
      "Plantain skins are usually composted after the fruit is sold. The co-op now sells them to us as a second income stream — a model we hope to see more brands adopt.",
    processing:
      "Skins are sun-dried, slow-roasted on wood fires and ground to a fine ash. The ash is sifted three times before it joins the soap base.",
    benefits: [
      "Vitamins A, E and K for visible radiance",
      "Gentle exfoliation suited to facial skin",
      "Rich in potassium and magnesium",
      "Helps even out skin tone with regular use",
    ],
    usedIn: ["Odo Radiance"],
  },
  {
    slug: "coconut-oil",
    name: "Coconut Oil",
    origin: "Volta Region",
    oneLiner: "Anti-inflammatory and supports healing.",
    image: "/images/ingredients/coconut-oil.png",
    imageAlt: "Cracked coconut beside a glass jar of coconut oil",
    partner: "Keta Coast Coconut Farmers",
    sourcing:
      "Smallholder farmers along the Volta coastline use the wet-mill method — coconuts are husked the day they're picked and the milk is pressed within 12 hours, retaining far more antioxidants than dry-milled commodity oil.",
    processing:
      "Cold-pressed and double-filtered. Solidifies below 24°C — that solid-to-liquid transition is a quick test for purity (industrial coconut oil with additives won't do it).",
    benefits: [
      "Lauric acid for natural antimicrobial action",
      "Supports skin healing after irritation",
      "Lightweight, non-greasy moisture",
      "Pleasant, naturally clean scent — no fragrance needed",
    ],
    usedIn: ["Odo Hands", "Odo Face", "Odo Body"],
  },
  {
    slug: "wild-orange-oil",
    name: "Wild Orange Oil (doTERRA)",
    origin: "Brazil → distilled in Ghana",
    oneLiner: "Mood-lifting citrus, no synthetic fragrance.",
    image: "/images/ingredients/wild-orange.png",
    imageAlt: "Sliced oranges and a small bottle of essential oil",
    partner: "doTERRA Co-Impact Sourcing",
    sourcing:
      "We source through doTERRA's Co-Impact program — pesticide-free oranges, fair pay to growers, and full third-party purity testing on every batch.",
    processing:
      "Cold-pressed from the rind of sun-ripened oranges. Steam-cleaned to remove furocoumarins (the photosensitiser in cheaper citrus oils).",
    benefits: [
      "Naturally mood-lifting — clinically shown to lower cortisol",
      "Brightens skin tone with regular use",
      "Replaces synthetic ‘orange’ fragrance entirely",
      "Phototoxicity-tested — safe for daily skin contact",
    ],
    usedIn: ["Odo Hands (Wild Orange)", "Odo Face (Wild Orange)"],
  },
  {
    slug: "lavender-oil",
    name: "Lavender Oil",
    origin: "Provence, France",
    oneLiner: "Calms skin and quiets the mind.",
    image: "/images/ingredients/lavender.png",
    imageAlt: "Field of lavender in bloom",
    partner: "Provence Co-operative L'Occitane",
    sourcing:
      "True lavender (Lavandula angustifolia) — not the cheaper lavandin hybrid common in mass-market products. From a co-operative of 14 family farms in the Drôme valley.",
    processing:
      "Steam-distilled within 48 hours of harvest. We test every batch with GC-MS to confirm linalool / linalyl-acetate ratios — the markers of true lavender.",
    benefits: [
      "Calms inflamed and reactive skin",
      "Mildly antiseptic — supports skin healing",
      "Nervine herb — proven to ease anxiety in clinical use",
      "Replaces synthetic ‘lavender’ fragrance entirely",
    ],
    usedIn: ["Odo Hands (Lavender)", "Odo Body (Lavender)"],
  },
];

export function getIngredient(slug: string) {
  return INGREDIENTS.find((i) => i.slug === slug);
}
