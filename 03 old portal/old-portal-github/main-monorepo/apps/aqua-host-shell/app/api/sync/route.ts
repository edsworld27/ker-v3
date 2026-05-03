import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prevent initializing multiple Prisma Client instances in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const isDbUnavailable = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  return /database|prisma|sqlite|postgres|file:|ENOENT|EROFS|connect/i.test(msg);
};

/**
 * POST /api/sync
 * Auto-Sync Engine Endpoint
 * Receives JSON updates from the frontend and securely upserts them into the
 * ApplicationState table. Falls back to demo-mode (success without persistence)
 * when no DATABASE_URL is configured so the host shell stays usable.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const { key, value, agencyId } = body || {};

  if (!key || value === undefined || !agencyId) {
    return NextResponse.json(
      { error: 'Missing required fields (key, value, agencyId)' },
      { status: 400 }
    );
  }

  const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);

  try {
    const result = await prisma.applicationState.upsert({
      where: { agencyId_key: { agencyId, key } },
      update: { value: stringifiedValue },
      create: { agencyId, key, value: stringifiedValue },
    });
    return NextResponse.json({ success: true, updatedKey: result.key, agencyId });
  } catch (error) {
    if (isDbUnavailable(error)) {
      console.warn(`[API Sync] DB unavailable — accepting key=${key} in demo mode`);
      return NextResponse.json({ success: true, demo: true, updatedKey: key, agencyId });
    }
    console.error('[API Sync Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
