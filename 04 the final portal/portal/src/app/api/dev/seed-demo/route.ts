// Demo seed endpoint — dev-only.
//
// Stands up a Demo Agency + Felicia mirror with brand kits, fulfillment
// installed (auto via core), Felicia at "onboarding" stage, and a
// half-ticked checklist so the phase board has visible state.
//
// Gated on:
//   • `NEXT_PUBLIC_DEV_BYPASS=1` (any caller), OR
//   • An authenticated agency-owner / agency-manager session.

import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { ensureHydrated } from "@/server/storage";
import { getSession } from "@/lib/server/auth";
import { bootstrapAgency } from "@/server/agencyBootstrap";
import { createClient, getAgencyBySlug, listAgencies, listClients } from "@/server/tenants";
import { createUser, getUser } from "@/server/users";
import { listPhasesForAgency } from "@/server/phases";
import { logActivity } from "@/server/activity";
import { makePluginStorage } from "@/lib/server/pluginStorage";
import { getInstall } from "@/server/pluginInstalls";
import type { Agency, Client, PhaseDefinition } from "@/server/types";

const DEMO_AGENCY_SLUG = "demo-agency";
const DEMO_AGENCY_NAME = "Demo · Aqua";
const DEMO_OWNER_EMAIL = "demo@aqua.dev";
const DEMO_OWNER_PASSWORD = "demo-aqua-2026";
const DEMO_CLIENT_SLUG = "luv-and-ker-demo";
const DEMO_CLIENT_NAME = "Luv & Ker · Demo";
const DEMO_CLIENT_EMAIL = "felicia@luvandker.demo";
const DEMO_CLIENT_PASSWORD = "felicia-demo-2026";

interface ChecklistItemState { done: boolean; doneAt?: number; doneBy?: string; notes?: string }
interface ChecklistProgress {
  clientId: string;
  phaseId: string;
  items: Record<string, ChecklistItemState>;
  updatedAt: number;
}

function checklistKey(clientId: string, phaseId: string) { return `progress:${clientId}:${phaseId}`; }

async function gateAllowed(req: NextRequest): Promise<{ ok: boolean; actor?: string }> {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS === "1") return { ok: true };
  const session = await getSession();
  if (!session) return { ok: false };
  if (session.role === "agency-owner" || session.role === "agency-manager") {
    return { ok: true, actor: session.userId };
  }
  return { ok: false };
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  const gate = await gateAllowed(req);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const actor = gate.actor;

  // Idempotent: if Demo Agency already exists, return its ids.
  let agency: Agency | null = getAgencyBySlug(DEMO_AGENCY_SLUG);
  let createdAgency = false;
  if (!agency) {
    const result = await bootstrapAgency(
      {
        name: DEMO_AGENCY_NAME,
        slug: DEMO_AGENCY_SLUG,
        ownerEmail: DEMO_OWNER_EMAIL,
        brand: {
          primaryColor: "#06B6D4",          // cyan-500
          secondaryColor: "#0E7490",         // cyan-700
          accentColor: "#F472B6",            // pink-400
          fontHeading: "ui-sans-serif, system-ui",
          fontBody: "ui-sans-serif, system-ui",
          borderRadius: "14px",
        },
      },
      actor,
    );
    agency = result.agency;
    createdAgency = true;
  }

  // Demo owner user.
  if (!getUser(DEMO_OWNER_EMAIL)) {
    createUser({
      email: DEMO_OWNER_EMAIL,
      password: DEMO_OWNER_PASSWORD,
      name: "Demo Owner",
      role: "agency-owner",
      agencyId: agency.id,
    });
  }

  // Demo client.
  const existingClients = listClients(agency.id);
  let client: Client | undefined = existingClients.find(c => c.slug === DEMO_CLIENT_SLUG);
  let createdClient = false;
  if (!client) {
    client = createClient(agency.id, {
      name: DEMO_CLIENT_NAME,
      slug: DEMO_CLIENT_SLUG,
      ownerEmail: DEMO_CLIENT_EMAIL,
      websiteUrl: "https://luvandker.com",
      stage: "onboarding",
      brand: {
        primaryColor: "#F97316",            // orange-500
        secondaryColor: "#FFF7ED",           // cream
        accentColor: "#7C3AED",
        fontHeading: "Playfair Display, ui-serif, Georgia",
        fontBody: "ui-sans-serif, system-ui",
        borderRadius: "8px",
      },
    });
    createdClient = true;
  }

  // Demo client-owner user.
  if (!getUser(DEMO_CLIENT_EMAIL)) {
    createUser({
      email: DEMO_CLIENT_EMAIL,
      password: DEMO_CLIENT_PASSWORD,
      name: "Felicia (demo)",
      role: "client-owner",
      agencyId: agency.id,
      clientId: client.id,
    });
  }

  // Seed half-ticked checklist progress for the client's current phase.
  // Fulfillment is installed agency-wide (core: true), so the per-install
  // namespace lives at the agency-scoped install id.
  const fulfillmentInstall = getInstall({ agencyId: agency.id }, "fulfillment");
  let seededChecklist: { phaseId: string; ticked: number; total: number } | null = null;
  if (fulfillmentInstall) {
    const phases: PhaseDefinition[] = listPhasesForAgency(agency.id);
    const phase = phases.find(p => p.stage === client.stage);
    if (phase && phase.checklist.length > 0) {
      const storage = makePluginStorage(fulfillmentInstall.id);
      const items: Record<string, ChecklistItemState> = {};
      // Tick the first half of the items.
      const total = phase.checklist.length;
      const halfCount = Math.max(1, Math.floor(total / 2));
      for (let i = 0; i < total; i++) {
        const item = phase.checklist[i]!;
        items[item.id] = i < halfCount
          ? { done: true, doneAt: Date.now() - (total - i) * 60_000, doneBy: actor ?? "demo-seed" }
          : { done: false };
      }
      const progress: ChecklistProgress = {
        clientId: client.id,
        phaseId: phase.id,
        items,
        updatedAt: Date.now(),
      };
      await storage.set(checklistKey(client.id, phase.id), progress);
      seededChecklist = { phaseId: phase.id, ticked: halfCount, total };
    }
  }

  logActivity({
    agencyId: agency.id,
    clientId: client.id,
    actorUserId: actor,
    category: "system",
    action: "demo.seeded",
    message: `Demo agency + Felicia mirror ready (${createdAgency ? "new" : "existing"} agency, ${createdClient ? "new" : "existing"} client).`,
    metadata: { seededChecklist, idempotent: !createdAgency && !createdClient },
  });

  return NextResponse.json({
    ok: true,
    agency: { id: agency.id, name: agency.name, slug: agency.slug },
    client: { id: client.id, name: client.name, stage: client.stage },
    credentials: {
      owner: { email: DEMO_OWNER_EMAIL, password: DEMO_OWNER_PASSWORD, role: "agency-owner" },
      client: { email: DEMO_CLIENT_EMAIL, password: DEMO_CLIENT_PASSWORD, role: "client-owner" },
    },
    seededChecklist,
    bootstrapped: { agency: createdAgency, client: createdClient },
    correlationId: crypto.randomBytes(4).toString("hex"),
  });
}

export async function GET() {
  await ensureHydrated();
  const agencies = listAgencies();
  return NextResponse.json({
    ok: true,
    agencies: agencies.map(a => ({ id: a.id, slug: a.slug, name: a.name })),
    hint: "POST to seed Demo Agency + Felicia mirror.",
  });
}
