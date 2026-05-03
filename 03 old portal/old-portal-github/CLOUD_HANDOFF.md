# CLOUD_HANDOFF.md — How to continue this work in the cloud

> **Status:** Repo pushed to https://github.com/edsworld27/aqua-portal-v9 on `main`. 1542 files. Old Vite prototype on the previous main is gone from GitHub history (preserved in `extras/sort-out-version/` of this commit).

---

## How to start a new Claude chat against this repo

You have two cloud-Claude options:

### Option A: claude.ai with the GitHub connector (recommended)

1. Go to **https://claude.ai**
2. New chat
3. Click the **paperclip / attachments** icon → **Connect GitHub**
4. Authorize access to `edsworld27/aqua-portal-v9`
5. First message:
   > Read CLAUDE.md, then PLAN.md, then PROGRESS.md. Pick the next pending task in PLAN.md and do it. Commit + push when done.

The new chat won't have access to your local file system (it's pure web), so it'll work on the GitHub repo directly via the connector. Whatever it commits gets pushed back to the repo.

### Option B: Claude Code on a fresh machine / cloud VM

If you spin up a Codespace or similar:

```bash
git clone https://github.com/edsworld27/aqua-portal-v9.git
cd aqua-portal-v9
# Read CLAUDE.md, PLAN.md, PROGRESS.md
# npm install in main-monorepo/
# Boot whichever app you want via npm run dev:X
```

---

## Vercel deployment

> ⚠️ This is a 7-app monorepo. Each app is its own Next.js deployable. You'll need **7 Vercel projects**, all pointing at the same repo with different `Root Directory` values, OR pick just one to deploy first.

### Quick start: deploy the host shell only

This is the easiest first step — gets you a viewable URL.

1. Go to **https://vercel.com/new**
2. Import `edsworld27/aqua-portal-v9`
3. **Root Directory:** `main-monorepo/apps/aqua-host-shell`
4. **Framework Preset:** Next.js (should auto-detect)
5. **Build Command:** leave default (`npm run build`) — Vercel will run it from the Root Directory
6. **Install Command:** Override → `cd ../../.. && npm install` (so workspace deps install)
7. **Environment Variables:**
   - `DATABASE_URL` — points to your hosted Postgres (see below)
   - `NEXT_PUBLIC_HOST_URL` — `https://your-vercel-domain.vercel.app`
8. Deploy

### Environment / DB setup

The repo currently uses SQLite locally. For Vercel:

- **DB:** use **Vercel Postgres** (free tier) or **Neon**. Get a `postgres://` connection string.
- Update each app's `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"  // was "sqlite"
    url = env("DATABASE_URL")
  }
  ```
- Run `npx prisma db push` from each app dir locally to apply the schema, OR add it to a Vercel build hook.

### All 7 apps — full deployment

Repeat the host shell process for each app:

| App | Root Directory | Suggested Vercel project name |
| --- | --- | --- |
| Host shell | `main-monorepo/apps/aqua-host-shell` | `aqua-host` |
| Client | `main-monorepo/apps/aqua-client` | `aqua-client` |
| CRM | `main-monorepo/apps/aqua-crm` | `aqua-crm` |
| Operations | `main-monorepo/apps/aqua-operations` | `aqua-ops` |
| Finance | `main-monorepo/apps/aqua-ops-finance` | `aqua-ops-finance` |
| People | `main-monorepo/apps/aqua-ops-people` | `aqua-ops-people` |
| Revenue | `main-monorepo/apps/aqua-ops-revenue` | `aqua-ops-revenue` |

After all 7 are deployed:

1. Update **`Bridge/postMessage.ts`** origin whitelist to include your real Vercel domains (currently only allows `localhost:3001-3007`)
2. Update **CSP `frame-ancestors`** in each app's `next.config.mjs` to include the host shell's domain
3. Update **`HostShell/Renderer/HostIFrameViewRenderer.tsx`** `getEmbedUrl()` — set the `NEXT_PUBLIC_*_URL` env vars per app so the host iframes the correct production URL instead of `localhost:300X`

---

## What's done vs what's next

See **`PROGRESS.md`** for the running log and **`PLAN.md`** for the prioritized backlog. Top items:

🔴 **P0 (marketplace)**
- P0-1: Add Marketplace nav item to host shell sidebar
- P0-2: Wire `marketplace` view ID → TemplateHub in DynamicViewRenderer
- P0-3: DB persistence on TemplateHub toggles
- P0-4: Suite descriptions in cards

🟠 **P1 (boot all 7)**
- P1-1: Verify each app boots HTTP 200 on root + /embed/dashboard
- P1-2: Fix any crashes
- P1-3: End-to-end host → iframe → sibling app verification

🟡 **P2 (feature backlog)**
- P2-1: Revenue Hub Sales widgets (6) — currently placeholder fns
- P2-2: Revenue Hub Marketing widgets (7) — currently placeholder fns
- P2-3: CRM templates (Pipeline, Deals, Contacts, Activities, Reports)
- P2-4: Replace `RevenueSettingsPlaceholder.tsx` 6 stubs
- P2-5: Replace `ClientSettingsPlaceholder.tsx` 6 stubs
- P2-6: Implement `useClientLogicStub()` empty handlers
- P2-7: Wire AIChatbot widgets to Anthropic Claude API

🟢 **P3 (polish)**
- Resolve type drift in Finance/People → remove `ignoreBuildErrors`
- Build out Templates/ workspace package
- Postgres migration prep
- Production CSP headers

---

## A note about scope

The user (Ed) told the local Claude session "every single file function feature" needs to work. That's realistically 40-80 hours of work — building all 13 stub widgets, 5 CRM templates, 12 Settings views, full type cleanup, AIChatbot integrations. Pace yourself. One task per chat or per agent run, or batch a couple of related ones. Always commit + push.

When in doubt: read `dev-config.md` (the original author's 84-section architecture doc).
