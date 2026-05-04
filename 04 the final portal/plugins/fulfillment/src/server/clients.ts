// Client creation flow with phase preset application.
//
// Splits cleanly into three steps that the API handler / page wraps in a
// transaction-flavoured "all-or-nothing":
//
//   1. Create the Client row (`clientStore.createClient`).
//   2. Install the phase's plugin preset for this client.
//   3. Apply the starter portal variant.
//   4. Initialise the checklist for the phase.
//   5. Activity log + event.
//
// On failure mid-flight the partial state is logged but not rolled back —
// the agency owner sees a client in an "incomplete" state and can retry.
// Future hardening: wrap in a unit-of-work once the storage layer
// exposes one.

import type {
  AgencyId,
  BrandKit,
  Client,
  ClientStage,
  PhaseDefinition,
  UserId,
} from "../lib/tenancy";
import type {
  ActivityLogPort,
  ClientStorePort,
  EventBusPort,
  PluginRuntimePort,
} from "./ports";
import type { ChecklistService } from "./checklist";
import type { PhaseService } from "./phases";
import type { StarterVariantService } from "./starterVariant";

export interface CreateClientWithPhaseInput {
  agencyId: AgencyId;
  actor: UserId;
  name: string;
  slug?: string;
  ownerEmail?: string;
  websiteUrl?: string;
  stage: ClientStage;             // pick one of the agency's phase rows
  brand?: Partial<BrandKit>;
}

export interface CreateClientWithPhaseResult {
  client: Client;
  phase: PhaseDefinition;
  installs: { pluginId: string; ok: boolean; error?: string }[];
  variant:
    | { ok: true; variantId: string; pageId?: string; siteId?: string }
    | { ok: false; error: string }
    | { skipped: true };
}

export class ClientLifecycleService {
  constructor(
    private clients: ClientStorePort,
    private runtime: PluginRuntimePort,
    private activity: ActivityLogPort,
    private events: EventBusPort,
    private phases: PhaseService,
    private checklist: ChecklistService,
    private variants: StarterVariantService,
  ) {}

  async createWithPhase(input: CreateClientWithPhaseInput): Promise<CreateClientWithPhaseResult> {
    const phase = await this.phases.getPhaseForStage(input.agencyId, input.stage);
    if (!phase) {
      throw new Error(
        `No phase definition for agency=${input.agencyId} stage=${input.stage}. ` +
        `Run seedDefaultPhases() first.`,
      );
    }

    const client = await this.clients.createClient(input.agencyId, {
      name: input.name,
      slug: input.slug,
      ownerEmail: input.ownerEmail,
      websiteUrl: input.websiteUrl,
      stage: input.stage,
      brand: input.brand,
    });

    const scope = { agencyId: input.agencyId, clientId: client.id };

    // Install the phase's preset plugins for this client.
    const installs: CreateClientWithPhaseResult["installs"] = [];
    for (const pluginId of phase.pluginPreset) {
      const r = await this.runtime.installPlugin({
        pluginId,
        scope,
        installedBy: input.actor,
      });
      if (r.ok) {
        installs.push({ pluginId, ok: true });
      } else {
        installs.push({ pluginId, ok: false, error: r.error });
      }
    }

    // Apply starter portal variant (no-op shim until T3 ships).
    let variant: CreateClientWithPhaseResult["variant"] = { skipped: true };
    if (phase.portalVariantId) {
      variant = await this.variants.apply({
        agencyId: input.agencyId,
        clientId: client.id,
        variantId: phase.portalVariantId,
        role: "login",
        actor: input.actor,
      });
    }

    // Initialise checklist progress for the new phase.
    await this.checklist.initialiseFor({ clientId: client.id, phase });

    // Activity log.
    await this.activity.logActivity({
      agencyId: input.agencyId,
      clientId: client.id,
      actorUserId: input.actor,
      category: "tenant",
      action: "client.created",
      message: `Created ${client.name} in ${phase.label} phase.`,
      metadata: {
        phaseId: phase.id,
        stage: phase.stage,
        installedPlugins: installs.filter(i => i.ok).map(i => i.pluginId),
        failedPlugins: installs.filter(i => !i.ok).map(i => i.pluginId),
      },
    });

    // Note: T1's `tenants.createClient` already emits `client.created`.
    // We don't re-emit to avoid double-firing handlers.

    return { client, phase, installs, variant };
  }
}
