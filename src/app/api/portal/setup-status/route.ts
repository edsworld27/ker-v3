// GET /api/portal/setup-status?orgId=…
//
// Live "have you set up X yet?" checks for the dashboard checklist.
// Each item carries a label, a hint, where to go to fix it, and a
// boolean done flag. The /admin home page renders the result; once
// every item is done the widget hides automatically.
//
// Adding a new check: push a row into the array below. Pure functions
// only — no mutations.

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getOrg } from "@/portal/server/orgs";
import { getSettings } from "@/portal/server/settings";
import { listPages } from "@/portal/server/pages";
import { getProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
  href: string;
  done: boolean;
  doneHint?: string;
}

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const org = getOrg(orgId);
  const settings = getSettings();

  const installs = org?.plugins ?? [];
  const installed = (id: string) => installs.find(p => p.pluginId === id && p.enabled);

  const brand = installed("brand");
  const brandConfig = brand?.config as Record<string, string | undefined> | undefined;
  const brandConfigured = !!brandConfig?.panelName && (!!brandConfig?.logoUrl || !!brandConfig?.primary);

  // Stripe — secret key set in env (production posture) OR e-commerce
  // plugin install carries it (older posture). Either counts.
  const ecommerce = installed("ecommerce");
  const ecommerceConfig = ecommerce?.config as Record<string, string | undefined> | undefined;
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY || !!ecommerceConfig?.stripeSecretKey;

  // Email sender — Resend or Postmark key on the email plugin install.
  const email = installed("email");
  const emailConfig = email?.config as Record<string, string | undefined> | undefined;
  const emailConfigured = !!emailConfig?.resendApiKey || !!emailConfig?.postmarkServerToken;

  // Products — multi-site shape; getProducts respects the active store.
  const productCount = getProducts({ includeHidden: true }).length;

  // Published pages — sum across every site this org owns.
  const sites = (org as unknown as { sites?: Array<{ id: string }> })?.sites ?? [];
  let publishedCount = 0;
  for (const s of sites) {
    publishedCount += listPages(s.id).filter(p => p.status === "published").length;
  }

  // GitHub — repo url + PAT (or app installation) saved.
  const githubConfigured = !!settings.github.repoUrl && (!!settings.github.pat || !!settings.github.installationId);

  // Backups — plugin installed AND adapter chosen.
  const backups = installed("backups");
  const backupsConfig = backups?.config as Record<string, unknown> | undefined;
  const backupsConfigured = !!backups && !!backupsConfig?.adapter;

  // First-login security — operator changed their initial password.
  // Inferred via the "no remaining mustChangePassword users in admin
  // role". Best-effort; if we don't know, assume done so the row
  // doesn't lie.

  const items: ChecklistItem[] = [
    {
      id: "brand",
      label: "Set up your brand",
      hint: "Logo, name, accent colour — the chrome around the admin.",
      href: "/admin/customise",
      done: brandConfigured,
      doneHint: brandConfig?.panelName,
    },
    {
      id: "site",
      label: "Add a site",
      hint: "At least one storefront so visitors have somewhere to land.",
      href: "/admin/sites",
      done: sites.length > 0,
      doneHint: sites.length > 0 ? `${sites.length} ${sites.length === 1 ? "site" : "sites"}` : undefined,
    },
    {
      id: "product",
      label: "Add a product",
      hint: "Without products there's nothing to sell.",
      href: "/admin/products/new",
      done: productCount > 0,
      doneHint: productCount > 0 ? `${productCount} in catalog` : undefined,
    },
    {
      id: "page",
      label: "Publish a page",
      hint: "Edit a page in /admin/editor and hit Publish.",
      href: "/admin/editor",
      done: publishedCount > 0,
      doneHint: publishedCount > 0 ? `${publishedCount} live` : undefined,
    },
    {
      id: "stripe",
      label: "Connect Stripe",
      hint: "Take payments. Without it your shop can't actually sell.",
      href: "/admin/marketplace",
      done: stripeConfigured,
    },
    {
      id: "email",
      label: "Connect an email sender",
      hint: "Order confirmations, password resets, marketing — all silent without this.",
      href: "/admin/email",
      done: emailConfigured,
    },
    {
      id: "github",
      label: "Connect GitHub",
      hint: "So edits ship as real PRs (skip if you don't have a repo yet).",
      href: "/admin/portal-settings",
      done: githubConfigured,
    },
    {
      id: "backups",
      label: "Turn on backups",
      hint: "Daily snapshots so a bad day is a 5-minute restore, not a panic.",
      href: "/admin/backups",
      done: backupsConfigured,
    },
  ];

  const doneCount = items.filter(i => i.done).length;

  return NextResponse.json({
    ok: true,
    items,
    doneCount,
    totalCount: items.length,
    allDone: doneCount === items.length,
  });
}
