/**
 * Bridge Sync — Push/Pull between AQUA Client and Operations
 *
 * When something happens in AQUA Client (phase change, brief submitted, approval),
 * this module ensures Operations sees it — and vice versa.
 *
 * All sync calls go through here. No direct cross-product DB reads allowed.
 */

import type { Client, FulfilmentBrief, FulfilmentDeliverable } from '../types';
import { BridgeEvents } from '../events';

// ── Client Lifecycle ──────────────────────────────────────────────────────────

/**
 * Called from Operations when a new client is created.
 * Provisions their AQUA Client workspace.
 */
export async function provisionClientWorkspace(client: Client): Promise<{
  success: boolean;
  clientId: string;
  error?: string;
}> {
  console.log(`[Bridge Sync] Provisioning AQUA Client workspace for: ${client.name}`);

  try {
    const { prisma } = await import('../data/prisma');

    // Create or update the client record
    await prisma.client.upsert({
      where: { id: client.id },
      update: {
        name: client.name,
        email: client.email,
        stage: client.stage,
        enabledSuiteIds: JSON.stringify(client.enabledSuiteIds),
        updatedAt: new Date(),
      },
      create: {
        id: client.id,
        agencyId: client.agencyId,
        name: client.name,
        email: client.email,
        stage: client.stage,
        discoveryAnswers: JSON.stringify(client.discoveryAnswers ?? {}),
        enabledSuiteIds: JSON.stringify(client.enabledSuiteIds ?? []),
        assignedEmployeeIds: JSON.stringify(client.assignedEmployees ?? []),
        cmsProvisioned: false,
      },
    });

    // Emit event so Operations UI can react without a page refresh
    BridgeEvents.emit('CLIENT_PROVISIONED', { clientId: client.id, name: client.name });

    console.log(`[Bridge Sync] Client workspace ready: ${client.id}`);
    return { success: true, clientId: client.id };

  } catch (err) {
    console.error('[Bridge Sync] Provision failed:', err);
    return { success: false, clientId: client.id, error: String(err) };
  }
}

/**
 * Called from AQUA Client when a client's phase/stage changes.
 * Syncs back to Operations so account managers stay informed.
 */
export async function syncClientStage(
  clientId: string,
  newStage: string
): Promise<void> {
  try {
    const { prisma } = await import('../data/prisma');

    await prisma.client.update({
      where: { id: clientId },
      data: { stage: newStage, updatedAt: new Date() },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        clientId,
        type: 'Stage Change',
        message: `Client moved to ${newStage} stage`,
        category: 'lifecycle',
      },
    });

    BridgeEvents.emit('CLIENT_STAGE_CHANGED', { clientId, stage: newStage });

  } catch (err) {
    console.error('[Bridge Sync] Stage sync failed:', err);
  }
}

// ── Fulfilment ────────────────────────────────────────────────────────────────

/**
 * Called from AQUA Client when a client submits a new brief.
 * Fulfilment team sees it immediately in their portal.
 */
export async function createBrief(brief: Omit<FulfilmentBrief, 'id' | 'createdAt'>): Promise<{
  success: boolean;
  brief?: FulfilmentBrief;
  error?: string;
}> {
  try {
    const { prisma } = await import('../data/prisma');

    const created = await prisma.fulfilmentBrief.create({
      data: {
        clientId: brief.clientId,
        title: brief.title,
        description: brief.description,
        dueDate: brief.dueDate ?? null,
        status: brief.status ?? 'brief',
      },
    });

    // Assign team members if provided.
    // skipDuplicates is only supported on PostgreSQL/MongoDB; SQLite (dev)
    // doesn't expose it on the typed client. Pre-dedupe instead.
    if (brief.assignedTo && brief.assignedTo.length > 0) {
      const uniqueUserIds = Array.from(new Set(brief.assignedTo));
      await prisma.briefAssignment.createMany({
        data: uniqueUserIds.map(userId => ({ briefId: created.id, userId })),
      });
    }

    BridgeEvents.emit('BRIEF_CREATED', { briefId: created.id, clientId: brief.clientId });

    return {
      success: true,
      brief: {
        ...brief,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
      },
    };

  } catch (err) {
    console.error('[Bridge Sync] Create brief failed:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Called from AQUA Client fulfilment portal when a deliverable is submitted.
 * Client gets notified to approve.
 */
export async function submitDeliverable(
  deliverable: Omit<FulfilmentDeliverable, 'id' | 'submittedAt'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { prisma } = await import('../data/prisma');

    const created = await prisma.fulfilmentDeliverable.create({
      data: {
        briefId: deliverable.briefId,
        clientId: deliverable.clientId,
        title: deliverable.title,
        url: deliverable.url ?? null,
        notes: deliverable.notes ?? null,
        submittedBy: deliverable.submittedBy,
        status: 'review',
      },
    });

    // Update brief status to 'review'
    await prisma.fulfilmentBrief.update({
      where: { id: deliverable.briefId },
      data: { status: 'review', updatedAt: new Date() },
    });

    BridgeEvents.emit('DELIVERABLE_SUBMITTED', {
      deliverableId: created.id,
      clientId: deliverable.clientId,
      briefId: deliverable.briefId,
    });

    return { success: true };

  } catch (err) {
    console.error('[Bridge Sync] Submit deliverable failed:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Called when a client approves a deliverable.
 * Notifies fulfilment team and triggers invoicing signal in Operations.
 */
export async function approveDeliverable(
  deliverableId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { prisma } = await import('../data/prisma');

    await prisma.fulfilmentDeliverable.update({
      where: { id: deliverableId },
      data: { status: 'approved', approvedAt: new Date() },
    });

    // Signal Operations to trigger invoicing check
    BridgeEvents.emit('DELIVERABLE_APPROVED', { deliverableId, clientId });
    // Operations Finance suite listens to this to prompt invoice creation
    BridgeEvents.emit('INVOICE_TRIGGER', { clientId, deliverableId });

    return { success: true };

  } catch (err) {
    console.error('[Bridge Sync] Approve deliverable failed:', err);
    return { success: false, error: String(err) };
  }
}

// ── Data Reads (Operations pulling Client data) ───────────────────────────────

/**
 * Operations uses this to pull the fulfilment status of all clients.
 * Account managers see a high-level view without being in the weeds.
 */
export async function getClientFulfilmentSummary(agencyId: string) {
  try {
    const { prisma } = await import('../data/prisma');

    const clients = await prisma.client.findMany({
      where: { agencyId },
      include: {
        briefs: {
          select: { id: true, status: true, title: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 3,
        },
      },
    });

    return clients.map(c => ({
      clientId: c.id,
      clientName: c.name,
      stage: c.stage,
      activeBriefs: c.briefs.filter(b => !['complete'].includes(b.status)).length,
      lastActivity: c.briefs[0]?.updatedAt?.toISOString() ?? c.updatedAt.toISOString(),
    }));

  } catch (err) {
    console.error('[Bridge Sync] getClientFulfilmentSummary failed:', err);
    return [];
  }
}
