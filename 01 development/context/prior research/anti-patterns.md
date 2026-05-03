# Anti-patterns to avoid in `04 the final portal/`

Specific things from `03 old portal/` (and pitfalls in `02`) we should NOT
replicate.

> Source: agents 5 + 6 synthesis.

## From `03 old portal/`

1. **Multi-port iframe topology**. `03` started with each app on its own port (3001-3007) glued by iframes + postMessage. Phase 9 already abandoned this. Don't bring it back. In-process plugin model is faster, simpler, easier to debug, easier to deploy.

2. **localStorage as primary persistence**. All 5 middle-tier suites in `03` (CRM / Finance / People / Revenue / Operations) store data in module-level state + localStorage. No DB sync. Breaks across multi-tab, team collaboration, mobile. **In `04`**: every mutation pushes to a real backend (use Aqua's storage abstraction). localStorage is for ephemeral UI state only (sidebar collapse, scroll position, recent views).

3. **Stubbed business logic shipping behind production-looking UI**. `03` ships:
   - 13 placeholder Revenue widgets (mock data only)
   - 5 empty CRM templates (only Leads is wired)
   - Settings views that are 6 copy-paste stubs (RevenueSettingsPlaceholder, ClientSettingsPlaceholder)
   
   **In `04`**: don't ship a feature unless it's wired. Hide unfinished features behind feature flags, or don't surface them at all.

4. **`typescript.ignoreBuildErrors: true`**. `03` has this in every app's `next.config.mjs`. Hides real type drift (Finance/People types diverge from Bridge canonical). **In `04`**: enforce strict TypeScript. No exceptions; fix the drift before scaling.

5. **Per-app Prisma schemas**. Earlier `03` versions had separate schema per app; Phase 9 consolidated. **In `04`**: single source of truth for data models from day one.

6. **No role enforcement in routing**. `03` sets `User.role` but doesn't check it server-side. A `ClientEmployee` with the right URL could access `/operations`. **In `04`**: gate every route + every API endpoint server-side via the role hierarchy. Middleware + `requireRole(role | role[])` helper.

7. **Mock data scattered everywhere**. CRM has its own seed array, Finance has its own, Revenue widgets each hardcode their own. **In `04`**: centralised seed in one file. Demo mode switches a single env var; everything reads from that file.

8. **Half-built AI chat**. `Bridge/ui/AIChatPanel.tsx` exists but isn't wired to a real LLM in some surfaces. **In `04`**: integrate fully (Aqua's `/api/portal/help/ask` is a working pattern) or omit. No half-baked.

9. **Marketplace badges that are cosmetic-only**. `03`'s "System Linked" / "Operational" status badges aren't gated by any real check. **In `04`**: badge state must reflect actual install / config / health status (Aqua's `plugin-health` plugin already does this).

10. **Empty handler bodies that "log only"**. `useClientLogicStub` in `03` has `() => {}` handlers. **In `04`**: if a button is rendered, the handler is wired. Otherwise the button is hidden.

## From `02 felicias aqua portal work/`

11. **Auto-promotion of file storage to KV when env var present**. The `storage.ts` backend auto-switches when `PORTAL_KV_URL` is set. Convenient in dev, surprising in prod. **In `04`**: storage backend is explicit per environment; no auto-switching.

12. **Last-write-wins on `org.plugins[]` mutations**. Concurrent install requests overwrite each other. **In `04`**: optimistic-lock plugin install operations (CAS via version number on the org record).

13. **In-memory rate-limit buckets on `/api/auth/login`**. Resets on cold start; not distributed-safe. Fine for single-instance Vercel; if `04` ever runs multi-region, switch to Upstash.

14. **Lenient CSP** (`'unsafe-inline'`, `'unsafe-eval'`, `https:` on script-src). Necessary today because Tailwind + Next inline at build time. **In `04`**: tighten with nonces when feasible (Next 16 supports nonce-based CSP).

15. **Dual-track auth scaffold** (server cookie + client localStorage mirror). The localStorage mirror exists because older client paths read `getSession()` synchronously. **In `04`**: cut the localStorage mirror; rely on `/api/auth/me` for client reads (or React Server Component session prop).

16. **Mock orders / mock referrals on `/account`**. The customer dashboard shows hardcoded mock data labelled "demo orders". **In `04`**: real data from day one, even if the data set is small. Dev mode seeds the DB; demo mode reads the same DB.

17. **`tinyHash()` in client scaffold**. Non-secure hash used at signup + reset in the client-side localStorage demo path. **In `04`**: never hash on client. Always server-side scrypt.

## From the prototype era

18. **Lucide icon casing bugs**. The Vite prototype had several silently broken trees because of `briefcase` vs `Briefcase`. **In `04`**: lint rule for icon imports + import-checker in CI.

19. **Top-level module evaluation imports `componentMap`** — circular dep that silently broke component mounts. **In `04`**: defer registry imports inside functions; never at module top level.

20. **Single 3,600-line App.tsx** (the `sort-out-version/`). Don't be afraid to split files; ship many small components rather than one mega-file.
