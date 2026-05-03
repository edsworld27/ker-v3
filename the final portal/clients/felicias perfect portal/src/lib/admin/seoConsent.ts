"use client";

// Cookie/analytics consent. The cookie banner writes to this; SiteHead reads
// it and only injects analytics scripts once consent === "accepted". Edits to
// global tracking IDs trigger a hot re-mount via the change event.

const STORAGE_KEY = "lk_consent_v1";
const EVENT = "lk-consent-change";

export type ConsentState = "unknown" | "accepted" | "declined";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  return (localStorage.getItem(STORAGE_KEY) as ConsentState) || "unknown";
}

export function setConsent(s: ConsentState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, s);
  window.dispatchEvent(new Event(EVENT));
}

export function onConsentChange(h: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(EVENT, h);
    window.removeEventListener("storage", h);
  };
}
