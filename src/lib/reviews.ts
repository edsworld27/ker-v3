export interface Review {
  quote: string;
  name: string;
  location: string;
  stars: number;
  product?: string;
}

export const REVIEWS: Review[] = [
  {
    quote:
      "I'd struggled with hormone imbalances for years and had no idea my soap could be a contributing factor. Since switching to Odo, my skin feels completely different — softer, calmer, alive. I'll never go back.",
    name: "Abena K.",
    location: "London, UK",
    stars: 5,
    product: "Odo Body",
  },
  {
    quote:
      "As a Ghanaian woman, this soap feels like coming home. The scent, the texture, the story behind it — Felicia has bottled something truly special. It's ancestral wisdom in your hands.",
    name: "Akosua M.",
    location: "Accra, Ghana",
    stars: 5,
    product: "Odo Hands",
  },
  {
    quote:
      "I'm a dermatologist and I'm genuinely impressed. The ingredient list is something I can actually stand behind — no parabens, no sulphates, no synthetic fragrance. My patients with sensitive skin love it.",
    name: "Dr. Sarah T.",
    location: "Birmingham, UK",
    stars: 5,
    product: "Odo Face",
  },
  {
    quote:
      "I've tried every 'clean' soap on the market and nothing comes close. The shea butter is so rich my skin doesn't need a moisturiser after. My partner has stolen mine, so I had to order two.",
    name: "Priya R.",
    location: "Manchester, UK",
    stars: 5,
    product: "Odo Body",
  },
  {
    quote:
      "Bought this on a friend's recommendation while pregnant. The peace of mind from knowing exactly what's in it is worth the price alone. Skin is happier than it's been in years.",
    name: "Hannah L.",
    location: "Bristol, UK",
    stars: 5,
    product: "Odo Face",
  },
  {
    quote:
      "The handwoven pouch in the Ritual Set is a piece of art. The bars themselves are unreal. This is the first brand I've actually felt good about being a customer of.",
    name: "Nana A.",
    location: "Accra, Ghana",
    stars: 5,
    product: "The Ritual Set",
  },
  {
    quote:
      "Genuinely the best soap I've ever used and I don't say that lightly. I'm 47 and my skin has the bounce back it had at 27. I will keep buying this for the rest of my life.",
    name: "Marie D.",
    location: "Edinburgh, UK",
    stars: 5,
    product: "Odo Body",
  },
  {
    quote:
      "Bought this for myself after my partner kept stealing hers. I had no idea what I'd been missing — my skin actually feels different. Razor burn is gone. I'm a convert.",
    name: "James O.",
    location: "Leeds, UK",
    stars: 5,
    product: "Odo Hands",
  },
  {
    quote:
      "Got the gift set for my dad's birthday — he's not the type to comment on skincare. Two weeks later he asked me to order him another one. That tells you everything.",
    name: "Kofi B.",
    location: "London, UK",
    stars: 5,
    product: "The Ritual Set",
  },
  {
    quote:
      "The Pumice bar changed my routine completely. My heels have never been smoother. I've recommended it to everyone I know.",
    name: "Yaa S.",
    location: "Kumasi, Ghana",
    stars: 5,
    product: "Odo Pumice",
  },
  {
    quote:
      "I was skeptical at first — another 'natural' brand. But this one is different. You can feel the quality the moment you open the box. My skin barrier has never felt this strong.",
    name: "Fatima D.",
    location: "Paris, France",
    stars: 5,
    product: "Odo Face",
  },
  {
    quote:
      "The Ritual Set was the best gift I've ever given myself. The whole experience — from the packaging to the lather — is something I look forward to every morning.",
    name: "Sena A.",
    location: "Accra, Ghana",
    stars: 5,
    product: "The Ritual Set",
  },
];

export const PRODUCTS = [
  "All Products",
  "Odo Hands",
  "Odo Face",
  "Odo Body",
  "Odo Pumice",
  "The Ritual Set",
  "Nkrabea Face",
  "Nkrabea Body",
  "Nkrabea Shave",
  "The Nkrabea Set",
] as const;

export type ProductFilter = (typeof PRODUCTS)[number];
