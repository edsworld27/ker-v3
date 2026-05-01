// Automation runtime — backs the Marketing Automation plugin.
//
// Drip campaigns + if-this-then-that rules. Each rule has a trigger
// (event name from the bus), optional filter conditions, and an
// ordered list of actions executed on match. Actions can include
// "wait N hours/days" steps which schedule future steps via setTimeout.
//
// In production-grade mode, the timeouts would land on a job queue
// like BullMQ; for now in-process timers with a hard cap.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import { on, type AquaEventName } from "./eventBus";
import { sendEmail } from "./email";

export type AutomationTrigger = AquaEventName;

export type AutomationAction =
  | { type: "send-email"; to?: string; templateId: string; variables?: Record<string, string> }
  | { type: "send-webhook"; url: string; payload?: Record<string, unknown> }
  | { type: "wait"; minutes: number }
  | { type: "tag-contact"; tag: string }
  | { type: "set-status"; resource: string; status: string }
  | { type: "log"; message: string };

export interface AutomationRule {
  id: string;
  orgId: string;
  name: string;
  trigger: AutomationTrigger;
  // JSON-path-style filter: payload[path] === value. Empty = always match.
  filter?: Array<{ path: string; equals: string | number | boolean }>;
  actions: AutomationAction[];
  enabled: boolean;
  createdAt: number;
}

export interface AutomationRun {
  id: string;
  orgId: string;
  ruleId: string;
  triggeredAt: number;
  completedAt?: number;
  status: "running" | "completed" | "failed";
  error?: string;
  steps: Array<{ action: AutomationAction; status: "pending" | "done" | "failed"; ranAt?: number; error?: string }>;
}

interface AutomationState {
  automationRules?: AutomationRule[];
  automationRuns?: AutomationRun[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Rules CRUD ────────────────────────────────────────────────────────────

export function listRules(orgId: string): AutomationRule[] {
  const s = getState() as unknown as AutomationState;
  return (s.automationRules ?? []).filter(r => r.orgId === orgId);
}

export interface CreateRuleInput {
  orgId: string;
  name: string;
  trigger: AutomationTrigger;
  filter?: AutomationRule["filter"];
  actions: AutomationAction[];
}

export function createRule(input: CreateRuleInput): AutomationRule {
  const rule: AutomationRule = {
    id: makeId("rule"),
    orgId: input.orgId,
    name: input.name,
    trigger: input.trigger,
    filter: input.filter,
    actions: input.actions,
    enabled: true,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as AutomationState;
    if (!s.automationRules) s.automationRules = [];
    s.automationRules.push(rule);
  });
  return rule;
}

export function setRuleEnabled(orgId: string, id: string, enabled: boolean): void {
  mutate(state => {
    const s = state as unknown as AutomationState;
    const rule = (s.automationRules ?? []).find(r => r.orgId === orgId && r.id === id);
    if (rule) rule.enabled = enabled;
  });
}

export function deleteRule(orgId: string, id: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as AutomationState;
    if (!s.automationRules) return;
    const before = s.automationRules.length;
    s.automationRules = s.automationRules.filter(r => !(r.orgId === orgId && r.id === id));
    removed = s.automationRules.length < before;
  });
  return removed;
}

export function listRuns(orgId: string, limit = 100): AutomationRun[] {
  const s = getState() as unknown as AutomationState;
  return (s.automationRuns ?? [])
    .filter(r => r.orgId === orgId)
    .slice(-limit)
    .reverse();
}

// ─── Rule matching + execution ─────────────────────────────────────────────

function matchesFilter(filter: AutomationRule["filter"], payload: unknown): boolean {
  if (!filter || filter.length === 0) return true;
  if (typeof payload !== "object" || !payload) return false;
  for (const f of filter) {
    const value = (payload as Record<string, unknown>)[f.path];
    if (value !== f.equals) return false;
  }
  return true;
}

function getPluginConfig(orgId: string): { maxRulesPerOrg: number; maxRunsPerDay: number } {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "automation");
  const c = (install?.config as Record<string, unknown> | undefined) ?? {};
  return {
    maxRulesPerOrg: typeof c.maxRulesPerOrg === "number" ? c.maxRulesPerOrg : 50,
    maxRunsPerDay:  typeof c.maxRunsPerDay === "number" ? c.maxRunsPerDay : 5000,
  };
}

async function executeAction(action: AutomationAction, orgId: string, payload: unknown): Promise<void> {
  switch (action.type) {
    case "send-email": {
      const to = action.to ?? (typeof payload === "object" && payload !== null ? (payload as Record<string, string>).email : undefined);
      if (!to) throw new Error("send-email: no recipient resolved");
      await sendEmail({
        orgId,
        to,
        subject: "",  // pulled from template
        templateId: action.templateId,
        variables: action.variables,
      });
      break;
    }
    case "send-webhook":
      await fetch(action.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, custom: action.payload }),
      });
      break;
    case "wait":
      await new Promise(resolve => setTimeout(resolve, action.minutes * 60_000));
      break;
    case "tag-contact":
    case "set-status":
    case "log":
      // No-op stubs — would call CRM / orders modules in production.
      console.info("[automation]", action.type, action);
      break;
  }
}

async function runRule(rule: AutomationRule, payload: unknown): Promise<void> {
  const run: AutomationRun = {
    id: makeId("arun"),
    orgId: rule.orgId,
    ruleId: rule.id,
    triggeredAt: Date.now(),
    status: "running",
    steps: rule.actions.map(action => ({ action, status: "pending" })),
  };
  mutate(state => {
    const s = state as unknown as AutomationState;
    if (!s.automationRuns) s.automationRuns = [];
    s.automationRuns.push(run);
    s.automationRuns = s.automationRuns.slice(-1000);
  });

  for (const step of run.steps) {
    try {
      await executeAction(step.action, rule.orgId, payload);
      step.status = "done";
      step.ranAt = Date.now();
    } catch (err) {
      step.status = "failed";
      step.error = err instanceof Error ? err.message : String(err);
      run.status = "failed";
      run.error = step.error;
      run.completedAt = Date.now();
      return;
    }
  }
  run.status = "completed";
  run.completedAt = Date.now();
}

// ─── Bus subscription ──────────────────────────────────────────────────────

let bound = false;
const recentRuns = new Map<string, number>();

function todayKey(orgId: string): string {
  return `${orgId}:${new Date().toISOString().slice(0, 10)}`;
}

export function bindAutomation(): void {
  if (bound) return;
  bound = true;
  on("*", async event => {
    const rules = listRules(event.orgId).filter(r =>
      r.enabled && r.trigger === event.name && matchesFilter(r.filter, event.payload),
    );
    if (rules.length === 0) return;

    const cfg = getPluginConfig(event.orgId);
    const key = todayKey(event.orgId);
    const usedToday = recentRuns.get(key) ?? 0;
    if (usedToday + rules.length > cfg.maxRunsPerDay) return;
    recentRuns.set(key, usedToday + rules.length);

    for (const rule of rules) {
      void runRule(rule, event.payload);
    }
  });
}

bindAutomation();
