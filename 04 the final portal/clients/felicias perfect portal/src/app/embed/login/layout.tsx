import type { Metadata } from "next";

// Embeddable login lives at /embed/login and is iframed cross-origin
// by host sites. We override the root layout to skip the storefront
// chrome (Navbar, ChatBot, ImpersonationBar, etc.) and to set headers
// that allow framing.

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function EmbedLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
