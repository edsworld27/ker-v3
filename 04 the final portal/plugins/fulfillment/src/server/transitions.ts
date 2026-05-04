// Phase transitions — advancing a client from one phase to the next.
//
// Algorithm (locked in `04-architecture.md §7` and Decisions log #4):
//
//   1. Disable old phase's plugins (`enabled = false`, config preserved).
//   2. Enable / install new phase's plugins (re-enable if already present).
//   3. Apply new phase's starter portal variant (T3 integration via
//      `StarterVariantService`).
//   4. Update `client.stage = toPhase.stage`.
//   5. Initialise the checklist progress for the new phase.
//   6. Append an `ActivityLog` entry.
//   7. Emit `phase.advanced` on the eventBus.
//
// Auto-disable, config preserved. Reversible. Never auto-uninstall.

import type {
  AgencyId,
  ClientId,
  Client,
  PhaseDefinition,
  UserId,
} from "../lib/tenancy";
import type {
  ActivityLogPort,
  ClientStorePort,
  EventBusPort,
  PluginRuntimePort,
  PluginInstallStorePort,
} from "./ports";
import type { ChecklistService } from "./checklist";
import type { StarterVariantService } from "./starterVariant";

export interface AdvancePhaseArgs {
  agencyId: AgencyId;
  clientId: ClientId;
  fromPhase: PhaseDefinition;
  toPhase: PhaseDefinition;
  actor: UserId;
}

export interface AdvancePhaseResult {
  ok: true;
  client: Client;
  disabled: string[];
  enabled: string[];
  variant: { ok: true; variantId: string } | { ok: false; error: string } | { skipped: true };
}

export interface AdvancePhaseFailure {
  ok: false;
  error: string;
  step: "disable" | "enable" | "variant" | "client" | "checklist" | "log";
  partial?: { disabled: string[]; enabled: string[] };
}

export class TransitionService {
  constructor(
    private clients: ClientStorePort,
    private installs: PluginInstallStorePort,
    private runtime: PluginRuntimePort,
    private activity: ActivityLogPort,
    private events: EventBusPort,
    private checklist: ChecklistService,
    private variants: StarterVariantService,
  ) {}

  async advancePhase(args: AdvancePhaseArgs): Promise<AdvancePhaseResult | AdvancePhaseFailure> {
    const scope = { agencyId: args.agencyId, clientId: args.clientId };

    // Sanity: same agency, both phases.
    if (args.fromPhase.agencyId !== args.agencyId || args.toPhase.agencyId !== args.agencyId) {
      return {
        ok: false,
        error: "Phase definitions don't belong to this agency.",
        step: "disable",
      };
    }

    // 1. Disable old phase plugins (only the ones not also in the new phase).
    const disabled: string[] = [];
    const newSet = new Set(args.toPhase.pluginPreset);
    for (const pluginId of args.fromPhase.pluginPreset) {
      if (newSet.has(pluginId)) continue;
      const result = await this.runtime.setEnabled({
        pluginId,
        scope,
        enabled: false,
        actor: args.actor,
      });
      if (!result.ok) {
        return {
          ok: false,
          error: `disable ${pluginId}: ${result.error}`,
          step: "disable",
          partial: { disabled, enabled: [] },
        };
      }
      disabled.push(pluginId);
    }

    // 2. Enable / install new phase plugins.
    const enabled: string[] = [];
    for (const pluginId of args.toPhase.pluginPreset) {
      const existing = await this.installs.getInstall(scope, pluginId);
      if (existing) {
        if (!existing.enabled) {
          const r = await this.runtime.setEnabled({
            pluginId,
            scope,
            enabled: true,
            actor: args.actor,
          });
          if (!r.ok) {
            return {
              ok: false,
              error: `re-enable ${pluginId}: ${r.error}`,
              step: "enable",
              partial: { disabled, enabled },
            };
          }
        }
      } else {
        const r = await this.runtime.installPlugin({
          pluginId,
          scope,
          installedBy: args.actor,
        });
        if (!r.ok) {
          return {
            ok: false,
            error: `install ${pluginId}: ${r.error}`,
            step: "enable",
            partial: { disabled, enabled },
          };
        }
      }
      enabled.push(pluginId);
    }

    // 3. Apply starter portal variant (T3 integration; no-op until T3 lands).
    let variant: AdvancePhaseResult["variant"] = { skipped: true };
    if (args.toPhase.portalVariantId) {
      variant = await this.variants.apply({
        agencyId: args.agencyId,
        clientId: args.clientId,
        variantId: args.toPhase.portalVariantId,
        role: "client-owner",
        actor: args.actor,
      });
      if (!variant.ok) {
        // Soft-fail: log + continue. The phase advance still succeeds —
        // the variant can be re-applied manually from the editor.
        this.activity.logActivity({
          agencyId: args.agencyId,
          clientId: args.clientId,
          actorUserId: args.actor,
          category: "phase",
          action: "phase.variant_apply_failed",
          message: `Variant ${args.toPhase.portalVariantId} could not be applied: ${variant.error}`,
          metadata: { variantId: args.toPhase.portalVariantId },
        });
      }
    }

    // 4. Update client.stage.
    const updated = await this.clients.updateClient(args.agencyId, args.clientId, {
      stage: args.toPhase.stage,
    });
    if (!updated) {
      return {
        ok: false,
        error: `client ${args.clientId} not found or not in agency ${args.agencyId}`,
        step: "client",
        partial: { disabled, enabled },
      };
    }

    // 5. Initialise checklist for the new phase.
    await this.checklist.initialiseFor({
      clientId: args.clientId,
      phase: args.toPhase,
    });

    // 6. Activity log.
    await this.activity.logActivity({
      agencyId: args.agencyId,
      clientId: args.clientId,
      actorUserId: args.actor,
      category: "phase",
      action: "phase.advanced",
      message: `Advanced to ${args.toPhase.label}.`,
      metadata: {
        from: args.fromPhase.id,
        fromStage: args.fromPhase.stage,
        to: args.toPhase.id,
        toStage: args.toPhase.stage,
        disabled,
        enabled,
      },
    });

    // 7. Event bus.
    this.events.emit(scope, "phase.advanced", {
      from: args.fromPhase.id,
      to: args.toPhase.id,
      fromStage: args.fromPhase.stage,
      toStage: args.toPhase.stage,
      disabled,
      enabled,
      actor: args.actor,
    });

    return { ok: true, client: updated, disabled, enabled, variant };
  }
}
