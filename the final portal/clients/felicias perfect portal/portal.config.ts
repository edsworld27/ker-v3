// Portal manifest for the love-and-ker storefront — the typed schema the
// admin reads to render the section-grouped editor, and that the runtime
// uses to resolve admin overrides on top of the legacy CMS defaults.
//
// Keys mirror what `useContent("…")` already reads at the call sites
// (Hero, Problem, Solution, Testimonials, FeaturedProducts, Footer,
// Navbar, etc.). The "default" value here is the same fallback string
// each component currently passes — kept here so the portal admin sees
// the live default without having to hunt through component files.
//
// Migration is dual-run: useContent reads portal published first, then
// the legacy localStorage CMS, then the schema default. So a portal
// override always wins, but every existing localStorage edit keeps
// working untouched.

import { definePortal } from "./src/portal/client";

export default definePortal({
  global: {
    "site.name":              { type: "text", default: "Luv & Ker" },
    "site.titleSuffix":       { type: "text", default: " | Luv & Ker" },
    "site.defaultDescription":{ type: "text", default: "Pure, natural, hormone-safe Ghanaian heritage soap. No parabens, no phthalates, no sulphates, no synthetic fragrance.", multiline: true },
    "site.locale":            { type: "text", default: "en_GB" },
  },

  navbar: {
    wordmark1: { type: "text", default: "LUV" },
    wordmark2: { type: "text", default: "KER" },
    subtitle:  { type: "text", default: "Odo by Felicia" },
  },

  footer: {
    tagline:     { type: "text", default: "Odo by Felicia" },
    description: { type: "text", default: "Pure. Sacred. Alive. Ghanaian heritage skincare for those who demand honesty from everything they put on their skin.", multiline: true },
  },

  home: {
    "problem.eyebrow":       { type: "text", default: "The Problem" },
    "problem.headline1":     { type: "text", default: "They called it" },
    "problem.headline2":     { type: "text", default: "care." },
    "problem.headline3":     { type: "text", default: " Take it back." },
    "problem.body":          { type: "text", default: "Mass-market brands have spent decades loading our skin with sulphates, phthalates, and synthetic chemicals hidden behind the word “fragrance.” Raw, clean power for men. Divine, untouched skin for women. Odo strips it back to what our bodies actually deserve — and nothing they don’t.", multiline: true },

    "solution.eyebrow":      { type: "text", default: "The Answer" },
    "solution.headline1":    { type: "text", default: "A gift carried across" },
    "solution.headline2":    { type: "text", default: "generations" },
    "solution.body1":        { type: "text", default: "Odo is the Twi word for love. It is more than a name — it is the philosophy behind every bar.", multiline: true },
    "solution.body2":        { type: "text", default: "Every ingredient is sourced directly from Ghanaian farmers. No middlemen. No shortcuts.", multiline: true },

    "featured.eyebrow":      { type: "text", default: "Featured" },
    "featured.headline":     { type: "text", default: "Start your ritual." },
    "featured.tagline":      { type: "text", default: "Three products. One for every skin need." },

    "testimonials.eyebrow":  { type: "text", default: "Stories" },
    "testimonials.headline1":{ type: "text", default: "What people are" },
    "testimonials.headline2":{ type: "text", default: "actually saying" },
    "testimonials.intro":    { type: "text", default: "Real DMs. Real reposts. Real customers — men and women, mothers and fathers, dermatologists and daughters.", multiline: true },
    "testimonials.stat1Big":   { type: "text", default: "4.9" },
    "testimonials.stat1Small": { type: "text", default: "Average rating" },
    "testimonials.stat2Big":   { type: "text", default: "3,400+" },
    "testimonials.stat2Small": { type: "text", default: "Happy customers" },
    "testimonials.stat3Big":   { type: "text", default: "91%" },
    "testimonials.stat3Small": { type: "text", default: "Buy again within 90 days" },
    "testimonials.stat4Big":   { type: "text", default: "0" },
    "testimonials.stat4Small": { type: "text", default: "Synthetic ingredients · ever" },
  },
});
