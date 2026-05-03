/**
 * POST /api/bridge/provision
 *
 * Provisions an AQUA Client workspace for a given client.
 * Delegates to Bridge sync which writes to DB and fires CLIENT_PROVISIONED event.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    // Fetch the client record from DB then provision workspace
    const { provisionClientWorkspace } = await import('@aqua/bridge/sync');
    const { prisma } = await import('@aqua/bridge/data/prisma');

    const dbClient = await prisma.client.findUnique({ where: { id: clientId } });
    if (!dbClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const result = await provisionClientWorkspace({
      id: dbClient.id,
      agencyId: dbClient.agencyId,
      name: dbClient.name,
      email: dbClient.email,
      stage: dbClient.stage as any,
      discoveryAnswers: JSON.parse(dbClient.discoveryAnswers),
      enabledSuiteIds: JSON.parse(dbClient.enabledSuiteIds),
      assignedEmployees: JSON.parse(dbClient.assignedEmployeeIds),
      cmsProvisioned: dbClient.cmsProvisioned,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Mark as provisioned in DB
    await prisma.client.update({
      where: { id: clientId },
      data: { cmsProvisioned: true },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[API /bridge/provision]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
