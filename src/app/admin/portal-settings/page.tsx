"use client";

// Portal-wide settings: GitHub repo + auth (used by D-3 PR promotion),
// database backend selection (D-4 storage swap), deployment URLs.
//
// Cloud-architected: state lives server-side via /api/portal/settings.
// Sensitive fields (PAT, KV URL, Postgres URL) NEVER come back from GET —
// the server replaces them with the SECRET_PLACEHOLDER sentinel so the
// UI can show "saved" without ever reading the value back. Empty input =
// secret cleared; the placeholder string in the input means leave-as-is.

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  loadSettings, saveSettings, resetSettings, onSettingsChange, DEFAULT_SETTINGS,
  hasSecret, SECRET_PLACEHOLDER,
  type PortalSettingsPatch,
} from "@/lib/admin/portalSettings";
import { getSite, type Site } from "@/lib/admin/sites";
import { confirm } from "@/components/admin/ConfirmHost";
import type { PortalSettings, DatabaseBackend } from "@/portal/server/types";
import Tip from "@/components/admin/Tip";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

const BACKENDS: Array<{ id: DatabaseBackend; label: string; sub: string }> = [
  { id: "file",     label: "File",     sub: "Local JSON files (default)" },
  { id: "kv",       label: "KV",       sub: "Vercel KV / Upstash Redis" },
  { id: "supabase", label: "Supabase", sub: "Postgres via PostgREST" },
  { id: "postgres", label: "Postgres", sub: "Self-hosted or managed PG" },
];

interface BackendInfoResponse {
  ok: boolean;
  kind: DatabaseBackend | "memory";
  persistent: boolean;
  description: string;
  envVar: string;
  writable: boolean;
  schemaState?: "ok" | "missing" | "unknown" | "error" | "n/a";
  schemaError?: string | null;
  migrationSql?: string;
}

export default function AdminPortalSettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[12px] text-brand-cream/45">Loading…</div>}>
      <AdminPortalSettingsInner />
    </Suspense>
  );
}

