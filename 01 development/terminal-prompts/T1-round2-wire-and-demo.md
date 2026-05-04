/loop

# T1 — Round 2: Wire fulfillment + demo seed

You are Terminal 1, Round 2. Your Round-1 foundation shipped (`16bc524`).
T2's fulfillment plugin shipped (`2dfc7e6`) and is sitting in
`04 the final portal/plugins/fulfillment/` waiting to be mounted into your
shell. T3 is still finishing the website-editor plugin port.

Round 2 goal: take T2's plugin from "exists in a folder" to "runnable
inside the foundation, end-to-end working agency workspace, with seeded
demo data."

## Working environment

- **Repo**: https://github.com/edsworld27/ker-v3
- **Local working directory**: `~/Desktop/ker-v3/`
- **Branch**: commit directly to `main`. After each commit: `git pull --rebase --autostash && git push`.
- Top-level folder names contain spaces — quote paths in the shell.

## Autonomous mesh — messaging protocol

- **Outbox**: append every meaningful step to `01 development/messages/terminal-1/to-orchestrator.md`.
- **Inbox**: read `01 development/messages/terminal-1/from-orchestrator.md` before each sub-task and after each push.
- Don't stop on questions; log `Q-ASSUMED` and continue. Only stop on `Q-BLOCKED`.

## Mandatory pre-read

1. `01 development/CLAUDE.md`
2. `01 development/context/MASTER.md`
3. `01 development/context/prior research/04-architecture.md`
4. **Your own chapter**: `01 development/context/prior research/04-foundation.md` — re-read your Round-1 deviations + the contracts you locked.
5. **T2's chapter**: `01 development/context/prior research/04-plugin-fulfillment.md` — manifest contract, port shapes T2 needs you to provide (`PluginRuntimePort`, `PluginRegistryPort`, `PortalVariantPort`), 14 API routes, 6 pages.
6. T2's package: `04 the final portal/plugins/fulfillment/index.ts` (manifest), `src/server/ports.ts` (port interfaces), `src/server/index.ts` (container builder).
7. `01 development/eds requirments.md`.

## Scope — what to build

### 1. Add `@aqua/plugin-fulfillment` as a workspace dep of the portal app

T2's plugin is at `04 the final portal/plugins/fulfillment/`. Wire it as a
local workspace package consumable from `04 the final portal/portal/`:

- Update `portal/package.json`: add `"@aqua/plugin-fulfillment": "file:../plugins/fulfillment"` to dependencies.
- `npm install` inside `portal/`. Verify `tsc --noEmit` still clean.

### 2. Implement the foundation-side ports T2 needs

Create `04 the final portal/portal/src/plugins/foundation-adapters/` with:

- `pluginRuntimeAdapter.ts` — implements T2's `PluginRuntimePort` (`installPlugin`, `setEnabled`, `uninstall`) by calling your `src/server/pluginInstalls.ts` and `_runtime.ts`.
- `pluginRegistryAdapter.ts` — implements T2's `PluginRegistryPort` (`list()`, `get(id)`, `search(query, filters)`) by reading your `_registry.ts`.
- `portalVariantAdapter.ts` — implements T2's `PortalVariantPort.applyStarterVariant({ agencyId, clientId, role, variantId, actor? })`. For now: STUB that records the call to activity log + returns `{ ok: true, variantId }`. T3's website-editor will replace the body in Round 3.

### 3. Register fulfillment in the runtime

