// Theme variant switching (light/dark/system). Round-1 minimal port from
// `02/src/lib/admin/themeVariants.ts`.

export type ThemeVariant = "light" | "dark" | "system";

const KEY = "aqua.editor.themeVariant";

export function getThemeVariant(): ThemeVariant {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

export function setThemeVariant(v: ThemeVariant): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, v);
}
