// Internal event bus — emits typed events that the Webhooks plugin
// subscribes to. Other plugins (Email, Analytics) can also listen
// in-process for non-webhook side effects.
//
// Events are emitted via emit(orgId, event); subscribers register
// with on(eventName, handler). Handlers run synchronously in the
// emit call's microtask, so a slow handler doesn't block the
// originating request — but they must not throw (errors are
// swallowed and logged).

import "server-only";

export type AquaEventName =
  | "order.created"
  | "order.paid"
  | "order.refunded"
  | "order.fulfilled"
  | "order.shipped"
  | "form.submitted"
  | "newsletter.subscribed"
  | "newsletter.unsubscribed"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.cancelled"
  | "subscription.renewed"
  | "subscription.payment_failed"
  | "page.published"
  | "page.reverted"
  | "blog.post.published"
  | "user.signed_up"
  | "user.signed_in"
  | "user.password_reset"
  | "plugin.installed"
  | "plugin.uninstalled"
  | "plugin.configured";

export interface AquaEvent<T = unknown> {
  name: AquaEventName;
  orgId: string;
  payload: T;
  emittedAt: number;
}

type Handler = (event: AquaEvent) => void | Promise<void>;

const SUBSCRIBERS: Map<AquaEventName, Set<Handler>> = new Map();
const WILDCARD: Set<Handler> = new Set();

export function on(name: AquaEventName | "*", handler: Handler): () => void {
  if (name === "*") {
    WILDCARD.add(handler);
    return () => WILDCARD.delete(handler);
  }
  let set = SUBSCRIBERS.get(name);
  if (!set) { set = new Set(); SUBSCRIBERS.set(name, set); }
  set.add(handler);
  return () => set!.delete(handler);
}

export function emit<T = unknown>(orgId: string, name: AquaEventName, payload: T): void {
  const event: AquaEvent<T> = { name, orgId, payload, emittedAt: Date.now() };
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

// Useful for tests + diagnostics — list current subscriber counts.
export function describeSubscribers(): Array<{ event: string; handlers: number }> {
  const out: Array<{ event: string; handlers: number }> = [];
  for (const [name, set] of SUBSCRIBERS.entries()) {
    out.push({ event: name, handlers: set.size });
  }
  if (WILDCARD.size > 0) out.push({ event: "*", handlers: WILDCARD.size });
  return out;
}
