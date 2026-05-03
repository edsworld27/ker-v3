import "server-only";
// Internal event bus — typed pub/sub for plugins.
//
// Decouples plugins from each other. Phase engine emits "phase.advanced",
// the fulfillment plugin subscribes; the website-editor plugin subscribes
// to "client.created" to seed a starter portal. No direct imports between
// feature modules.
//
// Handlers run in their own microtask via Promise.resolve().then(...) so a
// slow handler doesn't block the originating request. Errors are logged,
// not re-thrown — emit is fire-and-forget.

export type AquaEventName =
  // Tenant lifecycle
  | "agency.created"
  | "client.created"
  | "client.updated"
  | "client.archived"
  | "client.stage_changed"
  // Auth
  | "user.signed_up"
  | "user.signed_in"
  | "user.password_reset"
  // Plugins
  | "plugin.installed"
  | "plugin.uninstalled"
  | "plugin.enabled"
  | "plugin.disabled"
  | "plugin.configured"
  // Phases
  | "phase.advanced"
  | "phase.checklist_item_completed"
  // Fulfillment (T2 will emit these)
  | "brief.created"
  | "deliverable.submitted"
  | "deliverable.approved"
  // Website-editor (T3)
  | "page.published";

export interface AquaEvent<T = unknown> {
  name: AquaEventName;
  agencyId: string;
  clientId?: string;
  payload: T;
  emittedAt: number;
}

type Handler = (event: AquaEvent) => void | Promise<void>;

const SUBSCRIBERS: Map<AquaEventName, Set<Handler>> = new Map();
const WILDCARD: Set<Handler> = new Set();

export function on(name: AquaEventName | "*", handler: Handler): () => void {
  if (name === "*") {
    WILDCARD.add(handler);
    return () => { WILDCARD.delete(handler); };
  }
  let set = SUBSCRIBERS.get(name);
  if (!set) {
    set = new Set();
    SUBSCRIBERS.set(name, set);
  }
  set.add(handler);
  const ref = set;
  return () => { ref.delete(handler); };
}

export function emit<T = unknown>(
  scope: { agencyId: string; clientId?: string },
  name: AquaEventName,
  payload: T,
): void {
  const event: AquaEvent<T> = {
    name,
    agencyId: scope.agencyId,
    clientId: scope.clientId,
    payload,
    emittedAt: Date.now(),
  };
  const targets = [
    ...(SUBSCRIBERS.get(name) ?? []),
    ...WILDCARD,
  ];
  for (const handler of targets) {
    Promise.resolve()
      .then(() => handler(event))
      .catch(err => console.error(`[eventBus] handler for ${name} threw:`, err));
  }
}

export function describeSubscribers(): Array<{ event: string; handlers: number }> {
  const out: Array<{ event: string; handlers: number }> = [];
  for (const [name, set] of SUBSCRIBERS.entries()) {
    out.push({ event: name, handlers: set.size });
  }
  if (WILDCARD.size > 0) out.push({ event: "*", handlers: WILDCARD.size });
  return out;
}