function AdminPortalSettingsInner() {
  const searchParams = useSearchParams();
  const setupSiteId = searchParams?.get("setup") ?? null;
  const setupMode = (searchParams?.get("mode") ?? "existing") as "existing" | "new";
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [backendInfo, setBackendInfo] = useState<BackendInfoResponse | null>(null);
  const [setupSite, setSetupSite] = useState<Site | null>(null);

  useEffect(() => {
    if (setupSiteId) {
      const s = getSite(setupSiteId);
      if (s) setSetupSite(s);
    }
  }, [setupSiteId]);

  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .then(s => { if (!cancelled) setSettings(s); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    const off = onSettingsChange(() => loadSettings().then(s => { if (!cancelled) setSettings(s); }));
    return () => { cancelled = true; off(); };
  }, []);

  // Probe the server's actual backend on mount; refresh once per minute
  // since the writable flag can flip if a deploy hits a read-only disk.
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch("/api/portal/storage-info", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json() as BackendInfoResponse;
        if (!cancelled) setBackendInfo(data);
      } catch { /* offline — show last known */ }
    }
    pull();
    const id = setInterval(pull, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  async function patch(p: PortalSettingsPatch) {
    setError(null);
    try {
      const next = await saveSettings(p);
      setSettings(next);
      setSavedAt(Date.now());
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => setSavedAt(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-5xl">
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Admin panel</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Portal settings</h1>
        <p className="text-brand-cream/45 text-sm mt-3">Loading settings from the cloud store…</p>
      </div>
    );
  }
  const live = settings ?? DEFAULT_SETTINGS;

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">
            {setupSite ? "Quick setup" : "Admin panel"}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">
            {setupSite ? <>Set up <span className="text-brand-orange">{setupSite.name}</span></> : "Portal settings"}
          </h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            {setupSite
              ? "Drop in the keys below — anything green is already configured. Once everything's set the portal works end-to-end for this site."
              : "Connect this admin to a GitHub repository, pick a storage backend, and configure 3rd-party integrations. Settings live cloud-side, shared across the team."}
          </p>
        </div>
        <SavedIndicator at={savedAt} />
      </div>

      {setupSite && (
        <SetupChecklist
          settings={live}
          backendInfo={backendInfo}
          setupSite={setupSite}
          setupMode={setupMode}
        />
      )}

      <MigrationBanner
        backendInfo={backendInfo}
        hasManagementToken={hasSecret(live.database.supabaseManagementToken ?? "")}
        onMigrated={info => setBackendInfo(info)}
      />

      {/* ── GITHUB ────────────────────────────────────────────────────────── */}
      <Card id="setup-github" title="GitHub" tip="Where the admin will open pull requests when you promote draft content. The GitHub App route is preferred — installation tokens are scoped to the repo and rotate automatically. Personal Access Tokens are a fallback for development.">
        <Field label="Repository URL" tip="The repo this portal manages content for, e.g. https://github.com/owner/repo.">
          <input
            value={live.github.repoUrl}
            onChange={e => patch({ github: { repoUrl: e.target.value } })}
            placeholder="https://github.com/owner/repo"
            className={INPUT + " font-mono text-xs"}
          />
        </Field>
        <Field label="Default branch" tip="The branch new pull requests target (typically 'main').">
          <input
            value={live.github.defaultBranch}
            onChange={e => patch({ github: { defaultBranch: e.target.value } })}
            placeholder="main"
            className={INPUT}
          />
        </Field>
        <Field label="GitHub App ID (optional)" tip="Preferred over a Personal Access Token. Install your GitHub App on the repo and paste its App ID + Installation ID.">
          <input
            value={live.github.appId ?? ""}
            onChange={e => patch({ github: { appId: e.target.value } })}
            placeholder="123456"
            className={INPUT}
          />
        </Field>
        <Field label="Installation ID" tip="Found in the GitHub App's installation page URL.">
          <input
            value={live.github.installationId ?? ""}
            onChange={e => patch({ github: { installationId: e.target.value } })}
            placeholder="12345678"
            className={INPUT}
          />
        </Field>
        <SensitiveField
          label="Personal Access Token (fallback)"
          tip="PATs are full-permission and storing them in browser localStorage is a development convenience only. Prefer a GitHub App in production."
          value={live.github.pat ?? ""}
          onChange={v => patch({ github: { pat: v } })}
          placeholder="ghp_…"
        />
      </Card>

      {/* ── DATABASE ──────────────────────────────────────────────────────── */}
      <Card id="setup-database" title="Database" tip="Where the portal stores its own state (heartbeats, content overrides, embed registry, etc.). The actual backend choice is server-side via the PORTAL_BACKEND env var; this UI lets you record your intent + supply credentials.">
        <BackendStatusRow info={backendInfo} intended={live.database.backend} />

        <Field label="Backend" tip="File is local-only and resets between deploys on read-only hosts. KV recommended for Vercel deployments. Postgres for self-hosted. The actual choice is set on the server via PORTAL_BACKEND.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {BACKENDS.map(b => {
              const active = live.database.backend === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => patch({ database: { backend: b.id } })}
                  className={`text-left px-3 py-3 rounded-xl border transition-colors ${
                    active
                      ? "border-brand-orange bg-brand-orange/10 text-brand-cream"
                      : "border-white/10 text-brand-cream/55 hover:border-white/25"
                  }`}
                >
                  <p className="text-sm font-medium">{b.label}</p>
                  <p className="text-[11px] text-brand-cream/45 mt-0.5">{b.sub}</p>
                </button>
              );
            })}
          </div>
        </Field>

        {live.database.backend === "kv" && (
          <SensitiveField
            label="KV connection URL"
            tip="Your Vercel KV REST URL (or Upstash Redis URL). Pulled from your hosting dashboard."
            value={live.database.kvUrl ?? ""}
            onChange={v => patch({ database: { kvUrl: v } })}
            placeholder="https://…upstash.io or rediss://…"
          />
        )}

        {live.database.backend === "supabase" && (
          <>
            <Field label="Supabase project URL" tip="Found in Supabase dashboard → Project Settings → API. Looks like https://abcdefg.supabase.co.">
              <input
                value={live.database.supabaseUrl ?? ""}
                onChange={e => patch({ database: { supabaseUrl: e.target.value } })}
                placeholder="https://abcdefg.supabase.co"
                className={INPUT + " font-mono text-xs"}
              />
            </Field>
            <SensitiveField
              label="Supabase service-role key"
              tip="The service_role secret (NOT the anon key). Required because the portal owns one table and bypasses RLS for its own writes."
              value={live.database.supabaseServiceKey ?? ""}
              onChange={v => patch({ database: { supabaseServiceKey: v } })}
              placeholder="eyJhbGciOiJIUzI1NiIs…"
            />
            <SensitiveField
              label="Supabase Management Token (one-time, for Sync DB)"
              tip="Personal Access Token from supabase.com/dashboard/account/tokens — different from the service-role key. Only needed once when you click Sync DB; you can clear it after the migration runs."
              value={live.database.supabaseManagementToken ?? ""}
              onChange={v => patch({ database: { supabaseManagementToken: v } })}
              placeholder="sbp_…"
            />
          </>
        )}

        {live.database.backend === "postgres" && (
          <SensitiveField
            label="Postgres connection URL"
            tip="A standard postgresql:// connection string. Use a pooled URL for serverless."
            value={live.database.postgresUrl ?? ""}
            onChange={v => patch({ database: { postgresUrl: v } })}
            placeholder="postgresql://user:pass@host/db"
          />
        )}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[11px] text-brand-cream/55 leading-relaxed space-y-1">
          <p>
            <strong className="text-brand-cream/75">Server-side selection.</strong>{" "}
            The active backend is decided by <code className="font-mono text-brand-cream/85">PORTAL_BACKEND</code>{" "}
            on the server, not by this UI. Set it at deploy time:
          </p>
          <pre className="font-mono text-[10px] text-brand-cream/65 bg-brand-black/40 border border-white/5 rounded px-2 py-1.5 overflow-x-auto">PORTAL_BACKEND=file{"\n"}# or PORTAL_BACKEND=memory  (no persistence, ephemeral){"\n"}# or PORTAL_BACKEND=kv      (Upstash REST — slot in v1, not yet wired)</pre>
          <p className="text-brand-cream/45">
            File survives <code className="font-mono">next dev</code> restarts and most VMs. Vercel and other read-only hosts need <code className="font-mono">memory</code> or <code className="font-mono">kv</code>.
          </p>
        </div>
      </Card>

      {/* ── DEPLOYMENT ────────────────────────────────────────────────────── */}
      <Card id="setup-deployment" title="Deployment" tip="Where the host site is deployed. Used by the workflow phase to build signed preview links to draft content.">
        <Field label="Preview base URL" tip="Signed preview links to draft content will be hosted under this URL. Optional — only needed if you want share links for review.">
          <input
            value={live.deployment.previewBaseUrl ?? ""}
            onChange={e => patch({ deployment: { previewBaseUrl: e.target.value } })}
            placeholder="https://your-site.com"
            className={INPUT + " font-mono text-xs"}
          />
        </Field>
      </Card>

      {/* ── DEPLOYMENT GUIDE (T1 #1) ─────────────────────────────────────── */}
      <DeploymentGuide
        backendInfo={backendInfo}
        previewBaseUrl={live.deployment.previewBaseUrl ?? ""}
        supabaseUrl={live.database.supabaseUrl ?? ""}
      />

      {/* ── INTEGRATIONS ──────────────────────────────────────────────────── */}
      <Card id="setup-integrations" title="Integrations" tip="Connect the portal to your hosting + repo provider so a brand-new site auto-fills its admin row when the tag first phones home. Vercel maps domain → project → linked repo; that repo becomes the default for promote PRs (D-3).">
        <SensitiveField
          label="Vercel API token"
          tip="Create a token at vercel.com/account/tokens. Read access is enough for project lookups."
          value={live.integrations?.vercelToken ?? ""}
          onChange={v => patch({ integrations: { vercelToken: v } })}
          placeholder="vrcl_…"
        />
        <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-brand-black border border-white/5">
          <button
            type="button"
            onClick={() => patch({ integrations: { autoDiscover: !(live.integrations?.autoDiscover !== false) } })}
            className={`mt-0.5 w-9 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
              (live.integrations?.autoDiscover !== false) ? "bg-brand-orange justify-end" : "bg-white/15 justify-start"
            }`}
            aria-pressed={live.integrations?.autoDiscover !== false}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-brand-cream">Auto-discover new sites</p>
            <p className="text-[11px] text-brand-cream/45 leading-relaxed mt-0.5">
              When the tag heartbeats from a host the portal hasn&apos;t seen, query Vercel for the project and stash a Discovery row in <code className="font-mono">/admin/sites</code>. Disable to silently track new hosts without enriching them.
            </p>
          </div>
        </div>
      </Card>

      {/* ── TOOLS (site auditor + LLM formatter) ─────────────────────────── */}
      <Card id="setup-tools" title="Tools" tip="Optional API keys for the site auditor + the Claude-powered report formatter. Leave blank to use the free PageSpeed Insights endpoint with anonymous rate limits.">
        <SensitiveField
          label="PageSpeed Insights key"
          tip="Lifts the per-org 5-report quota. Get one at console.developers.google.com (enable PageSpeed Insights API)."
          value={live.integrations?.pagespeedKey ?? ""}
          onChange={v => patch({ integrations: { pagespeedKey: v } })}
          placeholder="AIza…"
        />
        <SensitiveField
          label="Anthropic API key"
          tip="When set, every audit gets a no-BS markdown report formatted by Claude (sonnet-4-6). Without it, you only see the raw findings table."
          value={live.integrations?.anthropicKey ?? ""}
          onChange={v => patch({ integrations: { anthropicKey: v } })}
          placeholder="sk-ant-…"
        />
      </Card>

      {/* ── SECURITY (admin login mode) ───────────────────────────────────── */}
      <SecurityCard />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* ── RESET ─────────────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={async () => {
            if (!(await confirm({ title: "Reset all portal settings to defaults?", message: "Clears GitHub credentials, the chosen backend, and any preview URL.", danger: true, confirmLabel: "Reset" }))) return;
            try {
              const next = await resetSettings();
              setSettings(next);
              setSavedAt(Date.now());
              if (fadeTimer.current) clearTimeout(fadeTimer.current);
              fadeTimer.current = setTimeout(() => setSavedAt(null), 2000);
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            }
          }}
          className="text-xs text-brand-cream/45 hover:text-brand-orange"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Card({ title, tip, children, id }: { title: string; tip?: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden scroll-mt-6">
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/50">{title}</p>
        {tip && <Tip text={tip} />}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-[11px] tracking-[0.18em] uppercase text-brand-cream/50">{label}</label>
        {tip && <Tip text={tip} />}
      </div>
      {children}
    </div>
  );
}

