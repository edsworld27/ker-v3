// Assets — Round-1 stub. Asset uploads / browse / delete flow is
// shared infrastructure that ideally lives in T1 foundation
// `components/shared/`; for Round 1 we expose the endpoints so the
// editor's asset picker round-trips don't 404.
//
// **TODO** Round 2: implement against T1's storage adapter.

import type { PluginCtx } from "../../lib/aquaPluginTypes";
import { ok, requireClientScope } from "../helpers";

export async function handleListAssets(_req: Request, ctx: PluginCtx): Promise<Response> {
  const scope = requireClientScope(ctx);
  if (!scope.ok) return scope.res;
  return ok({ assets: [], note: "Round-1 stub" });
}

export async function handleUploadAsset(_req: Request, ctx: PluginCtx): Promise<Response> {
  const scope = requireClientScope(ctx);
  if (!scope.ok) return scope.res;
  return ok({ uploaded: false, note: "Round-1 stub — asset uploads land Round 2" }, { status: 501 });
}

export async function handleDeleteAsset(_req: Request, ctx: PluginCtx): Promise<Response> {
  const scope = requireClientScope(ctx);
  if (!scope.ok) return scope.res;
  return ok({ deleted: false, note: "Round-1 stub" }, { status: 501 });
}
