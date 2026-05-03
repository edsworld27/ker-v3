/**
 * Bridge Auth — Credential Resolution + Multi-Tenancy
 *
 * Flow:
 *   1. User submits email (and optional password)
 *   2. Bridge looks up User in Prisma DB
 *   3. Bridge resolves their Agency (tenant) + Role
 *   4. Bridge returns a BridgeSession — which product(s) they access,
 *      which suites are enabled, what data they can see
 *
 * Role → Product mapping:
 *   Founder / AgencyManager / AgencyEmployee  →  Operations (+ Client if assigned)
 *   ClientOwner / ClientEmployee              →  AQUA Client portal only
 *   Freelancer                                →  AQUA Client fulfilment only
 */

import type { BridgeSession, AppUser, Agency, PortalProduct } from '../types';

// Demo session — no DB needed, God-mode access for testing
const DEMO_EMAIL = 'demo@aqua.portal';

const DEMO_SESSION: BridgeSession = {
  user: {
    id: 0,
    name: 'Demo Founder',
    email: DEMO_EMAIL,
    role: 'Founder',
    agencyId: 'demo-agency',
    productAccess: ['operations', 'client', 'crm'],
    status: 'active',
  },
  agency: {
    id: 'demo-agency',
    name: 'Aqua Demo Agency',
    isConfigured: true,
    theme: { primary: '#6366f1', secondary: '#8b5cf6' },
  },
  enabledSuiteIds: ['*'], // all suites
  productAccess: ['operations', 'client', 'crm'],
  isDemo: true,
};

/**
 * Resolve which products a role can access.
 */
function resolveProductAccess(role: string, productAccessField?: string): PortalProduct[] {
  // If explicitly stored on user record, use that
  if (productAccessField) {
    return productAccessField.split(',').map(p => p.trim()) as PortalProduct[];
  }
  // Derive from role
  if (['Founder', 'AgencyManager', 'AgencyEmployee'].includes(role)) {
    return ['operations', 'crm'];
  }
  if (role === 'Freelancer') {
    return ['client']; // fulfilment portal only
  }
  if (['ClientOwner', 'ClientEmployee'].includes(role)) {
    return ['client'];
  }
  return ['operations'];
}

/**
 * Authenticate a user and return their full Bridge session.
 * Called from the App Shell login flow.
 */
export async function authenticate(
  email: string,
  _password?: string
): Promise<{ success: true; session: BridgeSession } | { success: false; error: string }> {

  // Demo shortcut
  if (email === DEMO_EMAIL || email === 'demo') {
    return { success: true, session: DEMO_SESSION };
  }

  try {
    // Dynamic import so this only runs server-side (Next.js API routes / Server Components)
    const { prisma } = await import('../data/prisma');

    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        agency: {
          include: { suiteAccess: true },
        },
      },
    });

    if (!dbUser) {
      return { success: false, error: 'No account found for that email.' };
    }

    if (dbUser.status === 'inactive') {
      return { success: false, error: 'This account has been deactivated.' };
    }

    const productAccess = resolveProductAccess(dbUser.role, dbUser.productAccess);

    const user: AppUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as any,
      customRoleId: dbUser.customRoleId ?? undefined,
      agencyId: dbUser.agencyId ?? undefined,
      clientId: dbUser.clientId ?? undefined,
      avatar: dbUser.avatar ?? undefined,
      bio: dbUser.bio ?? undefined,
      department: dbUser.department ?? undefined,
      status: dbUser.status as any,
      locationType: dbUser.locationType ?? undefined,
      baseSalaryCents: dbUser.baseSalaryCents,
      joinedDate: dbUser.joinedDate ?? undefined,
      productAccess,
    };

    const agency: Agency = dbUser.agency
      ? {
          id: dbUser.agency.id,
          name: dbUser.agency.name,
          logo: dbUser.agency.logo ?? undefined,
          domain: dbUser.agency.domain ?? undefined,
          isConfigured: dbUser.agency.isConfigured,
          theme: { primary: dbUser.agency.primaryColor, secondary: '#8b5cf6' },
        }
      : { id: 'local', name: 'Local Agency', isConfigured: false };

    const enabledSuiteIds = dbUser.agency?.suiteAccess
      .filter(s => s.enabled)
      .map(s => s.suiteId) ?? [];

    const session: BridgeSession = {
      user,
      agency,
      enabledSuiteIds,
      productAccess,
      isDemo: false,
    };

    return { success: true, session };

  } catch (err) {
    console.error('[Bridge Auth] DB error, falling back to local seed', err);

    // Fallback — local seed users (dev mode without a live DB)
    const { seedUsers } = await import('../data/seed');
    const found = seedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) return { success: false, error: 'User not found.' };

    const productAccess = resolveProductAccess(found.role);
    const session: BridgeSession = {
      user: { ...found, productAccess },
      agency: { id: 'local', name: 'Local Dev Agency', isConfigured: true },
      enabledSuiteIds: found.role === 'Founder' ? ['*'] : [],
      productAccess,
      isDemo: false,
    };

    return { success: true, session };
  }
}

/**
 * Validate a session token (for persistent login).
 */
export async function validateSession(
  token: string
): Promise<{ valid: true; session: BridgeSession } | { valid: false }> {
  try {
    const { prisma } = await import('../data/prisma');

    const dbSession = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            agency: { include: { suiteAccess: true } },
          },
        },
      },
    });

    if (!dbSession || dbSession.expiresAt < new Date()) {
      return { valid: false };
    }

    const result = await authenticate(dbSession.user.email);
    if (!result.success) return { valid: false };

    return { valid: true, session: result.session };
  } catch {
    return { valid: false };
  }
}

export { DEMO_SESSION, DEMO_EMAIL };
