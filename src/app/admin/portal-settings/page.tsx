"use client";

// Portal-wide settings: GitHub repo + auth (used by D-3 PR promotion),
// database backend selection (D-4 storage swap), deployment URLs.
//
// Stored in localStorage via @/lib/admin/portalSettings. Sensitive fields
// (PAT, KV URL, Postgres URL) are rendered as type=password with a
// Show/Hide eye toggle.
//
// Mirrors the Card / Field / Tip / INPUT idiom from /admin/customise.

import { useEffect, useRef, useState } from "react";
import {
  getSettings, saveSettings, resetSettings, onSettingsChange, DEFAULT_SETTINGS,
  type PortalSettingsPatch,
} from "@/lib/admin/portalSettings";
import type { PortalSettings, DatabaseBackend } from "@/portal/server/types";
import Tip from "@/components/admin/Tip";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

const BACKENDS: Array<{ id: DatabaseBackend; label: string; sub: string }> = [
  { id: "file",     label: "File",     sub: "Local JSON files (default)" },
  { id: "kv",       label: "KV",       sub: "Vercel KV / Upstash Redis" },
  { id: "postgres", label: "Postgres", sub: "Self-hosted or managed PG" },
];

export default function AdminPortalSettingsPage() {
  const [settings, setSettings] = useState<PortalSettings>(DEFAULT_SETTINGS);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSettings(getSettings());
    return onSettingsChange(() => setSettings(getSettings()));
  }, []);

  function patch(p: PortalSettingsPatch) {
    const next = saveSettings(p);
    setSettings(next);
    setSavedAt(Date.now());
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => setSavedAt(null), 2000);
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Admin panel</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Portal settings</h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            Connect this admin to a GitHub repository and choose a database backend.
            Used by the upcoming PR-promotion (D-3) and storage-swap (D-4) phases.
          </p>
        </div>
        <SavedIndicator at={savedAt} />
      </div>

      {/* ── GITHUB ────────────────────────────────────────────────────────── */}
      <Card title="GitHub" tip="Where the admin will open pull requests when you promote draft content. The GitHub App route is preferred — installation tokens are scoped to the repo and rotate automatically. Personal Access Tokens are a fallback for development.">
        <Field label="Repository URL" tip="The repo this portal manages content for, e.g. https://github.com/owner/repo.">
          <input
            value={settings.github.repoUrl}
            onChange={e => patch({ github: { repoUrl: e.target.value } })}
            placeholder="https://github.com/owner/repo"
            className={INPUT + " font-mono text-xs"}
          />
        </Field>
        <Field label="Default branch" tip="The branch new pull requests target (typically 'main').">
          <input
            value={settings.github.defaultBranch}
            onChange={e => patch({ github: { defaultBranch: e.target.value } })}
            placeholder="main"
            className={INPUT}
          />
        </Field>
        <Field label="GitHub App ID (optional)" tip="Preferred over a Personal Access Token. Install your GitHub App on the repo and paste its App ID + Installation ID.">
          <input
            value={settings.github.appId ?? ""}
            onChange={e => patch({ github: { appId: e.target.value } })}
            placeholder="123456"
            className={INPUT}
          />
        </Field>
        <Field label="Installation ID" tip="Found in the GitHub App's installation page URL.">
          <input
            value={settings.github.installationId ?? ""}
            onChange={e => patch({ github: { installationId: e.target.value } })}
            placeholder="12345678"
            className={INPUT}
          />
        </Field>
        <SensitiveField
          label="Personal Access Token (fallback)"
          tip="PATs are full-permission and storing them in browser localStorage is a development convenience only. Prefer a GitHub App in production."
          value={settings.github.pat ?? ""}
          onChange={v => patch({ github: { pat: v } })}
          placeholder="ghp_…"
        />
      </Card>

      {/* ── DATABASE ──────────────────────────────────────────────────────── */}
      <Card title="Database" tip="Where the portal stores its own state (heartbeats, content overrides, embed registry, etc.). The actual swap activates in D-4 — today the file backend is in use regardless of this setting.">
        <Field label="Backend" tip="File is local-only and resets between deploys on read-only hosts. KV recommended for Vercel deployments. Postgres for self-hosted.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {BACKENDS.map(b => {
              const active = settings.database.backend === b.id;
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

        {settings.database.backend === "kv" && (
          <SensitiveField
            label="KV connection URL"
            tip="Your Vercel KV REST URL (or Upstash Redis URL). Pulled from your hosting dashboard."
            value={settings.database.kvUrl ?? ""}
            onChange={v => patch({ database: { kvUrl: v } })}
            placeholder="https://…upstash.io or rediss://…"
          />
        )}

        {settings.database.backend === "postgres" && (
          <SensitiveField
            label="Postgres connection URL"
            tip="A standard postgresql:// connection string. Use a pooled URL for serverless."
            value={settings.database.postgresUrl ?? ""}
            onChange={v => patch({ database: { postgresUrl: v } })}
            placeholder="postgresql://user:pass@host/db"
          />
        )}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[11px] text-brand-cream/55 leading-relaxed">
          <strong className="text-brand-cream/75">Note:</strong>{" "}
          Storage swap activates in D-4. Today the file backend is in use regardless of this setting.
        </div>
      </Card>

      {/* ── DEPLOYMENT ────────────────────────────────────────────────────── */}
      <Card title="Deployment" tip="Where the host site is deployed. Used by the workflow phase to build signed preview links to draft content.">
        <Field label="Preview base URL" tip="Signed preview links to draft content will be hosted under this URL. Optional — only needed if you want share links for review.">
          <input
            value={settings.deployment.previewBaseUrl ?? ""}
            onChange={e => patch({ deployment: { previewBaseUrl: e.target.value } })}
            placeholder="https://your-site.com"
            className={INPUT + " font-mono text-xs"}
          />
        </Field>
      </Card>

      {/* ── RESET ─────────────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => {
            if (confirm("Reset all portal settings to defaults? This will clear GitHub credentials, the chosen backend, and any preview URL.")) {
              resetSettings();
              setSettings(getSettings());
              setSavedAt(Date.now());
              if (fadeTimer.current) clearTimeout(fadeTimer.current);
              fadeTimer.current = setTimeout(() => setSavedAt(null), 2000);
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

function Card({ title, tip, children }: { title: string; tip?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
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

// Password-style field with a Show/Hide toggle. Used for PAT, KV URL, Postgres URL.
function SensitiveField({
  label, tip, value, onChange, placeholder,
}: {
  label: string;
  tip?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} tip={tip}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={INPUT + " pr-20 font-mono text-xs"}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide value" : "Show value"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md text-brand-cream/55 hover:text-brand-cream hover:bg-white/5"
        >
          {show ? "Hide" : "Show"}
        </button>
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
