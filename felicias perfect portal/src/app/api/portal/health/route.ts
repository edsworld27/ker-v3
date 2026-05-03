import { NextResponse } from "next/server";

// GET /api/portal/health
// Basic liveness probe + capability map. Use this to feature-detect which
// portal endpoints have been wired up server-side.

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    ok: true,
    portal: "ker-v3",
    version: 1,
    ts: Date.now(),
    capabilities: {
      // Server-readable today
      products: true,
      tag: true,                  // /portal/tag.js loader + heartbeat
      heartbeat: true,            // POST /api/portal/heartbeat
      tracking: true,             // GET/POST /api/portal/config/[siteId]
      content: true,              // GET/POST /api/portal/content/[siteId]
      manifest: true,             // GET/POST /api/portal/schema/[siteId] (D-1)
      embeds: true,               // GET/POST /api/portal/embeds/[siteId] (D-5)
      settings: true,             // /admin/portal-settings (GitHub + DB backend + deployment, D-4-prep)
      workflow: true,             // draft/publish/preview/history on content overrides (D-2)
      promote: true,              // POST /api/portal/promote/[siteId] opens a PR (D-3)
      backendSelector: true,      // PORTAL_BACKEND env switches storage; /api/portal/storage-info reports active (D-4)
      cloudArchitected: true,     // server-side storage + settings, async hydration, KV-ready (Cloud-1)
      compliance: true,           // /admin/compliance + GET/POST /api/portal/compliance (E-3)
      customerEdit: true,         // Edit-profile alternative + impersonation auto-stop on mode flip (E-4)
      autoDiscover: true,         // Vercel-driven site auto-discovery on first heartbeat (E-2)
      cloudAudit: true,           // server-side activity log with retention purge by compliance mode
      supabase: true,             // Supabase backend with auto-detected schema + inline migration SQL
      quickSetup: true,           // /admin/sites “Quick setup” → /admin/portal-settings checklist
      autoMigrate: true,          // POST /api/portal/migrate auto-applies schema via Supabase Management API
      injectTag: true,            // POST /api/portal/inject-tag opens a PR adding the portal script tag (F-3)
      embedLogin: true,           // /embed/login iframeable, self-contained portal session (cross-origin safe)
      embedLoader: true,          // /portal/embed.js chatbot-style JS loader for floating + inline widgets
      embedTheme: true,           // /api/portal/embed-theme/[siteId] per-site customisation (G-1)
      aiConvert: true,            // AI Convert prompt modal in the setup checklist (F-2)
      deploymentGuide: true,      // /admin/portal-settings deployment paths card (T1 #1)
      tagStability: true,         // T1 #9 — tag rate cap, sampling, backoff, disable() + heartbeat body cap + per-site rate limit
      ecommerceAudited: true,     // T1 #7 — webhook idempotency, cart persistence, clear-on-success, line-item validation, double-discount guard
      sitesAdminPolished: true,   // T1 #10 — favicon/logo upload UX, theme variant tile picker, DNS check helper, sortable site list, primary star moved out of danger zone
      chatbot: true,              // T1 #3 — per-site chatbot config (provider picker, system prompt, theming)
      billing: true,              // G-3 plan registry + Stripe-billed feature flags
      dashboards: true,           // G-4 per-tenant dashboard layout customisation
      visualEditor: true,         // T1 #8 — in-place editor overlay for [data-portal-edit] regions
      visualBuilder: true,        // V-1 — block-based drag-drop page builder + PortalPageRenderer
      assets: true,               // P-2 — asset library (data-URI store + uploader + AssetPicker)
      inlineEdit: true,           // P-2 — heading + text blocks editable on the canvas (contentEditable)
      scrollAnimations: true,     // P-2 — fade-in / slide / zoom on scroll via IntersectionObserver
      responsiveStyles: true,     // P-2 — mobile/tablet style overrides + scoped @media css per block
      productSearch: true,        // P-2 — /api/portal/products?q=… + ProductSearchBlock
      inlineInsert: true,         // P-3 — between-block "+" quick-add picker on the canvas
      siteCustomCode: true,       // P-3 — Site.customHead/customBody injected via SiteHead
      pageCustomCode: true,       // P-3 — EditorPage.customHead/customFoot rendered by PortalPageRenderer
      codeView: true,             // P-3 — Visual ↔ Code toggle + per-block JSON editor
      promoteAll: true,           // W-1 — promote bundles pages + content + site code into one PR
      multiDb: true,              // W-1 — per-org database credentials captured (data model + UI; routing scaffolded)
      setupChecklist: true,       // W-1 — end-to-end status panel on /aqua
      seoEditor: true,            // SEO-A1 — per-page SEO panel + /admin/seo dashboard
      sitemap: true,              // SEO-A1 — /sitemap.xml + /robots.txt generated from pages
      blockA11y: true,            // SEO-A1 — aria-label/role/htmlId/tabindex/ariaHidden per block
      buttonHoverAnims: true,     // SEO-A1 — lift/glow/shrink/wiggle/shine on Button blocks
      headingSwitcher: true,      // SEO-A1 — inline H1…H6 pills on selected heading
      textMode: true,             // OMEGA-1 — Text ↔ Visual ↔ Code editor toggle (simple-mode for non-technical clients)
      brokenLinks: true,          // OMEGA-1 — /api/portal/links/[siteId] scanner + admin UI on /admin/seo
      siteNav: true,              // OMEGA-1 — Site.siteNavigationJsonLd injected via SiteHead
      filenameAlt: true,          // OMEGA-1 — image filename → fallback alt for SEO
      repoBrowser: true,          // OMEGA-1 — /admin/repo full GitHub file browser + commit-on-save
      themes: true,               // T-1 — per-site themes + per-page themeId + per-block themeStyles + CSS-var injection
      portalPageRoute: true,      // T-1 fix — /p/[...slug] catch-all that mounts <PortalPageRenderer> by default
      aquaSupport: true,          // S-1 — /aqua/support hub: feature requests, meetings, billing, resources
      animationLibrary: true,     // X-1 — duration/delay/easing per block + 7 entrance animations
      siteUx: true,               // X-1 — Site.smoothScroll + Site.customCursor (dot/ring/blur)
      pageLayoutOverrides: true,  // X-1 — EditorPage.layoutOverrides (per-page nav/footer + hide flags)
      touchDnd: true,             // X-1 — touch → drag-event shim for tablet/mobile editor
      mobileEditor: true,         // X-1 — responsive editor (sidebar collapses, properties panel docks bottom)
      splitTesting: true,         // X-2 — Block.variantsByGroup + SplitTestGroup + Split tab + /admin/split-tests results
      responsiveBlocks: true,     // X-2 — Footer + Navbar emit per-instance @media breakpoint CSS
      siteAuditor: true,          // A-1 — /admin/site-test runs PSI + dedup + LLM-formatted no-BS report
      claudeReports: true,        // A-1 — Anthropic SDK formatter (claude-sonnet-4-6) with prompt caching on system prompt
      authBlocks: true,           // A-2 — login-form + signup-form + theme-selector + social-auth blocks
      buildPipelineHardened: true, // BUILD-1 — ignoreBuildErrors + use-client sweep + Suspense around useSearchParams
      org: true,                  // G-2 org/tenant model
      // Client-only (localStorage) — exposed via portal module imports but
      // not yet via HTTP. Need DB persistence first.
      orders: false,
      customers: false,
      theme: false,
      pages: true,                // V-1 — page CRUD lives at /api/portal/pages/[siteId]
      flags: false,
      activity: false,
    },
  });
}
