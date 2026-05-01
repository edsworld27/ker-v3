"use client";

// Customisation for the public /account login & signup page.
// Stored in localStorage so admins can edit copy, branding, layout.

const KEY = "lk_login_customisation_v1";
const EVENT = "lk-login-config-change";

export type LoginLayout = "split" | "centered" | "minimal";

export interface LoginCustomisation {
  // Layout
  layout: LoginLayout;
  // Hero image (for split layout)
  heroImage: string;          // URL or data URI
  heroOverlayColor: string;
  heroOverlayOpacity: number; // 0–1
  // Branding
  logoUrl: string;
  showLogo: boolean;
  // Headlines
  headline: string;           // e.g. "Welcome back"
  subheadline: string;        // small text below
  signupHeadline: string;
  signupSubheadline: string;
  // CTA labels
  loginButtonLabel: string;
  signupButtonLabel: string;
  // Toggles
  enableGoogle: boolean;
  enableSignup: boolean;
  enableForgotPassword: boolean;
  showSocialProof: boolean;
  socialProofText: string;
  // Footer
  footerLinks: { label: string; href: string }[];
  // Colours
  primaryColor: string;
  bgColor: string;
  cardColor: string;
  textColor: string;
  // Custom CSS
  customCSS: string;
}

export const DEFAULT_LOGIN: LoginCustomisation = {
  layout: "centered",
  heroImage: "",
  heroOverlayColor: "#000000",
  heroOverlayOpacity: 0.4,
  logoUrl: "",
  showLogo: true,
  headline: "Welcome back",
  subheadline: "Sign in to continue your ritual.",
  signupHeadline: "Create your account",
  signupSubheadline: "Join the Luv & Ker family.",
  loginButtonLabel: "Sign in",
  signupButtonLabel: "Create account",
  enableGoogle: true,
  enableSignup: true,
  enableForgotPassword: true,
  showSocialProof: false,
  socialProofText: "Trusted by 5,000+ happy customers worldwide",
  footerLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/shipping-returns" },
  ],
  primaryColor: "#E8621A",
  bgColor: "",      // empty = use theme default
  cardColor: "",
  textColor: "",
  customCSS: "",
};

export function getLoginCustomisation(): LoginCustomisation {
  if (typeof window === "undefined") return DEFAULT_LOGIN;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_LOGIN;
    return { ...DEFAULT_LOGIN, ...(JSON.parse(raw) as Partial<LoginCustomisation>) };
  } catch {
    return DEFAULT_LOGIN;
  }
}

export function saveLoginCustomisation(patch: Partial<LoginCustomisation>) {
  if (typeof window === "undefined") return;
  const next = { ...getLoginCustomisation(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function resetLoginCustomisation() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function onLoginCustomisationChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
