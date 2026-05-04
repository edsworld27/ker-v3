// Plugin API catch-all dispatcher.
//
// All plugin-contributed API routes live under `/api/portal/<pluginId>/<sub>`.
// We resolve to the matching `PluginApiRoute.handler` from the manifest
// and call it with a `PluginCtx` built from the live session + foundation
// services container.
//
// Tenant scope is inferred:
//   • Pass `?clientId=<id>` (or send it as a header / body) to scope to a
//     specific client.
//   • Otherwise the install resolves at the agency scope.

import { NextResponse, type NextRequest } from "next/server";
import { ensureHydrated } from "@/server/storage";
import { authErrorResponse, requireSession } from "@/lib/server/auth";
import { resolvePluginApiRoute } from "@/plugins/_routeResolver";
import { FOUNDATION_SERVICES } from "@/plugins/foundation-adapters";
import type { PluginCtx } from "@/plugins/_types";
import { makePluginStorage } from "@/lib/server/pluginStorage";

interface RouteParams {
  params: Promise<{ plugin: string; rest: string[] }>;
}

async function dispatch(req: NextRequest, params: RouteParams["params"], method: string): Promise<Response> {
  await ensureHydrated();
  let session;
  try { session = await requireSession(); }
  catch (e) { return authErrorResponse(e); }

  const { plugin: pluginId, rest } = await params;

  // Determine scope. Body lookup happens lazily — most callers pass
  // ?clientId in the search params, which is safe to peek without
  // consuming the body.
  const url = new URL(req.url);
  const queryClientId = url.searchParams.get("clientId");
  const headerClientId = req.headers.get("x-aqua-client-id");
  const explicitClientId = queryClientId ?? headerClientId ?? undefined;

  // For client-* roles the URL clientId must match their session's clientId.
  if (session.role.startsWith("client-") || session.role === "freelancer" || session.role === "end-customer") {
    if (explicitClientId && session.clientId && explicitClientId !== session.clientId) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
  }
  const scopeClientId = explicitClientId ?? (session.role.startsWith("client-") ? session.clientId : undefined);

  const resolved = resolvePluginApiRoute(
    pluginId,
    rest,
    { agencyId: session.agencyId, clientId: scopeClientId },
    method,
  );
  if (!resolved) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const { route, install } = resolved;

  // Role gate.
  const allowed = route.visibleToRoles ?? route.roles;
  if (allowed && !allowed.includes(session.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  // Feature gate.
  if (route.requiresFeature && !install.features[route.requiresFeature]) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 404 });
  }

  const ctx: PluginCtx = {
    agencyId: install.agencyId,
    clientId: install.clientId ?? scopeClientId,
    install,
    storage: makePluginStorage(install.id),
    services: FOUNDATION_SERVICES,
    actor: session.userId,
  };

  return route.handler(req, ctx);
}

export async function GET(req: NextRequest, { params }: RouteParams) { return dispatch(req, params, "GET"); }
export async function POST(req: NextRequest, { params }: RouteParams) { return dispatch(req, params, "POST"); }
export async function PATCH(req: NextRequest, { params }: RouteParams) { return dispatch(req, params, "PATCH"); }
export async function PUT(req: NextRequest, { params }: RouteParams) { return dispatch(req, params, "PUT"); }
export async function DELETE(req: NextRequest, { params }: RouteParams) { return dispatch(req, params, "DELETE"); }
