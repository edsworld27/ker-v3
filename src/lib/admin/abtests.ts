"use client";

const TESTS_KEY = "lk_admin_abtests_v1";
const ASSIGNMENT_PREFIX = "lk_abtest_assign_";
const CHANGE_EVENT = "lk-abtests-change";

export type ABTestStatus = "draft" | "running" | "paused" | "completed";
export type GoalType = "page_visit" | "add_to_cart" | "purchase";

export interface ABVariant {
  id: string;
  name: string;
  weight: number;        // 0–100 (must sum to 100 across variants)
  pageSlug?: string;     // custom page slug to show for this variant (empty = control/original)
  description?: string;
}

export interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: ABTestStatus;
  targetPath: string;    // e.g. "/" or "/products/black-soap" — URL to intercept
  variants: ABVariant[];
  goalType: GoalType;
  goalPath?: string;     // for page_visit goal — the URL that counts as conversion
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  stats: Record<string, { views: number; conversions: number }>;  // variantId → stats
}

function read(): ABTest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TESTS_KEY);
    return raw ? (JSON.parse(raw) as ABTest[]) : [];
  } catch {
    return [];
  }
}

function write(tests: ABTest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listABTests(): ABTest[] {
  return read();
}

export function getABTest(id: string): ABTest | undefined {
  return read().find((t) => t.id === id);
}

export function saveABTest(test: ABTest) {
  const tests = read();
  const idx = tests.findIndex((t) => t.id === test.id);
  if (idx >= 0) tests[idx] = test;
  else tests.push(test);
  write(tests);
}

export function createABTest(
  partial: Omit<ABTest, "id" | "createdAt" | "stats">
): ABTest {
  const test: ABTest = {
    ...partial,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    stats: {},
  };
  for (const v of test.variants) {
    test.stats[v.id] = { views: 0, conversions: 0 };
  }
  const tests = read();
  tests.push(test);
  write(tests);
  return test;
}

export function deleteABTest(id: string) {
  write(read().filter((t) => t.id !== id));
}

export function setABTestStatus(id: string, status: ABTestStatus) {
  const tests = read();
  const idx = tests.findIndex((t) => t.id === id);
  if (idx < 0) return;
  tests[idx] = {
    ...tests[idx],
    status,
    ...(status === "running" && !tests[idx].startedAt ? { startedAt: Date.now() } : {}),
    ...(status === "completed" ? { endedAt: Date.now() } : {}),
  };
  write(tests);
}

// ── Client-side assignment ────────────────────────────────────────────────────

export function getAssignment(testId: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${ASSIGNMENT_PREFIX}${testId}`);
}

export function assign(test: ABTest): string {
  const existing = getAssignment(test.id);
  if (existing) return existing;

  // Weighted random pick
  const total = test.variants.reduce((s, v) => s + v.weight, 0);
  let rand = Math.random() * total;
  let chosen = test.variants[0].id;
  for (const v of test.variants) {
    rand -= v.weight;
    if (rand <= 0) { chosen = v.id; break; }
  }

  if (typeof window !== "undefined") {
    sessionStorage.setItem(`${ASSIGNMENT_PREFIX}${test.id}`, chosen);
  }
  return chosen;
}

export function recordView(testId: string, variantId: string) {
  const tests = read();
  const idx = tests.findIndex((t) => t.id === testId);
  if (idx < 0) return;
  if (!tests[idx].stats[variantId]) {
    tests[idx].stats[variantId] = { views: 0, conversions: 0 };
  }
  tests[idx].stats[variantId].views++;
  write(tests);
}

export function recordConversion(testId: string, variantId: string) {
  const tests = read();
  const idx = tests.findIndex((t) => t.id === testId);
  if (idx < 0) return;
  if (!tests[idx].stats[variantId]) {
    tests[idx].stats[variantId] = { views: 0, conversions: 0 };
  }
  tests[idx].stats[variantId].conversions++;
  write(tests);
}

export function onABTestsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
