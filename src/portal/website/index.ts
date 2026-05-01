// Website: CMS, theme, blog, pages, sections, SEO, A/B testing, popup.
// All re-exports from existing modules — see src/portal/README.md.

export * from "@/lib/admin/content";
export * from "@/lib/admin/contentSchema";
export * from "@/lib/admin/customPages";
export * from "@/lib/admin/blog";
export * from "@/lib/admin/sections";
export * from "@/lib/admin/theme";
export * from "@/lib/admin/themeVariants";
export * from "@/lib/admin/media";
export * from "@/lib/admin/faq";
export * from "@/lib/admin/labels";
export * from "@/lib/admin/abtests";
export * from "@/lib/admin/funnels";
export * from "@/lib/admin/popup";
export * from "@/lib/admin/loginCustomisation";
export * from "@/lib/admin/seoConsent";

// Public consent helpers (storefront cookie banner)
export * from "@/lib/consent";
export { useContent } from "@/lib/useContent";
