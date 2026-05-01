import { NextResponse } from "next/server";
import { ensureHydrated, getMigrationSql, getBackendInfo } from "@/portal/server/storage";
import { getSettings } from "@/portal/server/settings";
import { appendActivity } from "@/portal/server/activity";

// POST /api/portal/migrate
// Auto-applies the portal's schema migration to the configured database
// backend. Currently supports Supabase via the Management API:
//   POST https://api.supabase.com/v1/projects/{ref}/database/query
//   Authorization: Bearer <PORTAL_SUPABASE_MANAGEMENT_TOKEN>
//   Body: { "query": "<SQL>" }
//
// Required: settings.database.supabaseManagementToken — a Supabase
// Personal Access Token from supabase.com/dashboard/account/tokens.
// Different from the service-role key (which is only for runtime
// PostgREST reads/writes — can't run DDL).
//
// After a successful run we re-probe the schema state via getBackendInfo()
// and return the new state so the admin UI can flip the banner away
// without a full reload.

export const dynamic = "force-dynamic";

export async function POST() {
  await ensureHydrated();
  const info = getBackendInfo();
  const settings = getSettings();

  if (info.kind !== "supabase") {
    return NextResponse.json({
      ok: false,
      error: `Auto-migrate only supports Supabase right now. Active backend: ${info.kind}. Use the AI prompt below to generate migration SQL for your database.`,
    }, { status: 412 });
  }

  const url = settings.database.supabaseUrl;
  const managementToken = settings.database.supabaseManagementToken;
  if (!url) {
    return NextResponse.json({
      ok: false,
      error: "Supabase project URL not configured. Set it in /admin/portal-settings → Database.",
    }, { status: 412 });
  }
  if (!managementToken) {
    return NextResponse.json({
      ok: false,
      error: "Supabase Management Token not configured. Generate one at supabase.com/dashboard/account/tokens (different from the service-role key) and paste it in /admin/portal-settings.",
    }, { status: 412 });
  }

  // Extract the project ref from the URL: https://<ref>.supabase.co
  const match = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.(co|in|net)\/?$/i);
  if (!match) {
    return NextResponse.json({
      ok: false,
      error: `Couldn't extract a Supabase project ref from "${url}". Expected something like https://abcdefg.supabase.co.`,
    }, { status: 400 });
  }
  const projectRef = match[1];

  const sql = getMigrationSql();

  let res: Response;
  try {
    res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${managementToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: `Network error reaching Supabase Management API: ${e instanceof Error ? e.message : String(e)}`,
    }, { status: 502 });
  }

  if (!res.ok) {
    let detail = "";
    try { detail = (await res.text()).slice(0, 400); } catch {}
    // Common cases worth surfacing inline:
    //  - 401: bad PAT
    //  - 403: PAT lacks permission on the project
    //  - 404: wrong project ref
    let hint = "";
    if (res.status === 401) hint = " · Check the Management Token is current (PATs can be revoked from the Supabase dashboard).";
    else if (res.status === 403) hint = " · The PAT doesn't have access to this project. Confirm the right organisation owns the token.";
    else if (res.status === 404) hint = ` · Project ref "${projectRef}" not found under this token.`;
    return NextResponse.json({
      ok: false,
      error: `Supabase Management API error: ${res.status}${hint}`,
      detail,
    }, { status: 502 });
  }

  // Log success to the activity feed so the migration is auditable.
  appendActivity({
    actorEmail: "system",
    actorName: "Portal",
    category: "settings",
    action: `Applied Supabase migration to project ${projectRef}`,
    resourceLink: "/admin/portal-settings",
  });

  // Re-probe so the admin sees the schema state flip without a refresh.
  // The backend's loadBlob will be called again on the next request and
  // populate the schema state correctly; here we just return the fresh
  // info plus a flag the UI uses to clear the banner immediately.
  return NextResponse.json({
    ok: true,
    appliedTo: projectRef,
    backendInfo: getBackendInfo(),
  });
}
