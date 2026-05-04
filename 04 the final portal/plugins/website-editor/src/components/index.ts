// Public component-side surface for `@aqua/plugin-website-editor/components`.

export { BlockRenderer, BlockTreeRenderer } from "./BlockRenderer";
export { BLOCK_REGISTRY, BLOCK_DESCRIPTORS, BLOCK_TYPES, getBlockEntry, getBlockDescriptor } from "./blockRegistry";
export type { BlockComponentProps, BlockRegistryEntry } from "./blockRegistry";
export { AnimateOnScroll } from "./AnimateOnScroll";
export { AssetPicker } from "./AssetPicker";
export { tokensToCssVars } from "./themeCss";
export { buildBlockStyle, buildResponsiveCss } from "./blockStyles";
export { resolveVariant, applyVariantOverrides } from "./variantResolver";
export { PAGE_TEMPLATES, getTemplate } from "./pageTemplates";
export type { PageTemplate } from "./pageTemplates";
export { useProducts } from "./useProducts";

// Storefront overlay
export { PortalEditOverlay } from "./storefront/PortalEditOverlay";
export { PortalPageRenderer } from "./storefront/PortalPageRenderer";
export { PreviewBar } from "./storefront/PreviewBar";
export { SiteResolver } from "./storefront/SiteResolver";
export { SiteUX } from "./storefront/SiteUX";
export { SiteHead } from "./storefront/SiteHead";
export { EditorThemeInjector } from "./storefront/EditorThemeInjector";
