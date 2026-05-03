/**
 * GET  /api/bridge/state?agencyId=xxx  — fetch initial state for agency
 * POST /api/bridge/state               — persist either:
 *   • a generic key/value state update                          ({agencyId, key, value})
 *   • a marketplace per-agency suite enable/disable toggle       ({agencyId, suiteId, enabled})
 *   • a marketplace per-agency suite config update              ({agencyId, suiteId, config})
 *     (config is JSON-stringified into AgencySuite.config; enabled is optional in this case)
 *
 * Demo-mode degradation: when no DATABASE_URL is configured (or the DB is
 * unreachable), the routes still return success with empty data so the host
 * shell + marketplace remain usable. Plug in a real Postgres URL via Vercel
 * env to re-enable persistence.
 */

import { NextRequest, NextResponse } from 'next/server';
import { BridgeAPI } from '@aqua/bridge/api';

interface SuiteTogglePayload {
  agencyId: string;
  suiteId: string;
  /** Optional when only updating config; required for plain install/uninstall */
  enabled?: boolean;
  /** Optional plugin config — when present, JSON-stringified and persisted to AgencySuite.config */
  config?: Record<string, unknown>;
}

interface KeyValuePayload {
  agencyId: string;
  key: string;
  value: unknown;
}

type PostPayload = Partial<SuiteTogglePayload & KeyValuePayload>;

function isSuiteTogglePayload(body: PostPayload): body is SuiteTogglePayload {
  if (typeof body.agencyId !== 'string' || typeof body.suiteId !== 'string') return false;
  const hasEnabled = typeof body.enabled === 'boolean';
  const hasConfig = body.config !== undefined && body.config !== null && typeof body.config === 'object';
  return hasEnabled || hasConfig;
}

const isDbUnavailable = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  return /database|prisma|sqlite|postgres|file:|ENOENT|EROFS|connect/i.test(msg);
};

export async function GET(req: NextRequest) {
  const agencyId = req.nextUrl.searchParams.get('agencyId');
  if (!agencyId) {
    return NextResponse.json({ error: 'agencyId is required' }, { status: 400 });
  }

  try {
    const [users, clients] = await Promise.all([
      BridgeAPI.getUsers(agencyId),
      BridgeAPI.getClients(agencyId),
    ]);

    return NextResponse.json({
      success: true,
      state: {
        initialData: { users, clients, activityLogs: [], notifications: [] },
      },
    });
  } catch (err) {
    if (isDbUnavailable(err)) {
      console.warn('[API /bridge/state GET] DB unavailable — returning empty demo state');
      return NextResponse.json({
        success: true,
        demo: true,
        state: {
          initialData: { users: [], clients: [], activityLogs: [], notifications: [] },
        },
      });
    }
    console.error('[API /bridge/state GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: PostPayload;
  try {
    body = (await req.json()) as PostPayload;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  // ── Marketplace suite toggle / config update ───────────────────────────────
  if (isSuiteTogglePayload(body)) {
    const { agencyId, suiteId, enabled, config } = body;

    try {
      const { prisma } = await import('@aqua/bridge/data/prisma');
      await prisma.agency.upsert({
        where: { id: agencyId },
        update: {},
        create: { id: agencyId, name: agencyId },
      });

      const updateData: { enabled?: boolean; config?: string } = {};
      if (typeof enabled === 'boolean') updateData.enabled = enabled;
      if (config !== undefined) updateData.config = JSON.stringify(config ?? {});

      const createEnabled = typeof enabled === 'boolean' ? enabled : true;
      const createConfig = config !== undefined ? JSON.stringify(config ?? {}) : '{}';

      const record = await prisma.agencySuite.upsert({
        where: { agencyId_suiteId: { agencyId, suiteId } },
        update: updateData,
        create: { agencyId, suiteId, enabled: createEnabled, config: createConfig },
      });

      if (enabled === false) {
        console.info(`[API /bridge/state POST] Suite uninstalled — agencyId=${agencyId} suiteId=${suiteId}`);
      }
      return NextResponse.json({ success: true, agencySuite: record });
    } catch (err) {
      if (isDbUnavailable(err)) {
        console.warn(`[API /bridge/state POST] DB unavailable — accepting toggle in demo mode (agencyId=${agencyId} suiteId=${suiteId} enabled=${enabled})`);
        return NextResponse.json({
          success: true,
          demo: true,
          agencySuite: { agencyId, suiteId, enabled: enabled ?? true, config: JSON.stringify(config ?? {}) },
        });
      }
      console.error('[API /bridge/state POST suite]', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // ── Generic key/value persistence ──────────────────────────────────────────
  if (!body.agencyId || !body.key) {
    return NextResponse.json(
      { error: 'agencyId and either (suiteId+enabled|config) or (key+value) are required' },
      { status: 400 }
    );
  }

  try {
    await BridgeAPI.setState(body.agencyId, body.key, body.value);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (isDbUnavailable(err)) {
      console.warn(`[API /bridge/state POST] DB unavailable — accepting key=${body.key} in demo mode`);
      return NextResponse.json({ success: true, demo: true });
    }
    console.error('[API /bridge/state POST kv]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
