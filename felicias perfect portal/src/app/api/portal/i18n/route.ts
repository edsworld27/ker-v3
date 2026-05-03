// GET  /api/portal/i18n?orgId=...&locale=...  — list translations
// POST /api/portal/i18n                        — bulk save translations
//
// Body for POST: { orgId, locale, entries: Record<string, string> }

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getOrg } from "@/portal/server/orgs";
import { listTranslations, listAllKeys, bulkImport } from "@/portal/server/translations";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const localeParam = req.nextUrl.searchParams.get("locale");

  const org = getOrg(orgId);
  const i18n = (org?.plugins ?? []).find(p => p.pluginId === "i18n");
  const cfg = i18n?.config as Record<string, unknown> | undefined;
  const defaultLocale = (cfg?.defaultLocale as string) ?? "en";
  const enabledRaw = (cfg?.enabledLocales as string) ?? "en";
  const locales = [...new Set([defaultLocale, ...enabledRaw.split(",").map(s => s.trim()).filter(Boolean)])];

  const locale = localeParam && locales.includes(localeParam) ? localeParam : defaultLocale;
  const translations = listTranslations(orgId, locale);
  const keys = listAllKeys(orgId);
  // If we don't have any keys yet, surface the keys for this locale so
  // the operator at least sees what they've already translated.
  const allKeys = keys.length > 0 ? keys : Object.keys(translations);

  return NextResponse.json({
    ok: true,
    locales,
    defaultLocale,
    keys: allKeys,
    translations,
  });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; locale?: string; entries?: Record<string, string> };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.locale || !body.entries) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  bulkImport(body.orgId, body.locale, body.entries);
  return NextResponse.json({ ok: true, count: Object.keys(body.entries).length });
}
