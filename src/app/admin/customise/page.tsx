"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getBranding, saveBranding, resetBranding,
  listCustomTabs, createCustomTab, updateCustomTab, deleteCustomTab, moveCustomTab,
  onAdminConfigChange,
  type AdminBranding, type CustomTab,
} from "@/lib/admin/adminConfig";
import {
  getLoginCustomisation, saveLoginCustomisation, resetLoginCustomisation,
  onLoginCustomisationChange,
  type LoginCustomisation, type LoginLayout,
} from "@/lib/admin/loginCustomisation";
import Tip from "@/components/admin/Tip";

type Tab = "branding" | "tabs" | "login" | "export";

export default function AdminCustomisePage() {
  const [tab, setTab] = useState<Tab>("branding");
  const [branding, setBranding] = useState<AdminBranding>(getBranding);
  const [tabs, setTabs] = useState<CustomTab[]>(listCustomTabs);
  const [login, setLogin] = useState<LoginCustomisation>(getLoginCustomisation);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setBranding(getBranding());
      setTabs(listCustomTabs());
    };
    refresh();
    const off1 = onAdminConfigChange(refresh);
    const off2 = onLoginCustomisationChange(() => setLogin(getLoginCustomisation()));
    return () => { off1(); off2(); };
  }, []);

  function patchBranding(p: Partial<AdminBranding>) {
    saveBranding(p);
    setBranding({ ...branding, ...p });
  }

  function patchLogin(p: Partial<LoginCustomisation>) {
    saveLoginCustomisation(p);
    setLogin({ ...login, ...p });
  }

  async function exportCode() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export-code");
      if (!res.ok) {
        alert("Export failed: " + res.statusText);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `luv-ker-website-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setExporting(false);
    }
  }

  const TABS: Array<{ id: Tab; label: string; desc: string }> = [
    { id: "branding", label: "Branding",      desc: "Logo, colours, custom CSS" },
    { id: "tabs",     label: "Custom tabs",   desc: "Add iframe-embedded sidebar tabs" },
    { id: "login",    label: "Login page",    desc: "Customise the public login UI" },
    { id: "export",   label: "Export & repo", desc: "Download code and view repo" },
  ];

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Admin panel</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Customise the panel</h1>
        <p className="text-brand-cream/45 text-sm mt-1">
          Make this admin panel your own — branding, custom embedded tabs, login page, and code export.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/8 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            title={t.desc}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              tab === t.id ? "border-brand-orange text-brand-cream" : "border-transparent text-brand-cream/50 hover:text-brand-cream/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BRANDING ───────────────────────────────────────────────────────── */}
      {tab === "branding" && (
        <div className="space-y-5">
          <Card title="Names & logo" tip="The panel name and short name shown in the sidebar header.">
            <Field label="Panel name" tip="Full name shown at the top of the sidebar.">
              <input value={branding.panelName} onChange={e => patchBranding({ panelName: e.target.value })} className={INPUT} />
            </Field>
            <Field label="Short name / subtitle" tip="Smaller text under the panel name, e.g. 'Admin'.">
              <input value={branding.shortName} onChange={e => patchBranding({ shortName: e.target.value })} className={INPUT} />
            </Field>
            <Field label="Logo URL or data URI" tip="An image shown beside the panel name. Leave empty for text-only.">
              <input value={branding.logoUrl} onChange={e => patchBranding({ logoUrl: e.target.value })} placeholder="https://… or data:image/…" className={INPUT} />
            </Field>
            {branding.logoUrl && (
              <div className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={branding.logoUrl} alt="Logo preview" className="h-8 w-auto object-contain" />
                <span className="text-xs text-brand-cream/45">Logo preview</span>
              </div>
            )}
          </Card>

          <Card title="Colours" tip="Override the admin panel colours. Each admin can also pick a built-in mode (dark/light/sand/midnight) from the sidebar — those override these unless 'Custom' is selected.">
            <ColorRow label="Accent colour"   tip="Primary buttons, active nav highlights." value={branding.accentColor}  onChange={v => patchBranding({ accentColor: v })} />
            <ColorRow label="Sidebar background" tip="Used when admin mode is 'Custom'." value={branding.sidebarBg}   onChange={v => patchBranding({ sidebarBg: v })} />
            <ColorRow label="Sidebar text"    tip="Used when admin mode is 'Custom'." value={branding.sidebarText} onChange={v => patchBranding({ sidebarText: v })} />
            <ColorRow label="Panel background"   tip="Used when admin mode is 'Custom'." value={branding.panelBg}    onChange={v => patchBranding({ panelBg: v })} />
            <ColorRow label="Panel text"      tip="Used when admin mode is 'Custom'." value={branding.panelText}  onChange={v => patchBranding({ panelText: v })} />
          </Card>

          <Card title="GitHub repository" tip="A link to your code repository, shown in the sidebar footer.">
            <Field label="Repository URL" tip="e.g. https://github.com/yourorg/yourrepo">
              <input value={branding.githubRepoUrl} onChange={e => patchBranding({ githubRepoUrl: e.target.value })} placeholder="https://github.com/…" className={INPUT} />
            </Field>
          </Card>

          <Card title="Custom CSS" tip="Power-user override. Wraps inside [data-admin-panel] scope automatically.">
            <textarea
              value={branding.customCSS}
              onChange={e => patchBranding({ customCSS: e.target.value })}
              rows={6}
              placeholder="/* e.g. */&#10;[data-admin-panel] aside { box-shadow: inset -1px 0 0 rgba(255,107,53,0.3); }"
              className={INPUT + " font-mono text-xs"}
            />
          </Card>

          <div>
            <button
              onClick={() => { if (confirm("Reset all branding to defaults?")) { resetBranding(); setBranding(getBranding()); } }}
              className="text-xs text-brand-cream/45 hover:text-brand-orange"
            >
              Reset branding to defaults
            </button>
          </div>
        </div>
      )}

      {/* ── CUSTOM TABS ────────────────────────────────────────────────────── */}
      {tab === "tabs" && (
        <div className="space-y-5">
          <Card title="What are custom tabs?" tip="Add your own sidebar tabs that embed any external site via iframe — Notion, Google Docs, Stripe Dashboard, third-party tools, anything.">
            <p className="text-sm text-brand-cream/55 leading-relaxed">
              Add custom tabs to your sidebar that embed any URL via iframe.
              Useful for Notion docs, Stripe dashboard, third-party tools, or any internal page.
            </p>
            <button
              onClick={() => {
                const label = prompt("Tab label", "My tab");
                if (!label) return;
                const url = prompt("URL to embed", "https://");
                if (!url) return;
                createCustomTab({
                  label,
                  embedUrl: url,
                  icon: "🔗",
                  group: "Custom",
                  openInNewTab: false,
                  visibleToRoles: [],
                });
              }}
              className="mt-3 text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold"
            >
              + New custom tab
            </button>
          </Card>

          {tabs.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-brand-black-card px-6 py-10 text-center">
              <p className="text-brand-cream/45 text-sm">No custom tabs yet. Add one above.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-brand-black-card divide-y divide-white/5 overflow-hidden">
              {tabs.map((t, i) => (
                <CustomTabRow
                  key={t.id}
                  tab={t}
                  isFirst={i === 0}
                  isLast={i === tabs.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LOGIN PAGE ─────────────────────────────────────────────────────── */}
      {tab === "login" && (
        <div className="space-y-5">
          <Card title="Layout" tip="Choose between a centered card, a split with hero image, or a minimal layout.">
            <div className="grid grid-cols-3 gap-2">
              {(["centered", "split", "minimal"] as LoginLayout[]).map(l => (
                <button
                  key={l}
                  onClick={() => patchLogin({ layout: l })}
                  className={`px-3 py-3 rounded-xl border text-xs capitalize transition-colors ${
                    login.layout === l ? "border-brand-orange bg-brand-orange/10 text-brand-cream" : "border-white/10 text-brand-cream/55 hover:border-white/25"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Headlines" tip="The text shown on the login and signup forms.">
            <Field label="Login headline"   tip="The main heading on the sign-in form."><input value={login.headline}        onChange={e => patchLogin({ headline: e.target.value })}        className={INPUT} /></Field>
            <Field label="Login subheadline" tip="The subtitle under the login headline."><input value={login.subheadline}     onChange={e => patchLogin({ subheadline: e.target.value })}     className={INPUT} /></Field>
            <Field label="Signup headline"  tip="The main heading on the sign-up form."><input value={login.signupHeadline}    onChange={e => patchLogin({ signupHeadline: e.target.value })}    className={INPUT} /></Field>
            <Field label="Signup subheadline" tip="The subtitle under the signup headline."><input value={login.signupSubheadline} onChange={e => patchLogin({ signupSubheadline: e.target.value })} className={INPUT} /></Field>
            <Field label="Login button label"  tip="Text on the sign-in submit button."><input value={login.loginButtonLabel}  onChange={e => patchLogin({ loginButtonLabel: e.target.value })}  className={INPUT} /></Field>
            <Field label="Signup button label" tip="Text on the sign-up submit button."><input value={login.signupButtonLabel} onChange={e => patchLogin({ signupButtonLabel: e.target.value })} className={INPUT} /></Field>
          </Card>

          <Card title="Branding" tip="Logo and colours specifically for the login page.">
            <Field label="Logo URL" tip="A custom logo for the login page only."><input value={login.logoUrl} onChange={e => patchLogin({ logoUrl: e.target.value })} placeholder="https://… or empty" className={INPUT} /></Field>
            <ToggleRow label="Show logo" tip="Hide the logo entirely if you want a text-only header." value={login.showLogo} onChange={v => patchLogin({ showLogo: v })} />
            <ColorRow label="Primary / accent" tip="Submit button colour."   value={login.primaryColor} onChange={v => patchLogin({ primaryColor: v })} />
          </Card>

          <Card title="Hero image (split layout)" tip="The background image shown beside the form when layout is 'split'.">
            <Field label="Image URL" tip="An image URL or data URI."><input value={login.heroImage} onChange={e => patchLogin({ heroImage: e.target.value })} placeholder="https://…" className={INPUT} /></Field>
            <ColorRow label="Overlay colour" tip="A semi-transparent colour layered on top of the image." value={login.heroOverlayColor} onChange={v => patchLogin({ heroOverlayColor: v })} />
            <Field label={`Overlay opacity (${Math.round(login.heroOverlayOpacity * 100)}%)`} tip="0% = no overlay, 100% = solid colour blocks the image.">
              <input type="range" min={0} max={1} step={0.05} value={login.heroOverlayOpacity} onChange={e => patchLogin({ heroOverlayOpacity: Number(e.target.value) })} className="w-full accent-brand-orange" />
            </Field>
          </Card>

          <Card title="Features" tip="Toggle which login features are available.">
            <ToggleRow label="Enable Google sign-in"  tip="Show 'Continue with Google' button."   value={login.enableGoogle}  onChange={v => patchLogin({ enableGoogle: v })} />
            <ToggleRow label="Enable signup"          tip="Allow new accounts to be created here."  value={login.enableSignup}  onChange={v => patchLogin({ enableSignup: v })} />
            <ToggleRow label="Enable forgot password" tip="Show the 'Forgot your password?' link." value={login.enableForgotPassword} onChange={v => patchLogin({ enableForgotPassword: v })} />
            <ToggleRow label="Show social proof"      tip="Show a small line of customer count / trust signal under the form." value={login.showSocialProof} onChange={v => patchLogin({ showSocialProof: v })} />
            {login.showSocialProof && (
              <Field label="Social proof text" tip="Shown below the form."><input value={login.socialProofText} onChange={e => patchLogin({ socialProofText: e.target.value })} className={INPUT} /></Field>
            )}
          </Card>

          <Card title="Custom CSS" tip="Power-user override applied only on the /account page.">
            <textarea
              value={login.customCSS}
              onChange={e => patchLogin({ customCSS: e.target.value })}
              rows={5}
              placeholder="/* e.g. */&#10;[data-login-page] form { backdrop-filter: blur(20px); }"
              className={INPUT + " font-mono text-xs"}
            />
          </Card>

          <div className="flex flex-wrap gap-3 items-center">
            <Link href="/account" target="_blank" className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold">
              Preview /account ↗
            </Link>
            <button
              onClick={() => { if (confirm("Reset login customisation to defaults?")) { resetLoginCustomisation(); setLogin(getLoginCustomisation()); } }}
              className="text-xs text-brand-cream/45 hover:text-brand-orange"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* ── EXPORT & REPO ──────────────────────────────────────────────────── */}
      {tab === "export" && (
        <div className="space-y-5">
          <Card title="Download website code" tip="Downloads a zip of the entire src/ directory — every component, library, and page.">
            <p className="text-sm text-brand-cream/55 leading-relaxed">
              Get a complete copy of the website code as a ZIP file.
              Useful for backup, audit, or migration.
            </p>
            <button
              onClick={exportCode}
              disabled={exporting}
              className="mt-3 text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold disabled:opacity-60"
            >
              {exporting ? "Preparing zip…" : "↓ Export website code"}
            </button>
          </Card>

          <Card title="GitHub repository" tip="Link to your codebase on GitHub.">
            {branding.githubRepoUrl ? (
              <a
                href={branding.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-brand-cream hover:border-brand-orange hover:text-brand-orange text-sm transition-colors"
              >
                <span>🔗</span> View repo ↗
              </a>
            ) : (
              <p className="text-sm text-brand-cream/45">
                No repository URL configured. Set one in the <button onClick={() => setTab("branding")} className="text-brand-orange hover:underline">Branding tab</button>.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Custom tab editor row ────────────────────────────────────────────────────

function CustomTabRow({ tab, isFirst, isLast }: { tab: CustomTab; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tab);
  useEffect(() => setDraft(tab), [tab]);

  function save() {
    updateCustomTab(tab.id, {
      label: draft.label,
      embedUrl: draft.embedUrl,
      icon: draft.icon,
      group: draft.group,
      openInNewTab: draft.openInNewTab,
    });
    setEditing(false);
  }

  return (
    <div className="px-4 py-3">
      {editing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr] gap-2">
            <input value={draft.icon} onChange={e => setDraft({ ...draft, icon: e.target.value })} placeholder="Icon" className={INPUT + " w-16 text-center"} />
            <input value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="Label" className={INPUT} />
            <input value={draft.group} onChange={e => setDraft({ ...draft, group: e.target.value })} placeholder="Group" className={INPUT} />
          </div>
          <input value={draft.embedUrl} onChange={e => setDraft({ ...draft, embedUrl: e.target.value })} placeholder="https://…" className={INPUT + " font-mono text-xs"} />
          <label className="flex items-center gap-2 text-xs text-brand-cream/55">
            <input type="checkbox" checked={draft.openInNewTab} onChange={e => setDraft({ ...draft, openInNewTab: e.target.checked })} />
            Open in new browser tab instead of iframe
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="text-xs px-3 py-1.5 rounded-lg bg-brand-orange text-white font-semibold">Save</button>
            <button onClick={() => { setDraft(tab); setEditing(false); }} className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-brand-cream/55">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-xl shrink-0">{tab.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brand-cream truncate">{tab.label}</p>
            <p className="text-[11px] text-brand-cream/35 font-mono truncate">{tab.embedUrl}</p>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-brand-cream/40 shrink-0">{tab.group}</span>
          <div className="flex items-center gap-1 shrink-0">
            <button disabled={isFirst} onClick={() => moveCustomTab(tab.id, -1)} className="px-1.5 py-1 text-brand-cream/40 hover:text-brand-cream disabled:opacity-25">↑</button>
            <button disabled={isLast} onClick={() => moveCustomTab(tab.id, 1)} className="px-1.5 py-1 text-brand-cream/40 hover:text-brand-cream disabled:opacity-25">↓</button>
            <button onClick={() => setEditing(true)} className="text-[11px] px-2 py-1 text-brand-cream/55 hover:text-brand-cream">Edit</button>
            <button
              onClick={() => { if (confirm(`Delete "${tab.label}"?`)) deleteCustomTab(tab.id); }}
              className="text-[11px] px-2 py-1 text-brand-cream/45 hover:text-brand-orange"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── UI helpers (with tooltips) ───────────────────────────────────────────────

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

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

function ColorRow({ label, value, onChange, tip }: { label: string; value: string; onChange: (v: string) => void; tip?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-brand-cream/70 flex-1 flex items-center gap-1.5">
        {label}
        {tip && <Tip text={tip} />}
      </span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-24 text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-brand-cream font-mono focus:outline-none focus:border-brand-orange/50" />
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange, tip }: { label: string; value: boolean; onChange: (v: boolean) => void; tip?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-brand-cream/70 flex-1 flex items-center gap-1.5">
        {label}
        {tip && <Tip text={tip} />}
      </span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${value ? "bg-brand-orange justify-end" : "bg-white/15 justify-start"}`}
      >
        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}