- Add fulfillment manifest to `04 the final portal/portal/src/plugins/_registry.ts`. Import from `@aqua/plugin-fulfillment`.
- Add fulfillment to `_presets.ts` for the `agency` preset (it's `core: true` so it auto-installs anyway, but be explicit).
- On agency creation: ensure `core: true` plugins install automatically. Test with the dev `/api/tenants/seed` route.

### 4. Mount fulfillment's pages + API routes into Next's app router

T2's manifest declares `pages: PluginPage[]` and `api: PluginApiRoute[]`.
You need to bridge plugin pages to Next.js routes.

Two architectural options:
- **(a)** Static catch-all at `/portal/agency/[...rest]/page.tsx` that resolves the path via `_pathMapping.ts` to a plugin page component, then renders it with the foundation chrome wrapper. Most flexible.
- **(b)** Per-plugin route directories generated at install time (out of scope for v1).

Pick **(a)**. Build the catch-all + a sibling `/portal/clients/[clientId]/[...rest]/page.tsx` for client-scoped routes. Pages render inside your existing `<Layout>` with the brand kit + sidebar already injected — the plugin page is just the content slot.

For API routes: same pattern. `/api/portal/fulfillment/[...rest]/route.ts` catch-all resolves to T2's handler in `plugins/fulfillment/src/api/handlers.ts`.

### 5. Add the demo-seed endpoint

Extend `/api/tenants/seed` (or add `/api/dev/seed-demo`) to:

- Create a "Demo Agency" with brand kit (cyan primary, "Demo · Aqua").
- Seed 6 default phase definitions for that agency.
- Create a Felicia-mirror client (`Luv & Ker · Demo`) with brand kit (orange primary, cream secondary, Playfair display).
- Set Felicia's stage to `onboarding` so the dashboard has visible state.
- Install fulfillment for the demo agency and the felicia client (the `core: true` install + a client-scoped install).
- Seed a few checklist progress entries — half ticked — so the demo board isn't empty.
- Lock dev-only: gate behind `NEXT_PUBLIC_DEV_BYPASS=1` or admin role.

### 6. Smoke-test end-to-end

After all the above, the following flow should work:

1. `npm run dev` inside `portal/`
2. Visit `/`, hit Sign in.
3. POST `/api/dev/seed-demo` (curl or in-app button). Sets up Demo Agency + Felicia.
4. Log in as `agency-owner` of Demo Agency.
5. `/portal/agency` shows fulfillment's ClientsPage in the sidebar.
6. Click into Felicia. See PhaseBoard with the seeded checklist.
7. Click "+ New client" — modal opens with phase-preset dropdown.
8. Click an internal task → it ticks. Activity log entry appears.
9. Visit `/portal/agency/marketplace?client=felicia` → see the marketplace UI listing fulfillment + (eventually ecommerce + website-editor).

Document the wire-up in a new chapter `04-foundation-round2.md` covering:
- Workspace dep wiring
- Foundation port adapters (with code excerpts)
- Catch-all route pattern (the resolver algorithm)
- Demo-seed shape
- Smoke-test results
- Cross-team handoff notes (what T3 needs from you when the website-editor lands)

## NOT in scope

- Don't touch `plugins/fulfillment/` source — T2 owns it.
- Don't port ecommerce — T2 is doing that in their own Round 2 prompt.
- Don't fill the `applyStarterVariant` body with real block-tree logic — leave the stub. T3's website-editor port closes that loop in Round 3.
- Don't build new admin pages outside the fulfillment plugin's contributed routes.

## Loop discipline

You're inside `/loop` dynamic mode. Each cycle = pull → read inbox + outbox
→ continue work → commit → push → append `COMMIT` to your outbox → call
`ScheduleWakeup`. Wake delays:
- Mid-task: 600–900s
- Q-BLOCKED: 600s
- Fully DONE no follow-up: 1500s
- 3 consecutive empty wakes: omit `ScheduleWakeup` to end.

Pass `<<autonomous-loop-dynamic>>` as the prompt to `ScheduleWakeup`.

## When done

1. Verify the smoke-test flow end-to-end.
2. `npm run build` clean inside `portal/`. `tsc --noEmit` clean across portal + plugins/fulfillment.
3. Add `04-foundation-round2.md` chapter + MASTER row.
4. Update `tasks.md`: mark Round 2 T1 done.
5. Append `DONE` entry to your outbox + final `COMMIT`.

If the smoke test reveals issues in T2's plugin, write a `WARN` entry to
your outbox + propose the fix in `terminal-2/from-orchestrator.md` (you have authority to write to T2's inbox in this case — it's a cross-team integration patch).
