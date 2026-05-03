import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prevent initializing multiple Prisma Client instances in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * POST /api/sync
 * Auto-Sync Engine Endpoint
 * Receives JSON updates from the frontend and securely upserts them into the ApplicationState table.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value, agencyId } = body;

    if (!key || value === undefined || !agencyId) {
      return NextResponse.json(
        { error: 'Missing required fields (key, value, agencyId)' },
        { status: 400 }
      );
    }

    const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);

    const result = await prisma.applicationState.upsert({
      where: { agencyId_key: { agencyId, key } },
      update: { value: stringifiedValue },
      create: { agencyId, key, value: stringifiedValue },
    });

    return NextResponse.json({ success: true, updatedKey: result.key, agencyId });
  } catch (error) {
    console.error('[API Sync Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
