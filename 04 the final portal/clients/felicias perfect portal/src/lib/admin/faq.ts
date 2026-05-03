"use client";

// FAQ store — groups of question/answer items, fully editable from admin.
// Public FAQ page reads from listGroups(); the JSON-LD schema for FAQPage
// is generated automatically from the same source.
//
// TODO Database (Supabase):
//   table faq_groups (id text pk, heading text, sort int);
//   table faq_items  (id text pk, group_id text, question text, answer text, sort int);

const STORAGE_KEY = "lk_admin_faq_v1";
const CHANGE_EVENT = "lk-admin-faq-change";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqGroup {
  id: string;
  heading: string;
  items: FaqItem[];
}

interface Store { groups: FaqGroup[]; }

const SEED: FaqGroup[] = [
  {
    id: "g_products", heading: "Products & Ingredients",
    items: [
      { id: "f1", question: "Is Odo soap suitable for sensitive skin?", answer: "Yes. Odo is free from parabens, phthalates, sulphates and synthetic fragrance — the most common irritants. Many of our customers with eczema, rosacea or hormone-sensitive skin use it daily." },
      { id: "f2", question: "Are Odo bars vegan and cruelty-free?", answer: "100% yes. All Odo products are vegan, never tested on animals, and never contain animal-derived ingredients." },
      { id: "f3", question: "What makes Odo different from regular African black soap?", answer: "Most African black soap on the high street is mass-imported and re-processed in factories overseas. Odo is hand-cut in Accra by Felicia and her team, using raw shea butter and palm kernel oil sourced direct from named Ghanaian co-operatives." },
      { id: "f4", question: "Will Odo dry out my skin?", answer: "No. Most soaps strip the skin because they are built around sulphates (SLS/SLES). Odo is built on raw shea butter and saponified plant oils that lather richly while feeding the skin barrier." },
      { id: "f5", question: "Can I use Odo on my face?", answer: "Yes. Odo Face is formulated specifically for facial skin. Odo Body and Odo Hands are also gentle enough for the face if used sparingly." },
      { id: "f6", question: "Is Odo safe to use during pregnancy?", answer: "Our formulations are free from parabens, phthalates, synthetic fragrance and known endocrine disruptors. We always recommend checking with your midwife or doctor for any product used during pregnancy." },
    ],
  },
  {
    id: "g_shipping", heading: "Shipping & Orders",
    items: [
      { id: "f7", question: "Where do you ship?", answer: "We ship across the UK, EU, US, Canada and select international destinations. UK shipping is free on orders over £30." },
      { id: "f8", question: "How long does UK delivery take?", answer: "Standard UK shipping arrives in 2–4 working days for £4.99. Express next-day shipping is available for £7.90 if ordered before 2pm." },
      { id: "f9", question: "How do I track my order?", answer: "When your order ships you will receive a tracking link by email. You can also chat to our assistant in the corner of any page." },
      { id: "f10", question: "Do you ship internationally?", answer: "Yes. EU shipping starts at £9.99 and arrives in 4–7 working days. US and Canada start at £14.99 and arrive in 5–10 working days." },
    ],
  },
  {
    id: "g_returns", heading: "Returns & Refunds",
    items: [
      { id: "f11", question: "What is your returns policy?", answer: "We offer 30-day returns on unopened, unused products. Email hello@luvandker.com with your order number to start a return." },
      { id: "f12", question: "How do I get a refund?", answer: "Once we receive your returned parcel we refund the original payment method within 5 working days." },
      { id: "f13", question: "Are gift cards refundable?", answer: "Gift cards are not refundable, but they never expire and can be used in part-payment on any order." },
    ],
  },
  {
    id: "g_gift", heading: "Gift Cards",
    items: [
      { id: "f14", question: "How do digital gift cards work?", answer: "Choose a denomination, enter the recipient's name and email, optionally add a personal message, and we will deliver a unique code to their inbox within minutes." },
      { id: "f15", question: "Do gift cards expire?", answer: "No. Odo gift cards never expire. Any unused balance stays on the card for next time." },
      { id: "f16", question: "How do I check my gift card balance?", answer: "Visit /redeem and enter your code to see your remaining balance and full redemption history." },
    ],
  },
  {
    id: "g_sustainability", heading: "Sustainability & Sourcing",
    items: [
      { id: "f17", question: "Where are Odo products made?", answer: "Every Odo product is made by hand in Accra, Ghana, by Felicia and her team. We never outsource production overseas." },
      { id: "f18", question: "Is your packaging recyclable?", answer: "Bars ship in 100% compostable paper. Glass dispensers are designed to last a lifetime and refill with compostable sachets." },
      { id: "f19", question: "Are your ingredients fair-trade?", answer: "We pay above-market rates direct to named co-operatives." },
    ],
  },
];

function read(): Store {
  if (typeof window === "undefined") return { groups: SEED };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded: Store = { groups: SEED };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Store;
  } catch { return { groups: SEED }; }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function id(p: string) { return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`; }

export function listGroups(): FaqGroup[] { return read().groups; }

export function addGroup(heading: string): FaqGroup {
  const s = read();
  const g: FaqGroup = { id: id("g"), heading: heading || "New section", items: [] };
  s.groups.push(g);
  write(s);
  return g;
}

export function updateGroup(groupId: string, heading: string) {
  const s = read();
  const g = s.groups.find(x => x.id === groupId);
  if (!g) return;
  g.heading = heading;
  write(s);
}

export function deleteGroup(groupId: string) {
  const s = read();
  s.groups = s.groups.filter(g => g.id !== groupId);
  write(s);
}

export function moveGroup(groupId: string, dir: -1 | 1) {
  const s = read();
  const i = s.groups.findIndex(g => g.id === groupId);
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= s.groups.length) return;
  [s.groups[i], s.groups[j]] = [s.groups[j], s.groups[i]];
  write(s);
}

export function addItem(groupId: string, q = "New question", a = ""): FaqItem | null {
  const s = read();
  const g = s.groups.find(x => x.id === groupId);
  if (!g) return null;
  const item: FaqItem = { id: id("f"), question: q, answer: a };
  g.items.push(item);
  write(s);
  return item;
}

export function updateItem(groupId: string, itemId: string, patch: Partial<FaqItem>) {
  const s = read();
  const g = s.groups.find(x => x.id === groupId);
  if (!g) return;
  const it = g.items.find(x => x.id === itemId);
  if (!it) return;
  Object.assign(it, patch);
  write(s);
}

export function deleteItem(groupId: string, itemId: string) {
  const s = read();
  const g = s.groups.find(x => x.id === groupId);
  if (!g) return;
  g.items = g.items.filter(x => x.id !== itemId);
  write(s);
}

export function moveItem(groupId: string, itemId: string, dir: -1 | 1) {
  const s = read();
  const g = s.groups.find(x => x.id === groupId);
  if (!g) return;
  const i = g.items.findIndex(x => x.id === itemId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= g.items.length) return;
  [g.items[i], g.items[j]] = [g.items[j], g.items[i]];
  write(s);
}

export function onFaqChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
