// Notifications runtime — backs the Notifications plugin.
//
// Listens to the event bus, converts events into in-app
// notifications, persists them per org. Optional email digest
// dispatch via the Email plugin. Push subscriptions for the
// Web Push API (operator-side; visitor browser opts in once
// and the runtime stores the subscription).

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import { on, type AquaEventName } from "./eventBus";
import { sendEmail } from "./email";

export type NotificationCategory =
  | "order" | "booking" | "form" | "subscription"
  | "newsletter" | "plugin" | "system";

export interface Notification {
  id: string;
  orgId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  link?: string;             // /admin path to open on click
  read: boolean;
  createdAt: number;
}

export interface PushSubscription {
  id: string;
  orgId: string;
  // Web Push API endpoint + keys, exactly as the browser supplies.
  endpoint: string;
  keys: { p256dh: string; auth: string };
  // Optional operator email — useful when one org has multiple admins
  // each subscribed from their own browser.
  email?: string;
  createdAt: number;
}

interface NotificationsState {
  notifications?: Notification[];
  pushSubscriptions?: PushSubscription[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Plugin config readers ─────────────────────────────────────────────────

interface NotifyConfig {
  inAppEnabled: boolean;
  emailDigest: "immediate" | "hourly" | "daily" | "weekly" | "off";
  digestRecipients: string[];
  pushEnabled: boolean;
  notify: {
    orders: boolean;
    formSubmissions: boolean;
    bookings: boolean;
    subscriptions: boolean;
    newsletter: boolean;
    pluginInstalls: boolean;
  };
}

function getConfig(orgId: string): NotifyConfig | null {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "notifications");
  if (!install || !install.enabled) return null;
  const c = install.config as Record<string, unknown>;
  const f = install.features ?? {};
  const recipients = typeof c.digestRecipients === "string"
    ? c.digestRecipients.split(",").map(s => s.trim()).filter(Boolean)
    : [];
  return {
    inAppEnabled: f.inApp !== false,
    emailDigest: (typeof c.digestFrequency === "string" ? c.digestFrequency : "immediate") as NotifyConfig["emailDigest"],
    digestRecipients: recipients,
    pushEnabled: f.browserPush === true,
    notify: {
      orders:          c.notifyOnOrders          !== false,
      formSubmissions: c.notifyOnFormSubmissions !== false,
      bookings:        c.notifyOnBookings        !== false,
      subscriptions:   c.notifyOnSubscriptions   !== false,
      newsletter:      c.notifyOnNewsletter      === true,
      pluginInstalls:  c.notifyOnPluginInstalls  === true,
    },
  };
}

// ─── In-app notifications ──────────────────────────────────────────────────

export function listNotifications(orgId: string, limit = 100, unreadOnly = false): Notification[] {
  const s = getState() as unknown as NotificationsState;
  return (s.notifications ?? [])
    .filter(n => n.orgId === orgId && (!unreadOnly || !n.read))
    .slice(-limit)
    .reverse();
}

export function unreadCount(orgId: string): number {
  return listNotifications(orgId, 5000, true).length;
}

export interface CreateNotificationInput {
  orgId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  link?: string;
}

export function createNotification(input: CreateNotificationInput): Notification {
  const n: Notification = {
    id: makeId("ntf"),
    orgId: input.orgId,
    category: input.category,
    title: input.title,
    body: input.body,
    link: input.link,
    read: false,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as NotificationsState;
    if (!s.notifications) s.notifications = [];
    s.notifications.push(n);
    // Cap total at 5000 per system to keep state bounded.
    s.notifications = s.notifications.slice(-5000);
  });
  return n;
}

export function markRead(orgId: string, id: string): void {
  mutate(state => {
    const s = state as unknown as NotificationsState;
    const n = s.notifications?.find(x => x.orgId === orgId && x.id === id);
    if (n) n.read = true;
  });
}

export function markAllRead(orgId: string): number {
  let count = 0;
  mutate(state => {
    const s = state as unknown as NotificationsState;
    for (const n of s.notifications ?? []) {
      if (n.orgId === orgId && !n.read) { n.read = true; count++; }
    }
  });
  return count;
}

// ─── Push subscriptions ────────────────────────────────────────────────────

export function addPushSubscription(input: Omit<PushSubscription, "id" | "createdAt">): PushSubscription {
  const sub: PushSubscription = {
    ...input,
    id: makeId("push"),
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as NotificationsState;
    if (!s.pushSubscriptions) s.pushSubscriptions = [];
    // Dedupe by endpoint — a browser re-subscribing should overwrite.
    s.pushSubscriptions = s.pushSubscriptions.filter(x => x.endpoint !== input.endpoint);
    s.pushSubscriptions.push(sub);
  });
  return sub;
}

export function listPushSubscriptions(orgId: string): PushSubscription[] {
  const s = getState() as unknown as NotificationsState;
  return (s.pushSubscriptions ?? []).filter(x => x.orgId === orgId);
}

// ─── Event-to-notification mapping ─────────────────────────────────────────

interface MappedNotification {
  category: NotificationCategory;
  title: string;
  body: string;
  link: string;
}

