// Schema describing every editable field on the site. The admin Website
// editor renders forms from this; storefront components read values via
// useContent(key, default). Keep keys stable — renaming breaks existing
// overrides. Adding new keys is safe.

export type FieldType = "text" | "textarea" | "image";

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

];

export function getSchema(id: string): PageSchema | undefined {
  return PAGE_SCHEMAS.find(p => p.id === id);
}

export function getAllFields(): ContentField[] {
  return PAGE_SCHEMAS.flatMap(p => p.sections.flatMap(s => s.fields));
}

export function getDefault(key: string): string | undefined {
  return getAllFields().find(f => f.key === key)?.default;
}
