# `Templates/` — Workspace package (currently a stub)

> **Status:** Skeletal. Currently exports no-op `register*App()` functions. The intended pattern hasn't been built out yet.
>
> **Intended purpose:** Aggregator package that loads all "templates" (presets / starter configs) for the apps. The idea was that each app would expose its own templates (e.g. `Templates/AQUA Client`, `Templates/AQUA CRM`), and this package would be the single workspace dependency that loads them all on app startup.

---

## What's actually here

```
Templates/
├── package.json     standard workspace metadata, name "@aqua/templates"
└── index.ts         exports register*App() functions — currently no-ops
```

```ts
// Today:
export async function registerClientApp() {}
export async function registerCRMApp() {}
export async function registerOpsApp() {}
// ...etc
```

These are placeholders. None of them actually register anything.

---

## What template registration looks like in practice today

Each app does its own template registration directly in its `*Shell` folder:

- `apps/aqua-client/ClientShell/ClientTemplates/` — 12 template modules
- `apps/aqua-host-shell/HostShell/...` — host-specific templates
- `apps/aqua-ops-finance/FinanceShell/FinanceTemplates/` — finance templates
- etc.

Each app's templates self-register via `BridgeRegistry.registerSuite()` (from `@aqua/bridge/registry`) when their `*App.tsx` shell mounts.

So in practice, the `Templates/` workspace package is unused — apps register their own templates directly.

---

## Why this folder still exists

Two reasons:

1. **Workspace skeleton.** Listed in root `package.json`'s `workspaces` array. Removing it would require updating workspace config.
2. **Future plan.** `dev-config.md` references a "global `Templates/suiteRegistry.ts`" that would centralize registration. That hasn't been built.

---

## To productionize this

The intended design (from `dev-config.md` § "3-tier registry hierarchy"):

```
View mini-registry (4-file: component + ui + registry + index)
        ↓
Suite master registry (per app: e.g. ClientShell/ClientTemplates/index.ts)
        ↓
Suite index barrel
        ↓
Global Templates/suiteRegistry.ts  ←── populate this
        ↓
BridgeRegistry.register()
        ↓
AppShell SuiteRouter resolves view ID → component
```

To make it real:

1. Create `Templates/suiteRegistry.ts` that imports from each app's template barrel
2. Have it call `BridgeRegistry.register()` for each
3. Each app's `*App.tsx` calls a single `await import('@aqua/templates').then(t => t.registerAll())` instead of doing its own registration

---

## Polish-list flag

This is item #7 on the consolidated polish punch list. Low priority — apps work fine doing their own registration today.