function mapEvent(name: AquaEventName, payload: unknown): MappedNotification | null {
  const p = (payload ?? {}) as Record<string, unknown>;
  switch (name) {
    case "order.created":
    case "order.paid":
      return {
        category: "order",
        title: name === "order.paid" ? "Payment received" : "New order",
        body: `Order ${p.orderId ?? "?"} · ${(((p.amountTotal as number) ?? 0) / 100).toFixed(2)} ${(p.currency as string ?? "GBP").toUpperCase()}`,
        link: `/admin/orders/${p.orderId ?? ""}`,
      };
    case "order.refunded":
      return {
        category: "order",
        title: "Order refunded",
        body: `Order ${p.orderId ?? "?"} was refunded.`,
        link: `/admin/orders/${p.orderId ?? ""}`,
      };
    case "form.submitted": {
      const fields = (p.fields as Record<string, string> | undefined) ?? {};
      const formName = (p.formName as string) ?? "form";
      // Bookings emit through form.submitted with formName="booking".
      if (formName === "booking") {
        return {
          category: "booking",
          title: "New booking",
          body: `${fields.customerName ?? "Someone"} booked ${new Date(Number(fields.startMs ?? Date.now())).toLocaleString()}`,
          link: `/admin/reservations`,
        };
      }
      return {
        category: "form",
        title: `New ${formName} submission`,
        body: fields.email ? `${fields.name ?? "Anonymous"} · ${fields.email}` : "New submission",
        link: `/admin/forms`,
      };
    }
    case "subscription.created":
    case "subscription.cancelled":
    case "subscription.payment_failed":
    case "subscription.renewed":
      return {
        category: "subscription",
        title: name.replace("subscription.", "Subscription ").replace("_", " "),
        body: typeof p.id === "string" ? `Subscription ${p.id}` : "Subscription event",
        link: `/admin/subscriptions`,
      };
    case "newsletter.subscribed":
      return {
        category: "newsletter",
        title: "Newsletter signup",
        body: typeof p.email === "string" ? p.email : "New subscriber",
        link: `/admin/email/newsletter`,
      };
    case "plugin.installed":
    case "plugin.uninstalled":
    case "plugin.configured":
      return {
        category: "plugin",
        title: `Plugin ${name.replace("plugin.", "")}`,
        body: typeof p.pluginId === "string" ? p.pluginId : "",
        link: `/admin/settings`,
      };
    default:
      return null;
  }
}

// ─── Bus binding ───────────────────────────────────────────────────────────

let bound = false;

export function bindNotifications(): void {
  if (bound) return;
  bound = true;

  on("*", async event => {
    const cfg = getConfig(event.orgId);
    if (!cfg) return;
    const mapped = mapEvent(event.name, event.payload);
    if (!mapped) return;

    // Per-category gating from plugin config.
    const allowed = (() => {
      switch (mapped.category) {
        case "order":        return cfg.notify.orders;
        case "form":         return cfg.notify.formSubmissions;
        case "booking":      return cfg.notify.bookings;
        case "subscription": return cfg.notify.subscriptions;
        case "newsletter":   return cfg.notify.newsletter;
        case "plugin":       return cfg.notify.pluginInstalls;
        default:             return true;
      }
    })();
    if (!allowed) return;

    if (cfg.inAppEnabled) {
      createNotification({
        orgId: event.orgId,
        category: mapped.category,
        title: mapped.title,
        body: mapped.body,
        link: mapped.link,
      });
    }

    // Immediate digest = email per event. Other digest cadences are
    // batched by an external scheduler; for now, skip batching and
    // rely on immediate.
    if (cfg.emailDigest === "immediate" && cfg.digestRecipients.length > 0) {
      await sendEmail({
        orgId: event.orgId,
        to: cfg.digestRecipients,
        subject: mapped.title,
        html: `<p><strong>${mapped.title}</strong></p><p>${mapped.body}</p><p><a href="${mapped.link}">View →</a></p>`,
        text: `${mapped.title}\n${mapped.body}\n${mapped.link}`,
        tags: ["notification", `cat:${mapped.category}`],
      }).catch(() => undefined);
    }
  });
}

bindNotifications();

// ─── Hourly / daily / weekly digest ────────────────────────────────────────
//
// Called by an admin-triggered endpoint (or future cron). Pulls
// unread notifications from the last cadence window and emails the
// recipient list a roundup. Marks them read after dispatch so the
// next digest doesn't re-send.

export async function dispatchDigest(orgId: string): Promise<{ sent: boolean; count: number }> {
  const cfg = getConfig(orgId);
  if (!cfg || cfg.emailDigest === "off" || cfg.emailDigest === "immediate") {
    return { sent: false, count: 0 };
  }
  const window = (cfg.emailDigest === "hourly" ? 1 : cfg.emailDigest === "daily" ? 24 : 24 * 7) * 3600_000;
  const since = Date.now() - window;
  const unread = listNotifications(orgId, 5000, true).filter(n => n.createdAt >= since);
  if (unread.length === 0) return { sent: false, count: 0 };

  const items = unread.map(n => `<li><strong>${n.title}</strong> — ${n.body}</li>`).join("");
  const itemsText = unread.map(n => `• ${n.title} — ${n.body}`).join("\n");

  await sendEmail({
    orgId,
    to: cfg.digestRecipients,
    subject: `Your ${cfg.emailDigest} Aqua digest — ${unread.length} updates`,
    html: `<h2>${unread.length} updates</h2><ul>${items}</ul>`,
    text: `${unread.length} updates\n\n${itemsText}`,
    tags: ["notification-digest", cfg.emailDigest],
  }).catch(() => undefined);

  for (const n of unread) markRead(orgId, n.id);
  return { sent: true, count: unread.length };
}
