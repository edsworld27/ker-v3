// Editor complexity tier — Simple / Full / Pro. Persisted in
// localStorage. Adapted from `02/src/lib/admin/editorMode.ts`.

export type EditorComplexity = "simple" | "full" | "pro";
export type EditorMode = "live" | "block" | "code";

const COMPLEXITY_KEY = "aqua.editor.complexity";
const MODE_KEY = "aqua.editor.mode";

export function getComplexity(): EditorComplexity {
  if (typeof window === "undefined") return "full";
  const v = window.localStorage.getItem(COMPLEXITY_KEY);
  return v === "simple" || v === "full" || v === "pro" ? v : "full";
}

export function setComplexity(v: EditorComplexity): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPLEXITY_KEY, v);
}

export function getMode(): EditorMode {
  if (typeof window === "undefined") return "live";
  const v = window.localStorage.getItem(MODE_KEY);
  return v === "live" || v === "block" || v === "code" ? v : "live";
}

export function setMode(v: EditorMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, v);
}
