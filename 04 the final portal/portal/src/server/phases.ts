import "server-only";
// Phases — lifecycle stages (Discovery → Live → Churned). T2 owns the
// full implementation: phase definitions, transitions, checklist UI.
// Foundation just exposes the read API so the chrome can label the
// current stage and the architecture's contract type is satisfied.

import { getState } from "./storage";
import type { ClientStage, PhaseDefinition } from "./types";

// Six default stages from `04-architecture.md §7`. Surfaced as label
// strings here so the chrome can render `<span>{phaseLabel(stage)}</span>`
// without depending on T2's full module.
const DEFAULT_PHASE_LABELS: Record<ClientStage, string> = {
  lead: "Lead",
  discovery: "Discovery",
  design: "Design",
  development: "Development",
  onboarding: "Onboarding",
  live: "Live",
  churned: "Churned",
};

export function phaseLabel(stage: ClientStage): string {
  return DEFAULT_PHASE_LABELS[stage] ?? stage;
}

export function listPhasesForAgency(agencyId: string): PhaseDefinition[] {
  return Object.values(getState().phases)
    .filter(p => p.agencyId === agencyId)
    .sort((a, b) => a.order - b.order);
}

export function getPhase(id: string): PhaseDefinition | null {
  return getState().phases[id] ?? null;
}
