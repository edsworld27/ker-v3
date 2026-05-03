/**
 * GET  /api/bridge/state?agencyId=xxx  — fetch initial state for agency
 * POST /api/bridge/state               — persist a key-value state update
 */

import { NextRequest, NextResponse } from 'next/server';
import { BridgeAPI } from '@aqua/bridge/api';

export async function GET(req: NextRequest) {
  try {
    const agencyId = req.nextUrl.searchParams.get('agencyId');
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId is required' }, { status: 400 });
    }

    const [users, clients] = await Promise.all([
      BridgeAPI.getUsers(agencyId),
      BridgeAPI.getClients(agencyId),
    ]);

    return NextResponse.json({
      success: true,
      state: {
        initialData: {
          users,
          clients,
          activityLogs: [],
          notifications: [],
        },
      },
    });

  } catch (err) {
    console.error('[API /bridge/state GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { agencyId, key, value } = await req.json();

    if (!agencyId || !key) {
      return NextResponse.json({ error: 'agencyId and key are required' }, { status: 400 });
    }

    await BridgeAPI.setState(agencyId, key, value);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[API /bridge/state POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