// Password-style field with a Show/Hide toggle. Used for PAT, KV URL,
// Postgres URL. Aware of the SECRET_PLACEHOLDER sentinel — when GET
// returns it, we display "•••••• saved" and the input is empty until
// the admin clicks Edit. Saving an empty input clears the secret;
// clicking Cancel restores the placeholder so no save happens.
function SensitiveField({
  label, tip, value, onChange, placeholder,
}: {
  label: string;
  tip?: string;
  value: string;             // either "", SECRET_PLACEHOLDER, or a fresh edit
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const isStoredSecret = hasSecret(value);
  const [editing, setEditing] = useState(false);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState("");

  // When the stored secret is updated outside this component (reset, etc.)
  // pull out of edit mode so the placeholder shows again.
  useEffect(() => { if (isStoredSecret) { setEditing(false); setDraft(""); } }, [isStoredSecret]);

  if (isStoredSecret && !editing) {
    return (
      <Field label={label} tip={tip}>
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-xs text-brand-cream/65 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
            ••••••••&nbsp;<span className="text-green-400">saved</span>
          </code>
          <button
            type="button"
            onClick={() => { setEditing(true); setDraft(""); }}
            className="text-[11px] px-3 py-2 rounded-lg border border-white/15 text-brand-cream/65 hover:text-brand-cream hover:border-white/30"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] px-3 py-2 rounded-lg border border-red-500/25 text-red-400/70 hover:text-red-400 hover:border-red-500/50"
            title="Remove the saved secret"
          >
            Clear
          </button>
        </div>
      </Field>
    );
  }

  // Active edit state — fresh input. Local draft so we can save on commit
  // rather than every keystroke (the actual secret is sensitive).
  const display = editing ? draft : (isStoredSecret ? "" : value);

  function commit() {
    if (display === "" && isStoredSecret) {
      // Refused: empty field with secret saved. Use Clear to remove.
      setEditing(false); setDraft("");
      return;
    }
    onChange(display);
    setEditing(false); setDraft("");
  }
  function cancel() { setEditing(false); setDraft(""); }

  return (
    <Field label={label} tip={tip}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={display}
          onChange={e => { setDraft(e.target.value); if (!editing) setEditing(true); }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") cancel(); }}
          onBlur={commit}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={INPUT + " pr-28 font-mono text-xs"}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {editing && (
            <button
              type="button"
              onClick={cancel}
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md text-brand-cream/55 hover:text-brand-cream hover:bg-white/5"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            aria-label={show ? "Hide value" : "Show value"}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md text-brand-cream/55 hover:text-brand-cream hover:bg-white/5"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>
    </Field>
  );
}

// Admin login security mode. Three states drive the /login page:
//   strict — credentials only (production default)
//   dev    — credentials + a Dev mode button for one-click admin access
//   off    — admin auth bypassed entirely (legacy NEXT_PUBLIC_PORTAL_DEV_BYPASS)
// The toggle here writes a localStorage override so previews can be
// re-keyed without redeploying. The env var still wins on cold load.
function SecurityCard() {
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<"strict" | "dev" | "off">("strict");
  const [hasOverride, setHasOverride] = useState(false);

  useEffect(() => {
    void (async () => {
      const auth = await import("@/lib/auth");
      setMode(auth.getSecurityMode());
      try {
        setHasOverride(localStorage.getItem("lk_security_mode_v1") !== null);
      } catch {}
      setHydrated(true);
    })();
  }, []);

  async function pick(next: "strict" | "dev" | "off") {
    const auth = await import("@/lib/auth");
    auth.setSecurityModeOverride(next);
    setMode(next);
    setHasOverride(true);
  }

  async function clearOverride() {
    const auth = await import("@/lib/auth");
    auth.setSecurityModeOverride(null);
    setMode(auth.getSecurityMode());
    setHasOverride(false);
  }

  const choices: Array<{ id: "strict" | "dev" | "off"; label: string; sub: string }> = [
    { id: "strict", label: "Strict",   sub: "Credentials required. No Dev mode button." },
    { id: "dev",    label: "Dev",      sub: "Credentials + a Dev mode button on /login." },
    { id: "off",    label: "Off",      sub: "Skip admin auth entirely (local only)." },
  ];

  if (!hydrated) return null;

  return (
    <Card
      id="setup-security"
      title="Admin login security"
      tip="Controls the /login page. In dev/off you get one-click admin access — useful for local testing. Always strict in production."
    >
      <p className="text-[12px] text-brand-cream/65 leading-relaxed">
        Effective mode: <strong className="text-brand-cream/85 font-mono">{mode}</strong>
        {hasOverride && <span className="text-brand-amber/80"> · runtime override</span>}
      </p>
      <div className="grid sm:grid-cols-3 gap-2">
        {choices.map(c => {
          const active = c.id === mode;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id)}
              className={`text-left p-3 rounded-xl border transition-colors ${
                active
                  ? "border-brand-orange/60 bg-brand-orange/10"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <p className="text-[12px] font-semibold text-brand-cream">{c.label}</p>
              <p className="text-[10px] text-brand-cream/50 leading-relaxed mt-0.5">{c.sub}</p>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        {hasOverride ? (
          <button
            type="button"
            onClick={clearOverride}
            className="text-brand-cream/55 hover:text-brand-orange"
          >
            Clear override (use env var)
          </button>
        ) : <span />}
        <a
          href="/login"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-cream/55 hover:text-brand-orange"
        >
          Open /login ↗
        </a>
      </div>
      <div className="rounded-lg border border-white/5 bg-brand-black px-3 py-2.5 text-[11px] text-brand-cream/55 leading-relaxed">
        Production env: set <code className="font-mono text-brand-cream/75">NEXT_PUBLIC_PORTAL_SECURITY=strict</code> (or <code className="font-mono">dev</code> / <code className="font-mono">off</code>).
        The legacy <code className="font-mono">NEXT_PUBLIC_PORTAL_DEV_BYPASS=
# Three-mode admin login: "strict" (default, prod), "dev", or "off"
NEXT_PUBLIC_PORTAL_SECURITY=strict1</code> still works and maps to <code className="font-mono">off</code>.
      </div>
    </Card>
  );
}

// Small fading "Saved" pill, shown for ~2s after each auto-save.
function SavedIndicator({ at }: { at: number | null }) {
  if (!at) return null;
  return (
    <span
      key={at /* re-trigger fade-in on each save */}
      className="text-[11px] text-brand-cream/65 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 animate-pulse shrink-0"
    >
      Saved
    </span>
  );
}

// Live read-out of which backend is actually serving requests right now,
// versus the backend the admin has *intended* via this UI. The two can
// diverge whenever PORTAL_BACKEND isn't set to match — surfacing the
// difference avoids the "I changed it but nothing happened" trap.
function BackendStatusRow({ info, intended }: {
  info: BackendInfoResponse | null;
  intended: DatabaseBackend;
}) {
  if (!info) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[11px] text-brand-cream/45">
        Probing active backend…
      </div>
    );
  }
  const matches = info.kind === intended;
  const dot = info.persistent && info.writable
    ? "bg-green-400"
    : info.persistent
      ? "bg-brand-amber"
      : "bg-white/30";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[11px] text-brand-cream/65 leading-relaxed">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-brand-cream/85 font-semibold">Active backend:</span>
        <code className="font-mono text-brand-cream bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
          {info.kind}
        </code>
        <span className="text-brand-cream/45">
          {info.persistent ? "persistent" : "ephemeral"}
          {info.persistent && !info.writable ? " · read-only filesystem" : ""}
        </span>
        {!matches && (
          <span className="ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-amber/15 text-brand-amber border border-brand-amber/30">
            Differs from intended ({intended})
          </span>
        )}
      </div>
      <p className="text-brand-cream/45 mt-1">{info.description}</p>
    </div>
  );
}

// ─── Setup checklist (Quick setup) ──────────────────────────────────────────
//
// Shown when the page is opened via /admin/portal-settings?setup=<siteId>
// (the new-site flow's "Quick setup" mode redirects here). Each row is
// either green (configured) or amber (needs attention) with a one-click
// "Set up" button that scrolls the relevant card into view.

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  scrollTo: string;          // element id to scroll into view
  hint: string;
}

function SetupChecklist({ settings, backendInfo, setupSite, setupMode }: {
  settings: PortalSettings;
  backendInfo: BackendInfoResponse | null;
  setupSite: Site;
  setupMode: "existing" | "new";
}) {
  const githubReady = !!settings.github.repoUrl && hasSecret(settings.github.pat ?? "");
  const items: ChecklistItem[] = [
    {
      id: "github-repo",
      label: "GitHub repository URL",
      done: !!settings.github.repoUrl,
      scrollTo: "setup-github",
      hint: "Where promote-to-PR will open pull requests against.",
    },
    {
      id: "github-pat",
      label: "GitHub Personal Access Token",
      done: hasSecret(settings.github.pat ?? ""),
      scrollTo: "setup-github",
      hint: "Authorises the portal to commit + open PRs on the repo.",
    },
    {
      id: "vercel-token",
      label: "Vercel API token",
      done: hasSecret(settings.integrations?.vercelToken ?? ""),
      scrollTo: "setup-integrations",
      hint: "Lets the portal auto-detect new sites by domain → project.",
    },
    {
      id: "backend",
      label: "Storage backend",
      done: !!backendInfo && backendInfo.persistent && backendInfo.schemaState !== "missing" && backendInfo.schemaState !== "error",
      scrollTo: "setup-database",
      hint: backendInfo?.schemaState === "missing"
        ? "Backend is configured but the schema needs initialising — see the banner above."
        : "A persistent backend (KV / Supabase / file) so state survives restarts.",
    },
    {
      id: "deployment",
      label: "Preview base URL (optional)",
      done: !!settings.deployment.previewBaseUrl,
      scrollTo: "setup-deployment",
      hint: "Used to build full preview links to draft content. Optional.",
    },
    {
      id: "deployment-guide",
      label: "Choose your deploy target",
      // Informational — always shown as done so it doesn't block the bar.
      // Just scrolls down to the deploy paths card with the env-var snippets
      // for Vercel, self-host, and managed-host with KV.
      done: true,
      scrollTo: "setup-deployment-guide",
      hint: "Pick where to deploy this portal — Vercel, your own VM, or a managed host with KV — and grab the env vars + repo zip.",
    },
  ];

  const required = items.filter(i => i.id !== "deployment" && i.id !== "deployment-guide");
  const doneCount = required.filter(i => i.done).length;
  const total = required.length;
  const allDone = doneCount === total;

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-brand-orange/20 flex items-center gap-3 flex-wrap">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Setup progress</p>
        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
          allDone
            ? "bg-green-500/15 text-green-400 border-green-500/25"
            : "bg-brand-amber/15 text-brand-amber border-brand-amber/30"
        }`}>
          {doneCount} / {total} ready
        </span>
        <div className="ml-auto h-1.5 w-32 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all ${allDone ? "bg-green-400" : "bg-brand-orange"}`}
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
      </div>
      <ul className="divide-y divide-white/5">
        {items.map(it => (
          <li key={it.id} className="px-5 py-3 flex items-start gap-3">
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              it.done ? "bg-green-400" : "bg-brand-amber"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-cream font-medium">{it.label}</p>
              <p className="text-[11px] text-brand-cream/45 mt-0.5">{it.hint}</p>
            </div>
            <button
              onClick={() => scrollTo(it.scrollTo)}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-white/15 text-brand-cream/65 hover:text-brand-cream hover:border-white/30 shrink-0"
            >
              {it.done ? "Edit" : "Set up"}
            </button>
          </li>
        ))}
      </ul>
      {allDone && (
        <div className="px-5 py-3 border-t border-green-500/20 bg-green-500/5 text-[12px] text-green-400">
          All set. Drop the portal tag into <code className="font-mono">&lt;head&gt;</code> on the host site and the portal will auto-discover + connect.
        </div>
      )}

      {/* Mode-specific helpers */}
      <div className="px-5 py-4 border-t border-white/5 bg-white/[0.02] space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-brand-cream/45">Optional · {setupMode} site</p>
        </div>

        {/* Inject Portal tag — both modes, but only enabled when GitHub is connected */}
        <InjectPortalTag siteId={setupSite.id} githubReady={githubReady} />

        {/* AI Convert prompt — both modes, helps wire the tag into a real codebase */}
        <AiConvertButton siteId={setupSite.id} setupMode={setupMode} />

        {/* Iframe login embed — code snippet to drop into the host site */}
        <IframeLoginSnippet siteId={setupSite.id} />
      </div>
    </div>
  );
}

// ─── Inject Portal tag (PR button) ─────────────────────────────────────────

function InjectPortalTag({ siteId, githubReady }: { siteId: string; githubReady: boolean }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; prUrl?: string; prNumber?: number; error?: string } | null>(null);

  async function inject() {
    setBusy(true); setResult(null);
    try {
      const portalOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch("/api/portal/inject-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, portalOrigin }),
      });
      const data = await res.json() as { ok: boolean; prUrl?: string; prNumber?: number; error?: string };
      setResult(data);
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded-lg border border-white/8 bg-brand-black/40 px-3 py-2.5 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs font-medium text-brand-cream">Inject Portal tag</p>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 text-brand-cream/55 border border-white/10">PR</span>
        <button
          onClick={inject}
          disabled={busy || !githubReady}
          title={githubReady ? "Open a PR adding the portal tag snippet to your repo" : "Configure GitHub repo + PAT first"}
          className="ml-auto text-[11px] px-3 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {busy ? "Opening PR…" : "Inject Portal tag"}
        </button>
      </div>
      <p className="text-[11px] text-brand-cream/45 leading-relaxed">
        Opens a PR adding <code className="font-mono text-brand-cream/65">portal-tag.html</code> at your repo root with the script tag for site <code className="font-mono">{siteId}</code> and instructions for where to paste it (Next.js / Astro / vanilla).
      </p>
      {result && (
        result.ok && result.prUrl ? (
          <p className="text-[11px] text-green-400">
            ✓ PR opened:{" "}
            <a href={result.prUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">
              #{result.prNumber} on GitHub ↗
            </a>
          </p>
        ) : (
          <p className="text-[11px] text-red-400">✗ {result.error}</p>
        )
      )}
    </div>
  );
}

// ─── AI Convert prompt ─────────────────────────────────────────────────────

function AiConvertButton({ siteId, setupMode }: { siteId: string; setupMode: "existing" | "new" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-white/8 bg-brand-black/40 px-3 py-2.5 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs font-medium text-brand-cream">Convert to portal-friendly</p>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 text-brand-cream/55 border border-white/10">AI prompt</span>
        <button
          onClick={() => setOpen(true)}
          className="ml-auto text-[11px] px-3 py-1.5 rounded-lg border border-white/15 text-brand-cream/65 hover:text-brand-cream hover:border-white/30"
        >
          Open prompt
        </button>
      </div>
      <p className="text-[11px] text-brand-cream/45 leading-relaxed">
        {setupMode === "existing"
          ? "Generates the migration plan for your existing repo: where to paste the tag, which components to wire to usePortalContent, what portal.config.ts keys to declare based on your CMS."
          : "Scaffolds a fresh portal.config.ts + the integration code for a new project — drops the tag in the layout, sets up the manifest, lists the first set of editable keys."}
      </p>
      {open && <AiConvertModal siteId={siteId} setupMode={setupMode} onClose={() => setOpen(false)} />}
    </div>
  );
}

function AiConvertModal({ siteId, setupMode, onClose }: { siteId: string; setupMode: "existing" | "new"; onClose: () => void }) {
  const [framework, setFramework] = useState("");
  const [pasted, setPasted] = useState("");
  const [copied, setCopied] = useState(false);

  const portalOrigin = typeof window !== "undefined" ? window.location.origin : "https://your-portal.app";
  const prompt = buildConvertPrompt({ siteId, setupMode, framework, projectShape: pasted, portalOrigin });

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-brand-black-soft border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-white/8 flex items-center gap-3">
          <p className="text-sm font-semibold text-brand-cream">
            {setupMode === "existing" ? "Convert existing website to portal-friendly" : "Scaffold a new portal-friendly website"}
          </p>
          <button onClick={onClose} className="ml-auto text-brand-cream/50 hover:text-brand-cream text-lg leading-none">×</button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-[12px] text-brand-cream/65 leading-relaxed">
            Tell the AI about your project; it returns the exact files to add, the script-tag insertion line, and the
            initial <code className="font-mono">portal.config.ts</code> manifest. Paste the response back into your repo.
          </p>

          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase text-brand-cream/50 mb-1.5">
              Framework / stack
            </label>
            <input
              value={framework}
              onChange={e => setFramework(e.target.value)}
              placeholder="e.g. Next.js 15 App Router, Astro 4, vanilla Vite + React, WordPress, plain HTML…"
              className={INPUT}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase text-brand-cream/50 mb-1.5">
              Project shape (paste anything useful — package.json, file tree, key components)
            </label>
            <textarea
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              placeholder={"// optional but helpful\n{\n  \"name\": \"my-site\",\n  \"dependencies\": { \"next\": \"…\" }\n}"}
              rows={5}
              className={INPUT + " font-mono text-xs"}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/50">Prompt</label>
              <button
                onClick={copyPrompt}
                className="text-[11px] px-2.5 py-1 rounded-md bg-brand-orange/20 border border-brand-orange/40 text-brand-orange hover:bg-brand-orange/30 font-semibold"
              >
                {copied ? "Copied" : "Copy prompt"}
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-brand-black border border-white/8 rounded-lg p-3 overflow-x-auto text-brand-cream/85 whitespace-pre-wrap max-h-72 overflow-y-auto">
{prompt}
            </pre>
          </div>

          <p className="text-[10px] text-brand-cream/40">
            What you&apos;ll get back: the exact line(s) to add to your layout/template, a starter <code className="font-mono">portal.config.ts</code> with sensible defaults, and the components to convert from hardcoded copy to <code className="font-mono">usePortalContent()</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

function buildConvertPrompt(args: {
  siteId: string;
  setupMode: "existing" | "new";
  framework: string;
  projectShape: string;
  portalOrigin: string;
}): string {
  const fw = args.framework.trim() || "<describe your framework / stack>";
  const shape = args.projectShape.trim();
  const tag = `<script src="${args.portalOrigin}/portal/tag.js" data-site="${args.siteId}" defer></script>`;

  return `I'm wiring up the "ker-v3 portal" admin tool to manage content for ${args.setupMode === "existing" ? "an existing" : "a new"} website. The portal is a single-tag content + analytics platform; help me make my repo portal-friendly.

## Site info
- Portal site ID: \`${args.siteId}\`
- Framework / stack: ${fw}
- Portal origin: ${args.portalOrigin}

${shape ? `## Project shape

\`\`\`
${shape}
\`\`\`

` : ""}## What to integrate

**1. Portal tag.** The portal needs this single line in the \`<head>\` of every page:

\`\`\`html
${tag}
\`\`\`

Tell me **the exact file + line** to add it to in my framework. Use \`next/script\` if it's Next.js.

**2. Manifest file.** Drop a typed manifest at the repo root called \`portal.config.ts\`:

\`\`\`ts
import { definePortal } from "@/portal/client";   // path may differ in my repo

export default definePortal({
  // Section-grouped: { sectionName: { keyName: { type, default, multiline? } } }
  // type ∈ "text" | "html" | "image-src" | "href"
  hero: {
    headline: { type: "text", default: "..." },
    subtitle: { type: "html", default: "..." },
  },
  // ...add real sections + keys based on the project I described
});
\`\`\`

Generate a starter manifest with **3-5 sections** of plausible keys for my site type, with realistic defaults sourced from common copy (or from anything you can infer from the project shape above).

**3. Render integration.** ${args.setupMode === "existing"
    ? "List the **3-5 most visible components** in my project (Hero, Footer, Navbar, etc.) and show — for each — the exact code change to swap hardcoded copy for `usePortalContent(schema)` reads."
    : "Show the canonical pattern for a fresh component using `usePortalContent(schema)` so I can mirror it across my new components."}

**4. Sync command.** The portal CLI uploads the schema:

\`\`\`bash
node scripts/portal-sync.mjs --site=${args.siteId} --portal=${args.portalOrigin}
\`\`\`

Confirm whether my framework needs an extra build step before this works (e.g. compiling \`portal.config.ts\` first).

## What I need back
1. Exact file path + line to insert the tag
2. Full \`portal.config.ts\` ready to paste
3. ${args.setupMode === "existing" ? "Per-component diffs (3-5 components) to swap hardcoded text for portal lookups" : "One example component using usePortalContent + the recommended folder structure"}
4. Any framework-specific gotchas (SSR hydration, CSP, build steps)

Format code in fenced blocks so I can paste straight into my files. Keep the prose tight.`;
}

// ─── Iframe login embed snippet ────────────────────────────────────────────

function IframeLoginSnippet({ siteId }: { siteId: string }) {
  const [copied, setCopied] = useState<"" | "floating" | "inline">("");
  const [variant, setVariant] = useState<"floating" | "inline">("floating");
  const portalOrigin = typeof window !== "undefined" ? window.location.origin : "https://your-portal.app";

  const floatingSnippet =
`<!-- Drop this anywhere in <head> or before </body>. That's it. -->
<script
  src="${portalOrigin}/portal/embed.js"
  data-site="${siteId}"
  data-mode="floating"
  data-label="Sign in"
  defer
></script>`;

  const inlineSnippet =
`<!-- Where you want the sign-in widget to appear: -->
<div id="portal-signin"></div>

<!-- And the loader: -->
<script
  src="${portalOrigin}/portal/embed.js"
  data-site="${siteId}"
  data-mode="inline"
  data-mount="portal-signin"
  defer
></script>`;

  const snippet = variant === "floating" ? floatingSnippet : inlineSnippet;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(variant);
      setTimeout(() => setCopied(""), 2000);
    } catch {}
  }

  return (
    <div className="rounded-lg border border-white/8 bg-brand-black/40 px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs font-medium text-brand-cream">Embed portal sign-in</p>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 text-brand-cream/55 border border-white/10">chatbot-style widget</span>
        <button
          onClick={copy}
          className="ml-auto text-[11px] px-2.5 py-1 rounded-md bg-brand-amber/20 border border-brand-amber/40 text-brand-amber hover:bg-brand-amber/30 font-semibold"
        >
          {copied === variant ? "Copied" : "Copy snippet"}
        </button>
      </div>
      <p className="text-[11px] text-brand-cream/45 leading-relaxed">
        Drop one <code className="font-mono">&lt;script&gt;</code> line into the host site — same pattern as Crisp / Intercom / Calendly. The portal runs entirely inside its own iframe (cookies, session, API calls all scoped to the portal origin); the host never touches auth tokens. Two layouts:
      </p>

      <div className="flex gap-1 text-[11px]">
        {(["floating", "inline"] as const).map(v => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={`px-2.5 py-1 rounded-md border transition-colors ${
              variant === v
                ? "border-brand-orange bg-brand-orange/10 text-brand-cream"
                : "border-white/10 text-brand-cream/55 hover:border-white/25"
            }`}
          >
            {v === "floating" ? "Floating button" : "Inline at element"}
          </button>
        ))}
      </div>

      <pre className="text-[11px] font-mono bg-brand-black border border-white/8 rounded-lg p-3 overflow-x-auto text-brand-cream/85 whitespace-pre max-h-48 overflow-y-auto">
{snippet}
      </pre>

      <p className="text-[10px] text-brand-cream/40">
        Cross-origin works because the iframe is its own app: the portal reads/writes its database from inside the iframe origin (Supabase / KV / file). Modern browsers partition iframe storage per parent so visitors of different host sites get isolated portal sessions automatically.
      </p>
    </div>
  );
}

// ─── Migration banner (Supabase) ────────────────────────────────────────────
//
// When the active backend is Supabase but the portal_state table doesn't
// exist yet, offer two paths:
//
//   1. Sync DB — auto-applies the migration via the Supabase Management
//      API. Requires a one-time PAT (different from the service-role key).
//      One click → done.
//   2. Manual copy + AI helper for other databases — for users on local
//      Postgres / MySQL / etc., a copy-pasteable Claude/ChatGPT prompt
//      that generates the right migration for their flavour.

function MigrationBanner({
  backendInfo, onMigrated, hasManagementToken,
}: {
  backendInfo: BackendInfoResponse | null;
  onMigrated: (next: BackendInfoResponse) => void;
  hasManagementToken: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);

  if (!backendInfo) return null;
  if (backendInfo.kind !== "supabase") return null;
  if (backendInfo.schemaState !== "missing" && backendInfo.schemaState !== "unknown") return null;
  if (!backendInfo.migrationSql) return null;

  async function copy() {
    if (!backendInfo?.migrationSql) return;
    try {
      await navigator.clipboard.writeText(backendInfo.migrationSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function syncDb() {
    setSyncing(true); setSyncResult(null);
    try {
      const res = await fetch("/api/portal/migrate", { method: "POST" });
      const data = await res.json() as {
        ok: boolean; appliedTo?: string; backendInfo?: BackendInfoResponse;
        error?: string; detail?: string;
      };
      if (data.ok && data.backendInfo) {
        setSyncResult({ ok: true, message: `Schema applied to project ${data.appliedTo ?? ""}.` });
        onMigrated(data.backendInfo);
      } else {
        setSyncResult({ ok: false, message: data.error ?? `Sync failed (${res.status})` });
      }
    } catch (e) {
      setSyncResult({ ok: false, message: e instanceof Error ? e.message : String(e) });
    } finally { setSyncing(false); }
  }

  return (
    <>
      <div className="rounded-2xl border border-brand-amber/40 bg-brand-amber/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-brand-amber/20 flex items-center gap-3 flex-wrap">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-amber">
            Supabase schema not initialised
          </p>
          <span className="text-[11px] text-brand-cream/65">
            One click to apply, or paste the SQL into Supabase&apos;s SQL editor.
          </span>
        </div>
        <div className="p-5 space-y-3">
          {backendInfo.schemaError && (
            <p className="text-[11px] text-brand-cream/60">{backendInfo.schemaError}</p>
          )}

          {/* Primary action: Sync DB */}
          <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/5 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-brand-cream">Sync database</p>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border bg-brand-orange/15 text-brand-orange border-brand-orange/30">Recommended</span>
              <button
                onClick={syncDb}
                disabled={syncing || !hasManagementToken}
                title={hasManagementToken ? "Applies the migration via Supabase's Management API" : "Add a Supabase Management Token below first"}
                className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {syncing ? "Applying…" : "Sync DB"}
              </button>
            </div>
            <p className="text-[11px] text-brand-cream/55 leading-relaxed">
              {hasManagementToken
                ? "Reads the migration SQL from the portal source (src/portal/server/storage.ts → getMigrationSql) and applies it to your Supabase project via the Management API. Idempotent — safe to re-run."
                : "Add a Supabase Management Token in the Database card below (different from the service-role key) and the Sync DB button enables. One-time use; you can clear it after."}
            </p>
            {syncResult && (
              <p className={`text-[11px] ${syncResult.ok ? "text-green-400" : "text-red-400"}`}>
                {syncResult.ok ? "✓ " : "✗ "}{syncResult.message}
              </p>
            )}
          </div>

          {/* Fallback: copy SQL */}
          <div className="relative">
            <pre className="text-[11px] font-mono bg-brand-black border border-white/8 rounded-lg p-3 pr-20 overflow-x-auto text-brand-cream/85 whitespace-pre">
{backendInfo.migrationSql}
            </pre>
            <button
              onClick={copy}
              className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-md bg-brand-amber/20 border border-brand-amber/40 text-brand-amber hover:bg-brand-amber/30 font-semibold"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-[10px] text-brand-cream/40">
              Source: <code className="font-mono text-brand-cream/60">src/portal/server/storage.ts</code>. Idempotent.
            </p>
            <button
              onClick={() => setAiPromptOpen(true)}
              className="text-[11px] text-brand-cream/55 hover:text-brand-cream underline"
            >
              Using a different database?
            </button>
          </div>
        </div>
      </div>

      {aiPromptOpen && (
        <AiPromptModal
          migrationSql={backendInfo.migrationSql}
          onClose={() => setAiPromptOpen(false)}
        />
      )}
    </>
  );
}

// ─── AI prompt modal (other DBs) ────────────────────────────────────────────
//
// For users running local Postgres, MySQL, or anything other than the
// Supabase REST flow. Opens a copy-pasteable prompt the admin drops
// into Claude / ChatGPT / etc; the LLM returns migration SQL adapted
// to their database engine PLUS the env-var config the portal needs.
//
// Why a prompt and not a backend implementation: every DB has its own
// connection conventions (pg vs mysql2 vs better-sqlite3, pooled vs
// direct, RLS, JSON column type) and each adds a npm dep. Letting the
// admin's LLM emit the right migration + env config is faster + works
// for the long tail without us shipping six adapters.

function AiPromptModal({ migrationSql, onClose }: {
  migrationSql: string;
  onClose: () => void;
}) {
  const [dbDescription, setDbDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const prompt = buildAiPrompt(migrationSql, dbDescription);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-brand-black-soft border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-white/8 flex items-center gap-3">
          <p className="text-sm font-semibold text-brand-cream">Generate migration for your database</p>
          <button onClick={onClose} className="ml-auto text-brand-cream/50 hover:text-brand-cream text-lg leading-none">×</button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-[12px] text-brand-cream/65 leading-relaxed">
            The portal stores its state as a single JSON blob. The schema you need is one row in one table.
            Tell the AI what database you&apos;re running and it will adapt the migration SQL + tell you
            which env vars the portal expects.
          </p>

          <div>
            <label className="block text-[11px] tracking-[0.18em] uppercase text-brand-cream/50 mb-1.5">
              Your database (free text)
            </label>
            <input
              value={dbDescription}
              onChange={e => setDbDescription(e.target.value)}
              placeholder="e.g. local Postgres 16 on Docker, MySQL 8, SQLite via better-sqlite3, Neon…"
              className={INPUT}
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/50">Prompt</label>
              <button
                onClick={copyPrompt}
                className="text-[11px] px-2.5 py-1 rounded-md bg-brand-orange/20 border border-brand-orange/40 text-brand-orange hover:bg-brand-orange/30 font-semibold"
              >
                {copied ? "Copied" : "Copy prompt"}
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-brand-black border border-white/8 rounded-lg p-3 overflow-x-auto text-brand-cream/85 whitespace-pre-wrap max-h-72 overflow-y-auto">
{prompt}
            </pre>
          </div>

          <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 text-[11px] text-brand-cream/55 leading-relaxed">
            <p className="font-medium text-brand-cream/75 mb-1">What you&apos;ll get back</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>A migration SQL adapted to your engine&apos;s JSON / JSONB / TEXT type for the blob</li>
              <li>The env vars to set on your hosting (PORTAL_BACKEND + connection details)</li>
              <li>Notes on RLS / row-level security, encryption-at-rest, and connection pooling for your engine</li>
            </ul>
          </div>
          <p className="text-[10px] text-brand-cream/40">
            Once your migration is run and the env vars are set, refresh this page — the storage status row will flip to green and the Sync DB banner disappears.
          </p>
        </div>
      </div>
    </div>
  );
}

function buildAiPrompt(migrationSql: string, dbDescription: string): string {
  const target = dbDescription.trim() || "<describe your database>";
  return `I'm setting up the "ker-v3 portal" admin tool with my own database instead of Supabase. It needs a single table called \`portal_state\` to store the portal's serialised state as one big JSON blob. Help me adapt this migration to my database engine and tell me what env vars to set.

## Reference migration (Supabase / Postgres)

\`\`\`sql
${migrationSql}\`\`\`

## My database

${target}

## What I need back

1. **Migration SQL** adapted to my database engine. Notes:
   - The \`blob\` column should be JSON / JSONB / TEXT depending on what's idiomatic for the engine
   - The \`updated_at\` column should default to the current timestamp on insert
   - Idempotent (safe to re-run)
   - If the engine has row-level security or equivalent, mention how to lock the table down
   - One starter row with id = 'singleton' inserted via ON CONFLICT / ON DUPLICATE KEY pattern

2. **Env vars the portal needs** for its backend:
   - \`PORTAL_BACKEND=...\` (file / kv / supabase / postgres — pick the right one)
   - Connection details (URL, credentials, etc.)
   - Any pool sizing or timeout notes that matter for serverless

3. **Optional**: a one-paragraph note on encryption-at-rest, backups, and which Supabase-style "service role" equivalent (if any) the portal needs to bypass RLS.

Format the migration SQL in a single \`\`\`sql code block so I can paste it straight into my SQL client. Keep the explanation short — I just need the SQL + env vars.`;
}

// ─── Deployment guide (T1 #1) ───────────────────────────────────────────────
//
// Surfaces the three concrete deploy paths so going from "this works in dev"
// to "this is live" stops being a mystery:
//
//   1. Vercel (recommended) — pre-filled env-var snippet with PORTAL_SUPABASE_*
//      + PORTAL_PREVIEW_SECRET, copy-button.
//   2. Self-host (VM / Docker) — .env block + `next start` + a note about
//      file-backend persistence requiring a writable disk.
//   3. Managed host with KV — env vars for PORTAL_KV_URL + PORTAL_KV_TOKEN.
//
// Plus a prominent "Download repo zip" button (calls /api/admin/export-code,
// mirrors what /admin/customise does — fetch → blob → anchor click) and a
// deployment-readiness status row at the top.
//
// Pre-fills any Supabase URL the admin already typed into the Database card
// so the snippets are immediately useful for their actual project.

type DeployTab = "vercel" | "self-host" | "managed-kv";

function DeploymentGuide({
  backendInfo, previewBaseUrl, supabaseUrl,
}: {
  backendInfo: BackendInfoResponse | null;
  previewBaseUrl: string;
  supabaseUrl: string;
}) {
  const [tab, setTab] = useState<DeployTab>("vercel");
  const [healthSecret, setHealthSecret] = useState<boolean | null>(null);

  // Health endpoint may expose `capabilities.previewSecret` once that flag
  // ships; if not, fall back to "is the active backend at least persistent?"
  // as a coarse readiness check.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/health", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then((data: { capabilities?: { previewSecret?: boolean } } | null) => {
        if (cancelled) return;
        const flag = data?.capabilities?.previewSecret;
        setHealthSecret(typeof flag === "boolean" ? flag : null);
      })
      .catch(() => { /* offline — leave as null */ });
    return () => { cancelled = true; };
  }, []);

  const tabs: Array<{ id: DeployTab; label: string; sub: string }> = [
    { id: "vercel",     label: "Vercel",          sub: "Recommended" },
    { id: "self-host",  label: "Self-host",       sub: "VM / Docker" },
    { id: "managed-kv", label: "Managed + KV",    sub: "Edge / Upstash" },
  ];

  return (
    <Card
      id="setup-deployment-guide"
      title="Deployment paths"
      tip="Three pre-filled paths from dev to live. Pick your host, paste the env-var block into its dashboard, and download the source as a zip if you want to push it to your own repo."
    >
      <DeployStatusRow backendInfo={backendInfo} healthSecret={healthSecret} />

      <DownloadRepoZip />

      {/* Tab strip — same visual language as the BACKENDS picker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`text-left px-3 py-3 rounded-xl border transition-colors ${
                active
                  ? "border-brand-orange bg-brand-orange/10 text-brand-cream"
                  : "border-white/10 text-brand-cream/55 hover:border-white/25"
              }`}
            >
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-[11px] text-brand-cream/45 mt-0.5">{t.sub}</p>
            </button>
          );
        })}
      </div>

      {tab === "vercel" && (
        <DeployPaneVercel previewBaseUrl={previewBaseUrl} supabaseUrl={supabaseUrl} />
      )}
      {tab === "self-host" && (
        <DeployPaneSelfHost previewBaseUrl={previewBaseUrl} supabaseUrl={supabaseUrl} />
      )}
      {tab === "managed-kv" && (
        <DeployPaneManagedKv previewBaseUrl={previewBaseUrl} />
      )}
    </Card>
  );
}

// ─── Deploy-readiness status row ───────────────────────────────────────────
//
// Combines the active-backend flag with the preview-secret signal into a
// single dot so the admin can tell at a glance whether this portal is
// actually safe to point a real domain at.
//
//   green  — persistent backend AND preview secret known to be set
//   amber  — persistent backend but preview secret unknown / missing
//   red    — backend is memory (no persistence) — anything saved evaporates

function DeployStatusRow({
  backendInfo, healthSecret,
}: {
  backendInfo: BackendInfoResponse | null;
  healthSecret: boolean | null;
}) {
  if (!backendInfo) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[11px] text-brand-cream/45">
        Probing deploy readiness…
      </div>
    );
  }

  const persistent = backendInfo.kind !== "memory" && backendInfo.persistent;
  // Treat unknown (health endpoint didn't expose the flag) as "looks fine"
  // so we don't scare admins on hosts where env-checks aren't reflected.
  const secretOk = healthSecret === null ? persistent : healthSecret;

  let dot = "bg-red-400";
  let label = "Not ready — pick a persistent backend";
  let detail = "Active backend is memory or non-persistent. Anything you save here will be lost on the next restart. Set PORTAL_BACKEND + the matching credentials before pointing a real domain at this deploy.";

  if (persistent && secretOk) {
    dot = "bg-green-400";
    label = "Ready to deploy";
    detail = `Active backend: ${backendInfo.kind} (persistent${backendInfo.writable ? "" : ", read-only fs"}). Preview-link signing secret looks configured.`;
  } else if (persistent) {
    dot = "bg-brand-amber";
    label = "Almost ready — set PORTAL_PREVIEW_SECRET";
    detail = `Active backend: ${backendInfo.kind} (persistent). Preview-link signing secret isn't set, or its status couldn't be read — preview share links will use a dev fallback that's forgeable across deploys.`;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[11px] text-brand-cream/65 leading-relaxed">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-brand-cream/85 font-semibold">{label}</span>
        <code className="font-mono text-brand-cream bg-white/5 px-1.5 py-0.5 rounded border border-white/10 ml-auto">
          {backendInfo.kind}
        </code>
        <span className="text-brand-cream/45">
          {backendInfo.persistent ? "persistent" : "ephemeral"}
        </span>
      </div>
      <p className="text-brand-cream/45 mt-1">{detail}</p>
    </div>
  );
}

// ─── Download repo zip button ──────────────────────────────────────────────
//
// Mirrors /admin/customise's exportCode pattern: fetch the zip, turn it
// into a blob, click an anchor. Adds file-size + last-modified readout
// from the response Content-Length / Last-Modified headers (or the local
// "downloaded at" timestamp if the server omits them).

function DownloadRepoZip() {
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<{ size: number; modifiedAt: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/admin/export-code");
      if (!res.ok) {
        setError(`Export failed (${res.status} ${res.statusText})`);
        return;
      }
      const blob = await res.blob();
      const lastMod = res.headers.get("last-modified");
      setInfo({ size: blob.size, modifiedAt: lastMod ? Date.parse(lastMod) : Date.now() });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `luv-ker-source-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/5 px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-semibold text-brand-cream">Download repo zip</p>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border bg-brand-orange/15 text-brand-orange border-brand-orange/30">
          Self-host kit
        </span>
        <button
          onClick={download}
          disabled={busy}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {busy ? "Building zip…" : "Download zip"}
        </button>
      </div>
      <p className="text-[11px] text-brand-cream/55 leading-relaxed">
        Bundles <code className="font-mono text-brand-cream/85">src/</code>, <code className="font-mono text-brand-cream/85">package.json</code>, and the build configs into a single archive. Push it to your own GitHub repo, point Vercel / your VM at it, set the env vars below, and you&apos;re live.
      </p>
      {info && (
        <p className="text-[11px] text-green-400">
          ✓ Downloaded {formatBytes(info.size)} · {formatRelativeTime(info.modifiedAt)}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-red-400">✗ {error}</p>
      )}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeTime(ts: number): string {
  if (!Number.isFinite(ts)) return "just now";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleString();
}

// ─── Deploy-tab panes ──────────────────────────────────────────────────────
//
// Each pane is a self-contained recipe: a short pitch, the pre-filled env
// block (copy-button), and any framework-specific notes. The env block
// is built on the client so we can pre-fill the admin's Supabase URL
// and preview base URL without round-tripping to the server.

function DeployPaneVercel({ previewBaseUrl, supabaseUrl }: { previewBaseUrl: string; supabaseUrl: string }) {
  const env =
`# Paste into Vercel → Project Settings → Environment Variables
PORTAL_BACKEND=supabase
PORTAL_SUPABASE_URL=${supabaseUrl || "https://<project-ref>.supabase.co"}
PORTAL_SUPABASE_SERVICE_KEY=<your service_role key>
PORTAL_PREVIEW_SECRET=<long random string, e.g. \`openssl rand -hex 32\`>
NEXT_PUBLIC_PORTAL_DEV_BYPASS=
# Three-mode admin login: "strict" (default, prod), "dev", or "off"
NEXT_PUBLIC_PORTAL_SECURITY=strict
# Optional — only if you want preview share links to point at the live URL
PORTAL_PREVIEW_BASE_URL=${previewBaseUrl || "https://your-site.com"}`;

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-brand-cream/65 leading-relaxed">
        <strong className="text-brand-cream/85">Recommended.</strong>{" "}
        Push the repo to GitHub, connect Vercel, paste these env vars, and deploy. Vercel&apos;s read-only filesystem means
        the file backend won&apos;t persist — Supabase is the safest default.
      </p>
      <CopyableEnvBlock label="Vercel env vars" content={env} />
      <ol className="text-[11px] text-brand-cream/55 leading-relaxed list-decimal list-inside space-y-1">
        <li>Push the source (or use the zip above) to a GitHub repo.</li>
        <li>Vercel → Add New → Project → Import the repo.</li>
        <li>Project Settings → Environment Variables → paste the block above.</li>
        <li>Deploy. The first heartbeat from your tagged site will auto-discover the project.</li>
      </ol>
    </div>
  );
}

function DeployPaneSelfHost({ previewBaseUrl, supabaseUrl }: { previewBaseUrl: string; supabaseUrl: string }) {
  const env =
`# Save as .env at the repo root before \`next start\`
PORTAL_BACKEND=file
# (or =supabase / =postgres if you want a real database)
PORTAL_SUPABASE_URL=${supabaseUrl || "https://<project-ref>.supabase.co"}
PORTAL_SUPABASE_SERVICE_KEY=<your service_role key>
PORTAL_PREVIEW_SECRET=<long random string, e.g. \`openssl rand -hex 32\`>
PORTAL_PREVIEW_BASE_URL=${previewBaseUrl || "https://your-site.com"}
NEXT_PUBLIC_PORTAL_DEV_BYPASS=
# Three-mode admin login: "strict" (default, prod), "dev", or "off"
NEXT_PUBLIC_PORTAL_SECURITY=strict
PORT=3000`;

  const cmd =
`# Build + boot
npm ci
npm run build
npm run start
# (or: node node_modules/next/dist/bin/next start -p 3000)`;

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-brand-cream/65 leading-relaxed">
        Run on your own VM, container, or bare-metal. Any node host with persistent disk works —
        Docker, Fly, Railway, a Raspberry Pi, anything.
      </p>
      <CopyableEnvBlock label=".env" content={env} />
      <CopyableEnvBlock label="Build + start" content={cmd} />
      <div className="rounded-xl border border-brand-amber/25 bg-brand-amber/5 px-3 py-2.5 text-[11px] text-brand-cream/65 leading-relaxed">
        <p className="font-medium text-brand-amber mb-1">File backend persistence</p>
        <p>
          <code className="font-mono">PORTAL_BACKEND=file</code> writes JSON to <code className="font-mono">.data/portal-state.json</code> next to the running process.
          On Docker, mount a volume at <code className="font-mono">/app/.data</code> or the state vanishes on container restart.
          On read-only filesystems, switch to Supabase or KV.
        </p>
      </div>
    </div>
  );
}

function DeployPaneManagedKv({ previewBaseUrl }: { previewBaseUrl: string }) {
  const env =
`# Paste into your host's environment-variables panel
PORTAL_BACKEND=kv
PORTAL_KV_URL=https://<your-upstash-region>.upstash.io
PORTAL_KV_TOKEN=<your Upstash REST token>
PORTAL_PREVIEW_SECRET=<long random string, e.g. \`openssl rand -hex 32\`>
PORTAL_PREVIEW_BASE_URL=${previewBaseUrl || "https://your-site.com"}
NEXT_PUBLIC_PORTAL_DEV_BYPASS=
# Three-mode admin login: "strict" (default, prod), "dev", or "off"
NEXT_PUBLIC_PORTAL_SECURITY=strict`;

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-brand-cream/65 leading-relaxed">
        Edge-style hosts (Cloudflare Pages with Workers, Netlify Edge Functions, Vercel Edge…) can&apos;t talk to Postgres directly.
        Upstash Redis over REST — wired in via <code className="font-mono">PORTAL_KV_URL</code> + <code className="font-mono">PORTAL_KV_TOKEN</code> — works
        from any node or edge runtime.
      </p>
      <CopyableEnvBlock label="Managed-host env vars" content={env} />
      <ol className="text-[11px] text-brand-cream/55 leading-relaxed list-decimal list-inside space-y-1">
        <li>Create an Upstash Redis database (any region close to your host).</li>
        <li>Copy its REST URL + REST token from the database&apos;s &ldquo;REST API&rdquo; tab.</li>
        <li>Paste them into your host&apos;s env-vars panel along with <code className="font-mono">PORTAL_BACKEND=kv</code>.</li>
        <li>Redeploy. The portal auto-promotes to the KV backend whenever both env vars are set.</li>
      </ol>
    </div>
  );
}

// ─── Copyable env-block ────────────────────────────────────────────────────
//
// Same visual + copy-button pattern as MigrationBanner / IframeLoginSnippet
// — `navigator.clipboard.writeText` with a 2s "Copied" pill.

function CopyableEnvBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — admin can still select-copy from the pre */ }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/50">{label}</label>
        <button
          onClick={copy}
          className="text-[11px] px-2.5 py-1 rounded-md bg-brand-orange/20 border border-brand-orange/40 text-brand-orange hover:bg-brand-orange/30 font-semibold"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-[11px] font-mono bg-brand-black border border-white/8 rounded-lg p-3 overflow-x-auto text-brand-cream/85 whitespace-pre">
{content}
      </pre>
    </div>
  );
}
