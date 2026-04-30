// Schema describing every editable field on the site. The admin Website
// editor renders forms from this; storefront components read values via
// useContent(key, default). Keep keys stable — renaming breaks existing
// overrides. Adding new keys is safe.

export type FieldType = "text" | "textarea" | "image" | "code" | "url" | "boolean";

export interface ContentField {
  key: string;
  label: string;
  type: FieldType;
  default: string;
  hint?: string;
}

export interface ContentSection {
  id: string;
  label: string;
  fields: ContentField[];
}

export interface PageSchema {
  id: string;
  label: string;
  href: string;
  description?: string;
  sections: ContentSection[];
}

export const PAGE_SCHEMAS: PageSchema[] = [
  // ── Homepage ─────────────────────────────────────────────────────────────
  {
    id: "home",
    label: "Homepage",
    href: "/",
    description: "Hero, featured products, problem, solution, social strip and testimonials.",
    sections: [
      {
        id: "hero",
        label: "Hero",
        fields: [
          { key: "home.hero.eyebrow",          label: "Eyebrow",                 type: "text",     default: "Pure Ghanaian black soap · Handcrafted in Accra" },
          { key: "home.hero.headlinePrefix",   label: "Headline (before highlight)", type: "text", default: "All natural" },
          { key: "home.hero.headlineHighlight",label: "Headline (highlight)",    type: "text",     default: "African soap" },
          { key: "home.hero.tagline",          label: "Tagline",                 type: "textarea", default: "A ritual born from the soil of Ghana. Pure, sacred, and alive with ancestral wisdom — crafted to restore what modern life has taken." },
          { key: "home.hero.ctaPrimary",       label: "Primary CTA label",       type: "text",     default: "Explore our ranges" },
          { key: "home.hero.ctaSecondary",     label: "Secondary CTA label",     type: "text",     default: "Our Story" },
          { key: "home.hero.image",            label: "Hero image",              type: "image",    default: "/images/hero/elephants.png" },
          { key: "home.hero.imageAlt",         label: "Hero image alt text",     type: "text",     default: "Elephants in the African landscape" },
          { key: "home.hero.stat1Value",       label: "Stat 1 — value",          type: "text",     default: "100%" },
          { key: "home.hero.stat1Label",       label: "Stat 1 — label",          type: "text",     default: "Natural ingredients" },
          { key: "home.hero.stat2Value",       label: "Stat 2 — value",          type: "text",     default: "0" },
          { key: "home.hero.stat2Label",       label: "Stat 2 — label",          type: "text",     default: "Sulphates or synthetics" },
          { key: "home.hero.stat3Value",       label: "Stat 3 — value",          type: "text",     default: "3" },
          { key: "home.hero.stat3Label",       label: "Stat 3 — label",          type: "text",     default: "Independent lab partners" },
        ],
      },
      {
        id: "problem",
        label: "Problem section",
        fields: [
          { key: "home.problem.eyebrow",   label: "Eyebrow",   type: "text",     default: "The Problem" },
          { key: "home.problem.headline1", label: "Headline (before highlight)", type: "text", default: "They called it" },
          { key: "home.problem.headline2", label: "Headline (highlight)", type: "text", default: "care." },
          { key: "home.problem.headline3", label: "Headline (after highlight)", type: "text", default: " Take it back." },
          { key: "home.problem.body",      label: "Body copy", type: "textarea", default: "Mass-market brands have spent decades loading our skin with sulphates, phthalates, and synthetic chemicals hidden behind the word “fragrance.” Raw, clean power for men. Divine, untouched skin for women. Odo strips it back to what our bodies actually deserve — and nothing they don't." },
        ],
      },
      {
        id: "solution",
        label: "Solution section",
        fields: [
          { key: "home.solution.eyebrow",   label: "Eyebrow",   type: "text",     default: "The Answer" },
          { key: "home.solution.headline1", label: "Headline (before highlight)", type: "text", default: "A gift carried across" },
          { key: "home.solution.headline2", label: "Headline (highlight)", type: "text", default: "generations" },
          { key: "home.solution.body1",     label: "Body — paragraph 1", type: "textarea", default: "Odo is the Twi word for love. It is more than a name — it is the philosophy behind every bar. Created by Felicia, drawing on centuries of Ghanaian skincare wisdom passed from grandmother to daughter, generation to generation." },
          { key: "home.solution.body2",     label: "Body — paragraph 2", type: "textarea", default: "Every ingredient is sourced directly from Ghanaian farmers. No middlemen. No shortcuts. No compromises. Just the earth in its purest form, pressed into your palms." },
        ],
      },
      {
        id: "featured",
        label: "Featured products section",
        fields: [
          { key: "home.featured.eyebrow",  label: "Eyebrow",  type: "text",     default: "Featured" },
          { key: "home.featured.headline", label: "Headline", type: "text",     default: "Start your ritual." },
          { key: "home.featured.tagline",  label: "Tagline",  type: "textarea", default: "Three products. One for every skin need." },
        ],
      },
      {
        id: "testimonials",
        label: "Testimonials section",
        fields: [
          { key: "home.testimonials.eyebrow",   label: "Eyebrow",   type: "text",     default: "Stories" },
          { key: "home.testimonials.headline1", label: "Headline (before highlight)", type: "text", default: "What people are" },
          { key: "home.testimonials.headline2", label: "Headline (highlight)", type: "text", default: "actually saying" },
          { key: "home.testimonials.intro",     label: "Intro",     type: "textarea", default: "Real DMs. Real reposts. Real customers — men and women, mothers and fathers, dermatologists and daughters. We don't pay for testimonials and we don't curate them." },
          { key: "home.testimonials.stat1Big",  label: "Stat 1 — value",  type: "text", default: "4.9" },
          { key: "home.testimonials.stat1Small",label: "Stat 1 — label",  type: "text", default: "Average rating" },
          { key: "home.testimonials.stat2Big",  label: "Stat 2 — value",  type: "text", default: "3,400+" },
          { key: "home.testimonials.stat2Small",label: "Stat 2 — label",  type: "text", default: "Happy customers" },
          { key: "home.testimonials.stat3Big",  label: "Stat 3 — value",  type: "text", default: "91%" },
          { key: "home.testimonials.stat3Small",label: "Stat 3 — label",  type: "text", default: "Buy again within 90 days" },
          { key: "home.testimonials.stat4Big",  label: "Stat 4 — value",  type: "text", default: "0" },
          { key: "home.testimonials.stat4Small",label: "Stat 4 — label",  type: "text", default: "Synthetic ingredients · ever" },
        ],
      },
    ],
  },

  // ── Navbar ───────────────────────────────────────────────────────────────
  {
    id: "navbar",
    label: "Navigation bar",
    href: "/",
    description: "Brand wordmark shown across every page.",
    sections: [
      {
        id: "brand",
        label: "Brand",
        fields: [
          { key: "navbar.wordmark1", label: "Wordmark — left", type: "text", default: "LUV" },
          { key: "navbar.wordmark2", label: "Wordmark — right", type: "text", default: "KER" },
          { key: "navbar.subtitle",  label: "Subtitle (under wordmark, mobile)", type: "text", default: "Odo by Felicia" },
        ],
      },
    ],
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  {
    id: "footer",
    label: "Footer",
    href: "/",
    description: "Brand description and contact text shown on every page.",
    sections: [
      {
        id: "brand",
        label: "Brand",
        fields: [
          { key: "footer.tagline",     label: "Brand tagline",       type: "text",     default: "Odo by Felicia" },
          { key: "footer.description", label: "Brand description",   type: "textarea", default: "Pure. Sacred. Alive. Ghanaian heritage skincare for those who demand honesty from everything they put on their skin." },
        ],
      },
    ],
  },

  // ── About page ───────────────────────────────────────────────────────────
  {
    id: "about", label: "About page", href: "/about", description: "Brand story page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "about.hero.eyebrow",   label: "Eyebrow",   type: "text",     default: "About Luv & Ker" },
      { key: "about.hero.headline1", label: "Headline (line 1)", type: "text", default: "Everything we are," },
      { key: "about.hero.headline2", label: "Headline (line 2 — highlight)", type: "text", default: "nothing we hide." },
      { key: "about.hero.intro",     label: "Intro paragraph", type: "textarea", default: "The journey from a kitchen in Accra to your bathroom. The chemicals we built Odo without. The farmers who grow what goes inside. The way we ship it. The culture that holds it all together." },
    ]}],
  },

  // ── Our Story page ───────────────────────────────────────────────────────
  {
    id: "our-story", label: "Our Story page", href: "/our-story", description: "Felicia's origin story header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "our-story.hero.eyebrow",  label: "Eyebrow",  type: "text",     default: "Our Story" },
      { key: "our-story.hero.headline", label: "Headline", type: "text",     default: "A gift carried across generations" },
      { key: "our-story.hero.intro",    label: "Intro",    type: "textarea", default: "Odo is the Twi word for love. Every bar is built on Ghanaian skincare wisdom passed from grandmother to daughter, generation to generation." },
    ]}],
  },

  // ── Our Philosophy page ──────────────────────────────────────────────────
  {
    id: "our-philosophy", label: "Our Philosophy page", href: "/our-philosophy", description: "Brand philosophy page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "our-philosophy.hero.eyebrow",   label: "Eyebrow",   type: "text",     default: "Luv & Ker" },
      { key: "our-philosophy.hero.headline1", label: "Headline (line 1, before highlight)", type: "text", default: "Our" },
      { key: "our-philosophy.hero.headline2", label: "Headline (line 1, highlight)", type: "text", default: "philosophy" },
      { key: "our-philosophy.hero.headline3", label: "Headline (line 1, after highlight)", type: "text", default: "is simple." },
      { key: "our-philosophy.hero.headline4", label: "Headline (line 2)", type: "text", default: "Your skin deserves the truth." },
      { key: "our-philosophy.hero.intro",     label: "Intro (first paragraph)", type: "textarea", default: "Luv & Ker was built on a single belief: that skincare should honour the body, not compromise it. Whether you reach for Odo — our women's range rooted in love — or Nkrabea, our men's range built on strength and destiny, the promise underneath is identical." },
    ]}],
  },

  // ── The Problem page ─────────────────────────────────────────────────────
  {
    id: "the-problem", label: "The Problem page", href: "/the-problem", description: "Long-form problem page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "the-problem.hero.eyebrow",   label: "Eyebrow", type: "text", default: "The Problem" },
      { key: "the-problem.hero.headline1", label: "Headline line 1 (before highlight)", type: "text", default: "They told us beauty was" },
      { key: "the-problem.hero.headline2", label: "Headline line 1 (highlight)", type: "text", default: "pain." },
      { key: "the-problem.hero.headline3", label: "Headline line 2", type: "text", default: "They lied." },
      { key: "the-problem.hero.intro",     label: "Intro (first paragraph)", type: "textarea", default: "For centuries women have been sold the same story — that to be radiant, you must suffer. That to be soft, you must burn. That to glow, you must absorb a hundred chemicals you cannot pronounce." },
    ]}],
  },

  // ── Ingredients page ─────────────────────────────────────────────────────
  {
    id: "ingredients", label: "Ingredients page", href: "/ingredients", description: "Ingredient sourcing page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "ingredients.hero.eyebrow",  label: "Eyebrow",  type: "text",     default: "Ingredients" },
      { key: "ingredients.hero.headline", label: "Headline", type: "text",     default: "Every element has a name, a region, a story" },
      { key: "ingredients.hero.intro",    label: "Intro",    type: "textarea", default: "We don't hide behind 'fragrance'. Tap any ingredient to see the co-operative that grows it, how it's processed, and why we use it." },
    ]}],
  },

  // ── Sustainability page ──────────────────────────────────────────────────
  {
    id: "sustainability", label: "Sustainability page", href: "/sustainability", description: "Sustainability commitments page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "sustainability.hero.eyebrow",   label: "Eyebrow", type: "text", default: "Sustainability" },
      { key: "sustainability.hero.headline1", label: "Headline (before highlight)", type: "text", default: "The earth in its" },
      { key: "sustainability.hero.headline2", label: "Headline (highlight)", type: "text", default: "purest form" },
      { key: "sustainability.hero.intro",     label: "Intro", type: "textarea", default: "Every decision at Luv & Ker — from how we buy raw shea butter to how we ship our bars — is made with the planet and the women of Ghana in mind. We were founded on a single conviction: that you cannot make something honest if any step in the supply chain is hidden." },
    ]}],
  },

  // ── Lab Tests page ───────────────────────────────────────────────────────
  {
    id: "lab-tests", label: "Lab Tests page", href: "/lab-tests", description: "Independent lab verification page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "lab-tests.hero.eyebrow",   label: "Eyebrow", type: "text", default: "Lab Testing" },
      { key: "lab-tests.hero.headline1", label: "Headline (before highlight)", type: "text", default: "Lab tested," },
      { key: "lab-tests.hero.headline2", label: "Headline (highlight)", type: "text", default: "independently verified" },
      { key: "lab-tests.hero.intro",     label: "Intro", type: "textarea", default: "We don't ask you to trust us. We've paid UKAS-accredited laboratories to independently test our Odo formulations for heavy metals, microbial contamination, allergens and endocrine disruptors. Every report is published — pass or fail." },
    ]}],
  },

  // ── Contact page ─────────────────────────────────────────────────────────
  {
    id: "contact", label: "Contact page", href: "/contact", description: "Contact page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "contact.hero.eyebrow",  label: "Eyebrow",  type: "text",     default: "Contact" },
      { key: "contact.hero.headline", label: "Headline", type: "text",     default: "We read every message" },
      { key: "contact.hero.intro",    label: "Intro",    type: "textarea", default: "Questions about your order, our ingredients, or just want to say hello? We'd love to hear from you." },
    ]}],
  },

  // ── FAQ page ─────────────────────────────────────────────────────────────
  {
    id: "faq", label: "FAQ page", href: "/faq", description: "Frequently asked questions header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "faq.hero.eyebrow",  label: "Eyebrow",  type: "text",     default: "FAQ" },
      { key: "faq.hero.headline", label: "Headline", type: "text",     default: "30 questions, honestly answered" },
      { key: "faq.hero.intro",    label: "Intro",    type: "textarea", default: "Everything you've asked us — about the bars, the bottles, the shipping, and the values behind them. Use the menu below to jump to a section, or scroll for the full list." },
    ]}],
  },

  // ── Reviews page ─────────────────────────────────────────────────────────
  {
    id: "reviews", label: "Reviews page", href: "/reviews", description: "Reviews listing page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "reviews.hero.eyebrow",   label: "Eyebrow", type: "text", default: "Verified reviews" },
      { key: "reviews.hero.headline1", label: "Headline (before highlight)", type: "text", default: "What people are" },
      { key: "reviews.hero.headline2", label: "Headline (highlight)", type: "text", default: "actually saying" },
      { key: "reviews.hero.intro",     label: "Intro", type: "textarea", default: "Real customers. Real results. We don't pay for testimonials and we don't curate them." },
    ]}],
  },

  // ── Support Us page ──────────────────────────────────────────────────────
  {
    id: "support-us", label: "Support Us page", href: "/support-us", description: "Support / patronage page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "support-us.hero.eyebrow",  label: "Eyebrow",  type: "text",     default: "Support Us" },
      { key: "support-us.hero.headline", label: "Headline", type: "text",     default: "Help us grow the mission." },
      { key: "support-us.hero.intro",    label: "Intro",    type: "textarea", default: "At Luv & Ker, what you put on your skin is health. Support us by sharing, learning, and wearing the movement." },
    ]}],
  },

  // ── Refer page ───────────────────────────────────────────────────────────
  {
    id: "refer", label: "Refer page", href: "/refer", description: "Referral programme page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "refer.hero.eyebrow",   label: "Eyebrow", type: "text", default: "Referral Programme" },
      { key: "refer.hero.headline1", label: "Headline line 1", type: "text", default: "Share the glow." },
      { key: "refer.hero.headline2", label: "Headline line 2 (highlight)", type: "text", default: "Get rewarded." },
      { key: "refer.hero.intro",     label: "Intro", type: "textarea", default: "When you love something this much, sharing it should pay off. Share your unique discount code — when a friend uses it at checkout, you both get £10 off." },
    ]}],
  },

  // ── Shipping & Returns page ──────────────────────────────────────────────
  {
    id: "shipping", label: "Shipping & Returns page", href: "/shipping-returns", description: "Shipping & returns page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "shipping.hero.eyebrow",  label: "Eyebrow",  type: "text",     default: "Shipping & Returns" },
      { key: "shipping.hero.headline", label: "Headline", type: "text",     default: "Honest delivery, honest returns" },
      { key: "shipping.hero.intro",    label: "Intro",    type: "textarea", default: "Everything you need to know about getting your Odo to your door — and back, if it isn't right." },
    ]}],
  },

  // ── Blog page ────────────────────────────────────────────────────────────
  {
    id: "blog", label: "Blog page", href: "/blog", description: "Journal/blog index header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "blog.hero.eyebrow",  label: "Eyebrow",  type: "text",     default: "Journal" },
      { key: "blog.hero.headline", label: "Headline", type: "text",     default: "The Luv & Ker Journal" },
      { key: "blog.hero.intro",    label: "Intro",    type: "textarea", default: "Stories, ingredients, sourcing, and skin — written by the people who make the soap." },
    ]}],
  },

  // ── Redeem page ──────────────────────────────────────────────────────────
  {
    id: "redeem", label: "Redeem page", href: "/redeem", description: "Gift card balance page header.",
    sections: [{ id: "hero", label: "Hero", fields: [
      { key: "redeem.hero.eyebrow",  label: "Eyebrow",  type: "text",     default: "Gift Cards" },
      { key: "redeem.hero.headline", label: "Headline", type: "text",     default: "Check your balance" },
    ]}],
  },
];

