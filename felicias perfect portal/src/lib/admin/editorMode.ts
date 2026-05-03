"use client";

// Editor complexity preference. Felicia (or any operator) picks how
// much editor surface they want to see — Simple for first-time block
// authoring, Full for the standard experience, Pro for power features
// (code mode prominent, custom head/foot, layout overrides, etc.).
//
// Stored in localStorage so the choice survives reloads. The value is
// per-operator (not per-org) — different team members can run with
// different complexity preferences against the same content.
//
// Each editor has its own runtime selector that flips this on the
// fly; the operator's "default" mode lives in /admin/customise →
// Editor and is the value Simple-mode customers see when they first
// open the editor on a fresh device.

const KEY = "lk_editor_complexity_v1";
const EVENT = "lk-editor-complexity-change";

export type EditorComplexity = "simple" | "full" | "pro";

export const COMPLEXITY_OPTIONS: Array<{ id: EditorComplexity; label: string; description: string }> = [
  {
    id: "simple",
    label: "Simple",
    description: "Just the canvas. Click to edit. No outliner, no properties panel — perfect for fast copy tweaks.",
  },
  {
    id: "full",
    label: "Full",
    description: "Default. Outliner on the left, properties on the right, all three modes (Live · Block · Code).",
  },
  {
    id: "pro",
    label: "Pro",
    description: "Everything in Full, plus power-user surfaces — custom head/foot, layout overrides, theme tokens.",
  },
];

const VALID = new Set<EditorComplexity>(["simple", "full", "pro"]);

export function getEditorComplexity(): EditorComplexity {
  if (typeof window === "undefined") return "full";
  const raw = localStorage.getItem(KEY);
  if (raw && VALID.has(raw as EditorComplexity)) return raw as EditorComplexity;
  return "full";
}

export function setEditorComplexity(c: EditorComplexity): void {
  if (typeof window === "undefined") return;
  if (!VALID.has(c)) return;
  localStorage.setItem(KEY, c);
  window.dispatchEvent(new Event(EVENT));
}

export function onEditorComplexityChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const listener = () => handler();
  window.addEventListener(EVENT, listener);
  // storage event fires when another tab changes the value
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
