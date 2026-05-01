"use client";

// Portal-wide settings: GitHub repo + auth (used by D-3 PR promotion),
// database backend selection (D-4 storage swap), deployment URLs.
//
// Cloud-architected: state lives server-side via /api/portal/settings.
// Sensitive fields (PAT, KV URL, Postgres URL) NEVER come back from GET —
// the server replaces them with the SECRET_PLACEHOLDER sentinel so the
// UI can show "saved" without ever reading the value back. Empty input =
// secret cleared; the placeholder string in the input means leave-as-is.

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  loadSettings, saveSettings, resetSettings, onSettingsChange, DEFAULT_SETTINGS,
  hasSecret, SECRET_PLACEHOLDER,
  type PortalSettingsPatch,
} from "@/lib/admin/portalSettings";
import { getSite, type Site } from "@/lib/admin/sites";
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
  const searchParams = useSearchParams();
  const setupSiteId = searchParams?.get("setup") ?? null;
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

      {setupSite && <SetupChecklist settings={live} backendInfo={backendInfo} />}

      <MigrationBanner backendInfo={backendInfo} />

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

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* ── RESET ─────────────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={async () => {
            if (!confirm("Reset all portal settings to defaults? This will clear GitHub credentials, the chosen backend, and any preview URL.")) return;
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

function SetupChecklist({ settings, backendInfo }: {
  settings: PortalSettings;
  backendInfo: BackendInfoResponse | null;
}) {
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
  ];

  const required = items.filter(i => i.id !== "deployment");
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
    </div>
  );
}

// ─── Migration banner (Supabase) ────────────────────────────────────────────
//
// When the active backend is Supabase but the portal_state table doesn't
// exist yet, surface the migration SQL with a one-click copy.

function MigrationBanner({ backendInfo }: { backendInfo: BackendInfoResponse | null }) {
  const [copied, setCopied] = useState(false);
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
    } catch { /* clipboard blocked */ }
  }

  return (
    <div className="rounded-2xl border border-brand-amber/40 bg-brand-amber/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-brand-amber/20 flex items-center gap-3 flex-wrap">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-amber">
          Supabase schema not initialised
        </p>
        <span className="text-[11px] text-brand-cream/65">
          Run this once in Supabase → SQL Editor.
        </span>
      </div>
      <div className="p-5 space-y-3">
        {backendInfo.schemaError && (
          <p className="text-[11px] text-brand-cream/60">{backendInfo.schemaError}</p>
        )}
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
        <p className="text-[10px] text-brand-cream/40">
          The SQL is idempotent — safe to re-run. The portal re-checks the schema on every page load, so once you&apos;ve run it the banner disappears.
        </p>
      </div>
    </div>
  );
}
