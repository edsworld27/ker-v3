// Newsletter subscriber list — backs the Email plugin's newsletter
// feature + the storefront NewsletterSignupBlock.

import "server-only";
import { getState, mutate } from "./storage";

export interface Subscriber {
  email: string;
  orgId: string;
  subscribedAt: number;
  unsubscribedAt?: number;
  source?: string;       // "newsletter-block", "blog-post", "manual", etc.
  tags?: string[];
}

interface NewsletterState {
  subscribers?: Subscriber[];
}

export function subscribe(orgId: string, email: string, source?: string): Subscriber {
  const cleaned = email.trim().toLowerCase();
  let result!: Subscriber;
  mutate(state => {
    const s = state as unknown as NewsletterState;
    if (!s.subscribers) s.subscribers = [];
    const existing = s.subscribers.find(x => x.orgId === orgId && x.email === cleaned);
    if (existing) {
      existing.unsubscribedAt = undefined;
      result = existing;
      return;
    }
    result = {
      email: cleaned,
      orgId,
      subscribedAt: Date.now(),
      source,
    };
    s.subscribers.push(result);
  });
  return result;
}

export function unsubscribe(orgId: string, email: string): boolean {
  const cleaned = email.trim().toLowerCase();
  let removed = false;
  mutate(state => {
    const s = state as unknown as NewsletterState;
    if (!s.subscribers) return;
    const sub = s.subscribers.find(x => x.orgId === orgId && x.email === cleaned);
    if (sub) {
      sub.unsubscribedAt = Date.now();
      removed = true;
    }
  });
  return removed;
}

export function listSubscribers(orgId: string, includeUnsubscribed = false): Subscriber[] {
  const s = getState() as unknown as NewsletterState;
  return (s.subscribers ?? []).filter(x =>
    x.orgId === orgId && (includeUnsubscribed || !x.unsubscribedAt),
  );
}

export function subscriberCount(orgId: string): number {
  return listSubscribers(orgId).length;
}
