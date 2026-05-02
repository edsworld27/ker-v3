// Portal-variant starter block trees.
//
// When Felicia clicks "+ New variant" on /admin/portals she gets a
// usable starting layout instead of a blank canvas. Each starter is a
// small, sensible Block[] that's easy to delete or extend. Crucially:
// login + affiliates starters include a working LoginFormBlock so the
// new variant is functional from the first save — Felicia tweaks copy
// and styling rather than wiring auth from scratch.

import type { Block, PortalRole } from "@/portal/server/types";

let nextSeed = 0;
function blockId(prefix: string): string {
  // Deterministic-ish so the diff in storage is readable. Combines
  // a per-call counter and a short random suffix for uniqueness across
  // multiple variants created in one session.
  nextSeed += 1;
  return `${prefix}_${nextSeed.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function makeBlock(type: Block["type"], props: Record<string, unknown>, children?: Block[]): Block {
  const block: Block = {
    id: blockId(type),
    type,
    props,
  };
  if (children && children.length > 0) block.children = children;
  return block;
}

export function starterForRole(role: PortalRole): Block[] {
  switch (role) {
    case "login":
      return [
        makeBlock("section", {}, [
          makeBlock("heading", { text: "Welcome back", level: 1 }),
          makeBlock("text", { text: "Sign in to manage your account, view orders, and track shipments." }),
          makeBlock("login-form", {
            title: "Sign in",
            submitLabel: "Sign in",
            action: "/api/auth/login",
            showRemember: true,
            showForgot: true,
            showSignupLink: true,
          }),
        ]),
      ];

    case "affiliates":
      return [
        makeBlock("section", {}, [
          makeBlock("heading", { text: "Affiliate program", level: 1 }),
          makeBlock("text", {
            text: "Earn commission on every customer you refer. Sign in to grab your unique link and track your referrals in real time.",
          }),
          makeBlock("stats-bar", {
            stats: [
              { label: "Avg commission", value: "10%" },
              { label: "Cookie window", value: "30 days" },
              { label: "Payout", value: "Monthly" },
            ],
          }),
          makeBlock("login-form", {
            title: "Affiliate sign in",
            submitLabel: "Sign in",
            action: "/api/auth/login",
            showSignupLink: true,
            signupHref: "/account?mode=signup&intent=affiliate",
          }),
        ]),
      ];

    case "orders":
      return [
        makeBlock("section", {}, [
          makeBlock("heading", { text: "Your orders", level: 1 }),
          makeBlock("text", {
            text: "Every order you've placed, with status, tracking, and quick links to receipts.",
          }),
          // No native "orders list" block in the editor today — the
          // route's default fallback handles the live order data.
          // Operators can drop in CTAs / banners around the list as
          // they tweak this variant.
          makeBlock("banner", {
            title: "Need help?",
            message: "Get in touch — we usually reply within a few hours.",
            ctaLabel: "Contact support",
            ctaHref: "/contact",
          }),
        ]),
      ];

    case "account":
      return [
        makeBlock("section", {}, [
          makeBlock("heading", { text: "Your account", level: 1 }),
          makeBlock("text", { text: "Quick links to everything you need." }),
          makeBlock("card-grid", {
            cards: [
              { title: "Orders",      href: "/account/orders",      description: "Track shipments, request returns." },
              { title: "Profile",     href: "/account?tab=profile", description: "Update name, email, password." },
              { title: "Affiliates",  href: "/affiliates",          description: "Your referral link and commissions." },
              { title: "Preferences", href: "/account?tab=privacy", description: "Email, cookies, marketing." },
            ],
          }),
        ]),
      ];
  }
}
