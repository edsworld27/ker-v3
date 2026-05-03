"use client";

// Customer support tickets. The contact form creates a ticket; the chatbot
// can escalate to a ticket; admin replies thread inline.
//
// TODO Database (Supabase):
//   table tickets (id text pk, subject text, customer_email text, customer_name text,
//     status text, priority text, source text, created_at, updated_at, order_id text);
//   table ticket_messages (id text pk, ticket_id text, author text, body text,
//     internal boolean, created_at);

const STORAGE_KEY = "lk_admin_tickets_v1";
const CHANGE_EVENT = "lk-admin-tickets-change";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketSource = "contact" | "chat" | "email" | "manual";

export interface TicketMessage {
  id: string;
  author: "customer" | "team";
  authorName: string;
  body: string;
  internal: boolean;        // staff-only note
  createdAt: number;
}

export interface Ticket {
  id: string;
  subject: string;
  customerEmail: string;
  customerName: string;
  orderId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
  messages: TicketMessage[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface Store { [id: string]: Ticket; }

function read(): Store {
  if (typeof window === "undefined") return seedIfEmpty({});
  try { return seedIfEmpty(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Store); }
  catch { return seedIfEmpty({}); }
}
function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function seedIfEmpty(s: Store): Store {
  if (Object.keys(s).length > 0) return s;
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  const seed: Ticket[] = [
    {
      id: "TCK-1001",
      subject: "Bar arrived broken in two pieces",
      customerEmail: "ama.boateng@example.com",
      customerName: "Ama Boateng",
      orderId: "ORD-4821",
      status: "open",
      priority: "normal",
      source: "contact",
      tags: ["damaged"],
      messages: [
        { id: "m1", author: "customer", authorName: "Ama Boateng", body: "Hi, my Wild Orange bar arrived snapped in half. The wrapping was intact so I think it's a packaging thing. Can I get a replacement?", internal: false, createdAt: now - day * 1 },
      ],
      createdAt: now - day * 1,
      updatedAt: now - day * 1,
    },
    {
      id: "TCK-1000",
      subject: "Question about pregnancy use",
      customerEmail: "yaa.s@example.com",
      customerName: "Yaa Sarpong",
      status: "resolved",
      priority: "low",
      source: "chat",
      tags: ["pregnancy", "ingredients"],
      messages: [
        { id: "m1", author: "customer", authorName: "Yaa Sarpong", body: "Is the lavender face wash safe in the third trimester?", internal: false, createdAt: now - day * 4 },
        { id: "m2", author: "team", authorName: "Felicia", body: "Hi Yaa — yes, our lavender essential oil is at a low concentration suitable for late-pregnancy use. As always we recommend a quick chat with your midwife.", internal: false, createdAt: now - day * 4 + 1000 * 60 * 30 },
      ],
      createdAt: now - day * 4,
      updatedAt: now - day * 4 + 1000 * 60 * 30,
    },
  ];
  const next: Store = {};
  seed.forEach(t => { next[t.id] = t; });
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function listTickets(opts: { status?: TicketStatus | "all" } = {}): Ticket[] {
  const all = Object.values(read()).sort((a, b) => b.updatedAt - a.updatedAt);
  if (!opts.status || opts.status === "all") return all;
  return all.filter(t => t.status === opts.status);
}

export function getTicket(id: string): Ticket | null { return read()[id] ?? null; }

export function openTicketCount(): number {
  return Object.values(read()).filter(t => t.status === "open" || t.status === "pending").length;
}

function nextId(): string {
  const all = Object.keys(read());
  const max = all.reduce((m, id) => {
    const n = parseInt(id.replace(/^TCK-/, ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return `TCK-${max + 1}`;
}

export function createTicket(input: {
  subject: string;
  body: string;
  customerEmail: string;
  customerName: string;
  source?: TicketSource;
  orderId?: string;
  priority?: TicketPriority;
  tags?: string[];
}): Ticket {
  const now = Date.now();
  const t: Ticket = {
    id: nextId(),
    subject: input.subject,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    orderId: input.orderId,
    status: "open",
    priority: input.priority ?? "normal",
    source: input.source ?? "contact",
    tags: input.tags ?? [],
    messages: [{
      id: `m_${now.toString(36)}`,
      author: "customer",
      authorName: input.customerName,
      body: input.body,
      internal: false,
      createdAt: now,
    }],
    createdAt: now,
    updatedAt: now,
  };
  const s = read();
  s[t.id] = t;
  write(s);
  return t;
}

export function addMessage(ticketId: string, msg: { author: "customer" | "team"; authorName: string; body: string; internal?: boolean }) {
  const s = read();
  const t = s[ticketId];
  if (!t) return;
  const now = Date.now();
  t.messages.push({
    id: `m_${now.toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    author: msg.author,
    authorName: msg.authorName,
    body: msg.body,
    internal: msg.internal ?? false,
    createdAt: now,
  });
  t.updatedAt = now;
  if (msg.author === "team" && t.status === "open") t.status = "pending";
  if (msg.author === "customer" && t.status === "resolved") t.status = "open";
  write(s);
}

export function setTicketStatus(id: string, status: TicketStatus) {
  const s = read();
  if (!s[id]) return;
  s[id].status = status;
  s[id].updatedAt = Date.now();
  write(s);
}

export function setTicketPriority(id: string, priority: TicketPriority) {
  const s = read();
  if (!s[id]) return;
  s[id].priority = priority;
  s[id].updatedAt = Date.now();
  write(s);
}

export function deleteTicket(id: string) {
  const s = read();
  delete s[id];
  write(s);
}

export function onTicketsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