// SEO / meta / schema / tracking section auto-injected onto every page schema
// so editors don't have to be defined twice. Keys live under `seo.<pageId>.*`.
function seoSection(pageId: string, defaults: { title?: string; description?: string } = {}): ContentSection {
  return {
    id: "seo",
    label: "SEO, schema & head",
    fields: [
      { key: `seo.${pageId}.title`,        label: "Meta title",            type: "text",     default: defaults.title ?? "" , hint: "Browser tab + Google result title (50–60 chars ideal)." },
      { key: `seo.${pageId}.description`,  label: "Meta description",      type: "textarea", default: defaults.description ?? "", hint: "Search snippet (140–160 chars)." },
      { key: `seo.${pageId}.keywords`,     label: "Meta keywords",         type: "text",     default: "", hint: "Comma-separated. Most engines ignore but kept for completeness." },
      { key: `seo.${pageId}.canonical`,    label: "Canonical URL",         type: "url",      default: "", hint: "Leave empty to use current URL." },
      { key: `seo.${pageId}.robots`,       label: "Robots directive",      type: "text",     default: "index,follow", hint: "e.g. index,follow · noindex,nofollow" },
      { key: `seo.${pageId}.ogTitle`,      label: "Open Graph title",      type: "text",     default: "" },
      { key: `seo.${pageId}.ogDescription`,label: "Open Graph description",type: "textarea", default: "" },
      { key: `seo.${pageId}.ogImage`,      label: "Social share image",    type: "image",    default: "" },
      { key: `seo.${pageId}.twitterCard`,  label: "Twitter card type",     type: "text",     default: "summary_large_image" },
      { key: `seo.${pageId}.jsonld`,       label: "JSON-LD schema",        type: "code",     default: "", hint: "Paste a full <script>-free JSON-LD object. Leave empty to skip." },
      { key: `seo.${pageId}.headHtml`,     label: "Custom <head> HTML",    type: "code",     default: "", hint: "Page-specific tracking pixels, verification tags, link-rel hints." },
      { key: `seo.${pageId}.bodyEndHtml`,  label: "Custom end-of-body HTML",type: "code",    default: "", hint: "Per-page scripts that should load after the page (e.g. chat widgets)." },
    ],
  };
}

