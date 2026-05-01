// GET /api/portal/plugins
// Lists every plugin manifest in the registry. Used by the
// marketplace UI to render install/configure cards. Returns
// a slim, JSON-safe projection — strips lifecycle hooks and
// React component references that don't survive serialisation.

import { NextResponse } from "next/server";
import { listPlugins } from "@/plugins/_registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const plugins = listPlugins().map(p => ({
    id: p.id,
    name: p.name,
    version: p.version,
    status: p.status,
    category: p.category,
    core: p.core ?? false,
    tagline: p.tagline,
    description: p.description,
    plans: p.plans ?? null,
    requires: p.requires ?? [],
    conflicts: p.conflicts ?? [],
    features: p.features.map(f => ({
      id: f.id,
      label: f.label,
      description: f.description ?? null,
      default: f.default,
      plans: f.plans ?? null,
      requires: f.requires ?? [],
    })),
    settings: p.settings,
    setup: p.setup ?? [],
    navItems: p.navItems.map(n => ({
      id: n.id,
      label: n.label,
      href: n.href,
      requiresFeature: n.requiresFeature ?? null,
    })),
  }));
  return NextResponse.json({ ok: true, plugins });
}
