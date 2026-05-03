/**
 * Bridge API — Server-side data operations
 *
 * These functions run in Next.js API routes or Server Actions.
 * The client-side app calls these via fetch — never imports prisma directly.
 *
 * Pattern:
 *   Client-side  →  fetch('/api/bridge/...')
 *   API Route    →  calls BridgeAPI.method()
 *   BridgeAPI    →  reads/writes Prisma DB
 */

import type { Client, AppUser, FulfilmentBrief } from '../types';
import { authenticate } from '../auth';

export const BridgeAPI = {

  // ── Auth ───────────────────────────────────────────────────────────────────

  async login(email: string, password?: string) {
    return authenticate(email, password);
  },

  // ── Agency Data ────────────────────────────────────────────────────────────

  async getAgency(agencyId: string) {
    const { prisma } = await import('../data/prisma');
    return prisma.agency.findUnique({
      where: { id: agencyId },
      include: { suiteAccess: true },
    });
  },

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUsers(agencyId: string): Promise<AppUser[]> {
    const { prisma } = await import('../data/prisma');
    const users = await prisma.user.findMany({
      where: { agencyId },
      orderBy: { name: 'asc' },
    });
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as any,
      agencyId: u.agencyId ?? undefined,
      clientId: u.clientId ?? undefined,
      avatar: u.avatar ?? undefined,
      department: u.department ?? undefined,
      status: u.status as any,
      baseSalaryCents: u.baseSalaryCents,
      productAccess: u.productAccess.split(',') as any,
    }));
  },

  async inviteUser(data: {
    email: string;
    name: string;
    role: string;
    agencyId: string;
    productAccess?: string[];
  }): Promise<{ success: boolean; userId?: number; error?: string }> {
    try {
      const { prisma } = await import('../data/prisma');
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          role: data.role,
          agencyId: data.agencyId,
          productAccess: (data.productAccess ?? ['operations']).join(','),
          status: 'active',
        },
      });
      const { BridgeEvents } = await import('../events');
      BridgeEvents.emit('USER_INVITED', {
        email: data.email,
        role: data.role,
        agencyId: data.agencyId,
      });
      return { success: true, userId: user.id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  // ── Clients ────────────────────────────────────────────────────────────────

  async getClients(agencyId: string): Promise<Client[]> {
    const { prisma } = await import('../data/prisma');
    const clients = await prisma.client.findMany({
      where: { agencyId },
      include: { resources: true },
      orderBy: { updatedAt: 'desc' },
    });
    return clients.map(c => ({
      id: c.id,
      agencyId: c.agencyId,
      name: c.name,
      email: c.email,
      stage: c.stage as any,
      logo: c.logo ?? undefined,
      websiteUrl: c.websiteUrl ?? undefined,
      brandColor: c.brandColor ?? undefined,
      portalName: c.portalName ?? undefined,
      discoveryAnswers: JSON.parse(c.discoveryAnswers),
      enabledSuiteIds: JSON.parse(c.enabledSuiteIds),
      assignedEmployees: JSON.parse(c.assignedEmployeeIds),
      assignedFreelancers: JSON.parse(c.assignedFreelancers),
      resources: c.resources.map(r => ({
        id: r.id,
        name: r.name,
        url: r.url,
        type: r.type,
        uploadedBy: r.uploadedBy ?? undefined,
        uploadedAt: r.uploadedAt.toISOString(),
      })),
      cmsProvisioned: c.cmsProvisioned,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  },

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    client?: Client;
    error?: string;
  }> {
    try {
      const { prisma } = await import('../data/prisma');
      const { provisionClientWorkspace } = await import('../sync');

      const created = await prisma.client.create({
        data: {
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

      const fullClient: Client = {
        ...client,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
      };

      // Provision their AQUA Client workspace
      await provisionClientWorkspace(fullClient);

      return { success: true, client: fullClient };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  async updateClientStage(clientId: string, stage: string): Promise<{ success: boolean }> {
    const { syncClientStage } = await import('../sync');
    await syncClientStage(clientId, stage);
    return { success: true };
  },

  // ── Fulfilment ─────────────────────────────────────────────────────────────

  async getBriefs(clientId: string): Promise<FulfilmentBrief[]> {
    const { prisma } = await import('../data/prisma');
    const briefs = await prisma.fulfilmentBrief.findMany({
      where: { clientId },
      include: { assignees: true },
      orderBy: { createdAt: 'desc' },
    });
    return briefs.map(b => ({
      id: b.id,
      clientId: b.clientId,
      title: b.title,
      description: b.description,
      dueDate: b.dueDate ?? undefined,
      status: b.status as any,
      assignedTo: b.assignees.map(a => a.userId),
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
  },

  // ── App State (key-value persistence) ─────────────────────────────────────

  async getState(agencyId: string, key: string): Promise<any | null> {
    try {
      const { prisma } = await import('../data/prisma');
      const record = await prisma.applicationState.findUnique({
        where: { agencyId_key: { agencyId, key } },
      });
      return record ? JSON.parse(record.value) : null;
    } catch { return null; }
  },

  async setState(agencyId: string, key: string, value: any): Promise<void> {
    try {
      const { prisma } = await import('../data/prisma');
      await prisma.applicationState.upsert({
        where: { agencyId_key: { agencyId, key } },
        update: { value: JSON.stringify(value) },
        create: { agencyId, key, value: JSON.stringify(value) },
      });
    } catch (err) {
      console.error(`[BridgeAPI] setState failed for ${key}:`, err);
    }
  },
};
