/**
 * POST /api/bridge/auth
 * Bridge authentication endpoint.
 * Resolves user credentials → tenant → role → session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@aqua/bridge/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await authenticate(email, password);

    if (!result.success) {
      return NextResponse.json({ error: (result as any).error }, { status: 401 });
    }

    return NextResponse.json({ session: result.session });

  } catch (err) {
    console.error('[API /bridge/auth]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
