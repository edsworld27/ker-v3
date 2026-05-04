// Smoke test — imports the manifest and asserts every promised piece
// is present.
//
// Why this isn't tsc-only:
//   - tsc catches type mismatches but won't surface a circular import or
//     a runtime require()-fails-but-types-line-up bug.
//   - Walking the registry forces every block module to actually
//     evaluate.
//   - Hitting the manifest counts confirms the api/pages/blocks arrays
//     are populated, not empty.
//
// Run via `npm test`. Exits non-zero on any assertion failure.

import manifest from "../../index";
import { BLOCK_REGISTRY, BLOCK_DESCRIPTORS } from "../components/blockRegistry";
import { listStarterIds, loadStarterTree } from "../server/starterLoader";
import { applyStarterVariant } from "../server/portalVariants";
import type { PluginStorage } from "../lib/aquaPluginTypes";

let passes = 0;
let failures = 0;
function expect(label: string, cond: boolean, detail?: string): void {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function makeMemoryStorage(): PluginStorage {
  const data = new Map<string, unknown>();
  return {
    async get<T>(key: string): Promise<T | undefined> {
      return data.get(key) as T | undefined;
    },
    async set<T>(key: string, value: T): Promise<void> {
      data.set(key, value);
    },
    async del(key: string): Promise<void> {
      data.delete(key);
    },
    async list(prefix?: string): Promise<string[]> {
      const all = Array.from(data.keys());
      return prefix ? all.filter((k) => k.startsWith(prefix)) : all;
    },
  };
}

async function main(): Promise<void> {
  console.log("manifest");
  expect("id is website-editor", manifest.id === "website-editor");
  expect("category is content", manifest.category === "content");
  expect("navItems has 8 entries", manifest.navItems.length === 8, `actual: ${manifest.navItems.length}`);
  expect("pages has 11 entries", manifest.pages.length === 11, `actual: ${manifest.pages.length}`);
  expect(
    "api has at least 30 entries",
    manifest.api.length >= 30,
    `actual: ${manifest.api.length}`,
  );
  expect("storefront.blocks present", Boolean(manifest.storefront?.blocks));
  expect(
    "storefront.blocks has 58 entries",
    (manifest.storefront?.blocks?.length ?? 0) === 58,
    `actual: ${manifest.storefront?.blocks?.length}`,
  );
  expect("features has 8 entries", manifest.features.length === 8, `actual: ${manifest.features.length}`);

  console.log("\nblock registry");
  expect("BLOCK_REGISTRY has 58 entries", Object.keys(BLOCK_REGISTRY).length === 58);
  expect(
    "BLOCK_DESCRIPTORS matches BLOCK_REGISTRY size",
    BLOCK_DESCRIPTORS.length === Object.keys(BLOCK_REGISTRY).length,
  );
  // Force every block module to evaluate by touching its component reference.
  let evaluated = 0;
  for (const [type, entry] of Object.entries(BLOCK_REGISTRY)) {
    if (typeof entry.component === "function" && entry.descriptor.type === type) evaluated++;
  }
  expect("every block component is callable", evaluated === 58, `actual: ${evaluated}`);

  console.log("\nstarter trees");
  const ids = listStarterIds();
  expect("6 starter trees indexed", ids.length === 6, `actual: ${ids.length}`);
  for (const id of ids) {
    const t = await loadStarterTree(id);
    expect(`load ${id}`, t !== null && t.variantId === id, `got ${JSON.stringify(t?.variantId)}`);
    expect(`${id} has blocks`, (t?.blocks?.length ?? 0) > 0);
  }

  console.log("\napplyStarterVariant integration");
  const storage = makeMemoryStorage();
  const r1 = await applyStarterVariant(
    {
      agencyId: "agency_test",
      clientId: "client_test",
      role: "login",
      variantId: "login-default",
      actor: "user_test",
    },
    storage,
  );
  expect("apply login-default ok", r1.ok, r1.ok ? undefined : r1.error);
  if (r1.ok) {
    expect("returns pageId", typeof r1.pageId === "string" && r1.pageId.startsWith("page_"));
    expect("returns siteId", typeof r1.siteId === "string" && r1.siteId.startsWith("site_"));
    expect("returns variantId echo", r1.variantId === "login-default");
  }

  // Apply a second login variant — should flip active.
  const r2 = await applyStarterVariant(
    {
      agencyId: "agency_test",
      clientId: "client_test",
      role: "login",
      variantId: "login-onboarding",
    },
    storage,
  );
  expect("apply second login variant ok", r2.ok, r2.ok ? undefined : r2.error);

  // Mismatched role should fail cleanly.
  const r3 = await applyStarterVariant(
    {
      agencyId: "agency_test",
      clientId: "client_test",
      role: "affiliates",
      variantId: "login-default",
    },
    storage,
  );
  expect("role/variant mismatch returns ok:false", !r3.ok);

  // Unknown variantId should fail cleanly.
  const r4 = await applyStarterVariant(
    {
      agencyId: "agency_test",
      clientId: "client_test",
      role: "login",
      variantId: "nope",
    },
    storage,
  );
  expect("unknown variantId returns ok:false", !r4.ok);

  console.log(`\n${passes} passed · ${failures} failed`);
  if (failures > 0) process.exit(1);
}

main().catch((e) => {
  console.error("unhandled", e);
  process.exit(1);
});