export function getSchema(id: string): PageSchema | undefined {
  const base = PAGE_SCHEMAS.find(p => p.id === id);
  if (!base) return undefined;
  // Inject the SEO section if it's not already present (cheap idempotent merge).
  if (base.sections.some(s => s.id === "seo")) return base;
  return { ...base, sections: [...base.sections, seoSection(base.id)] };
}

export function getAllFields(): ContentField[] {
  return PAGE_SCHEMAS.flatMap(p => {
    const withSeo = getSchema(p.id);
    return withSeo ? withSeo.sections.flatMap(s => s.fields) : [];
  });
}

export function getDefault(key: string): string | undefined {
  return getAllFields().find(f => f.key === key)?.default;
}

// Site-wide settings — analytics, head/body code, cookie banner, contact info.
export const GLOBAL_SETTINGS_SCHEMA: PageSchema = {
  id: "global",
  label: "Global site settings",
  href: "/",
  description: "Site-wide tracking, analytics, contact details and cookie banner.",
  sections: [
    {
      id: "site",
      label: "Site identity",
      fields: [
        { key: "global.site.name",        label: "Site name",      type: "text", default: "Luv & Ker" },
        { key: "global.site.titleSuffix", label: "Title suffix",   type: "text", default: " | Luv & Ker", hint: "Appended to every page title." },
        { key: "global.site.defaultDescription", label: "Default meta description", type: "textarea", default: "Pure, natural, hormone-safe Ghanaian heritage soap. No parabens, no phthalates, no sulphates, no synthetic fragrance." },
        { key: "global.site.defaultOgImage", label: "Default share image", type: "image", default: "" },
        { key: "global.site.url",         label: "Canonical site URL", type: "url", default: "https://luvandker.com" },
        { key: "global.site.locale",      label: "Locale",         type: "text", default: "en_GB" },
      ],
    },
    {
      id: "contact",
      label: "Contact details",
      fields: [
        { key: "global.contact.email",   label: "Support email",   type: "text", default: "hello@luvandker.com" },
        { key: "global.contact.press",   label: "Press email",     type: "text", default: "press@luvandker.com" },
        { key: "global.contact.phone",   label: "Phone",           type: "text", default: "" },
        { key: "global.contact.address", label: "Address",         type: "textarea", default: "Accra, Ghana · London, UK" },
        { key: "global.contact.hours",   label: "Support hours",   type: "text", default: "Mon–Fri 09:00–18:00 GMT" },
      ],
    },
    {
      id: "social",
      label: "Social links",
      fields: [
        { key: "global.social.instagram", label: "Instagram URL", type: "url", default: "https://instagram.com/luvandker" },
        { key: "global.social.tiktok",    label: "TikTok URL",    type: "url", default: "" },
        { key: "global.social.youtube",   label: "YouTube URL",   type: "url", default: "" },
        { key: "global.social.facebook",  label: "Facebook URL",  type: "url", default: "" },
        { key: "global.social.x",         label: "X / Twitter URL", type: "url", default: "" },
      ],
    },
    {
      id: "analytics",
      label: "Analytics & tracking",
      fields: [
        { key: "global.analytics.enabled",  label: "Analytics enabled",   type: "boolean", default: "false", hint: "Master switch — turn off and no tracking script is injected." },
        { key: "global.analytics.ga4",      label: "Google Analytics 4 ID", type: "text", default: "", hint: "Format: G-XXXXXXXXXX" },
        { key: "global.analytics.gtm",      label: "Google Tag Manager ID", type: "text", default: "", hint: "Format: GTM-XXXXXXX" },
        { key: "global.analytics.metaPixel",label: "Meta (Facebook) Pixel ID", type: "text", default: "" },
        { key: "global.analytics.tiktokPixel", label: "TikTok Pixel ID", type: "text", default: "" },
        { key: "global.analytics.hotjar",   label: "Hotjar Site ID",      type: "text", default: "" },
        { key: "global.analytics.plausible",label: "Plausible domain",    type: "text", default: "", hint: "e.g. luvandker.com — leave empty to skip." },
      ],
    },
    {
      id: "code",
      label: "Custom head & body code",
      fields: [
        { key: "global.code.headHtml",   label: "Site-wide <head> HTML", type: "code", default: "", hint: "Verification tags, fonts, preconnects." },
        { key: "global.code.bodyStartHtml", label: "Body-open HTML",     type: "code", default: "", hint: "Runs immediately after <body> opens." },
        { key: "global.code.bodyEndHtml",label: "Body-end HTML",         type: "code", default: "", hint: "Runs at end of <body>. Good for late-loading pixels." },
      ],
    },
    {
      id: "cookies",
      label: "Cookie banner",
      fields: [
        { key: "global.cookies.enabled",  label: "Show cookie banner",  type: "boolean", default: "true" },
        { key: "global.cookies.headline", label: "Banner headline",     type: "text", default: "Cookies & analytics" },
        { key: "global.cookies.message",  label: "Banner message",      type: "textarea", default: "We use cookies to understand how the site is used and improve your experience. Tracking only loads when you accept." },
        { key: "global.cookies.acceptLabel", label: "Accept button",    type: "text", default: "Accept" },
        { key: "global.cookies.declineLabel", label: "Decline button",  type: "text", default: "Decline" },
        { key: "global.cookies.policyHref", label: "Privacy policy URL", type: "url", default: "/privacy" },
      ],
    },
    {
      id: "schema",
      label: "Site-wide structured data",
      fields: [
        { key: "global.schema.organization", label: "Organization JSON-LD", type: "code", default: "", hint: "Site-wide schema.org/Organization block." },
        { key: "global.schema.website",      label: "WebSite JSON-LD",      type: "code", default: "", hint: "Site-wide schema.org/WebSite block (with SearchAction)." },
      ],
    },
  ],
};

