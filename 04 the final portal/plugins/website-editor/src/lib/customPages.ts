// Stub for custom-pages helper — round-1 placeholder. Original lives at
// `02/src/lib/admin/customPages.ts` and supports operator-defined page
// types (e.g. blog post, landing page). Round-2 lifts the full surface.

import type { EditorPage } from "../types/editorPage";

export interface CustomPageType {
  id: string;
  label: string;
  template?: string;
}

export const CUSTOM_PAGE_TYPES: CustomPageType[] = [
  { id: "page", label: "Page" },
  { id: "landing", label: "Landing page", template: "hero-cta" },
];

export function getCustomPageType(id: string): CustomPageType | undefined {
  return CUSTOM_PAGE_TYPES.find((t) => t.id === id);
}

export function isCustomPage(_page: EditorPage): boolean {
  return false;
}
