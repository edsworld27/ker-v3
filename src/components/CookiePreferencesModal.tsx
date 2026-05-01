"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getConsentPreferences,
  saveConsentPreferences,
  acceptAll,
  declineAll,
  downloadUserData,
  deleteMyData,
  onConsentPrefsChange,
  enforceComplianceDefaults,
  isStrictConsentMode,
  type ConsentPreferences,
} from "@/lib/consent";
import { getComplianceModeSync, onComplianceChange } from "@/lib/admin/portalCompliance";
import type { ComplianceMode } from "@/portal/server/types";
import { logActivity } from "@/lib/admin/activity";
import { resolveSiteByHost } from "@/lib/admin/sites";
import Tip from "@/components/admin/Tip";

interface Props {
  onClose: () => void;
  initialTab?: "cookies" | "data";
}

interface EmbedThemePartial {
  brandColor?: string;
}

// Resolve the active siteId. PortalTagInjector sets the
// data-portal-site attribute on its <script>; if that's not present
// (e.g. native storefront load) we fall back to host-based resolution.
function resolveSiteId(): string {
  if (typeof document !== "undefined") {
    const tag = document.querySelector<HTMLScriptElement>("script[data-portal-site]");
    const attr = tag?.getAttribute("data-portal-site");
    if (attr) return attr;
  }
  if (typeof window !== "undefined") {
    try { return resolveSiteByHost(window.location.host).id; } catch { /* ignore */ }
  }
  return "luvandker";
}

// Tiny pill shown at the top of the modal so legal/editor staff can
// instantly see which compliance regime is active. Colour-coded:
//  - none  → muted (grey)
//  - gdpr  → amber (matches NavWarning conventions)
//  - hipaa → red (most restrictive)
//  - soc2  → blue
function ComplianceModePill({ mode }: { mode: ComplianceMode }) {
  if (mode === "none") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/8 text-brand-cream/55 border border-white/10">
        No compliance mode
      </span>
    );
  }
  const styles: Record<Exclude<ComplianceMode, "none">, { label: string; cls: string }> = {
    gdpr:  { label: "GDPR mode active",  cls: "bg-brand-amber/15 text-brand-amber border-brand-amber/30" },
    hipaa: { label: "HIPAA mode active", cls: "bg-red-500/15 text-red-300 border-red-500/30" },
    soc2:  { label: "SOC 2 mode active", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  };
  const s = styles[mode];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" /> {s.label}
    </span>
  );
}

export default function CookiePreferencesModal({ onClose, initialTab = "cookies" }: Props) {
  const [tab, setTab] = useState<"cookies" | "data">(initialTab);
  const [prefs, setPrefs] = useState<ConsentPreferences>(getConsentPreferences);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [mode, setMode] = useState<ComplianceMode>(() => getComplianceModeSync());
  const [brandColor, setBrandColor] = useState<string>("");

  useEffect(() => {
    return onConsentPrefsChange(() => setPrefs(getConsentPreferences()));
  }, []);

  // Compliance probe + listen for mode flips. enforceComplianceDefaults
  // also rewrites stored prefs if the active mode is stricter than what
  // was previously saved.
  useEffect(() => {
    let cancelled = false;
    enforceComplianceDefaults().then(m => { if (!cancelled) setMode(m); }).catch(() => {});
    const off = onComplianceChange(() => {
      if (cancelled) return;
      setMode(getComplianceModeSync());
      setPrefs(getConsentPreferences());
    });
    return () => { cancelled = true; off(); };
  }, []);

  // Load per-site brand colour from the embed-theme endpoint.
  useEffect(() => {
    const siteId = resolveSiteId();
    let cancelled = false;
    fetch(`/api/portal/embed-theme/${encodeURIComponent(siteId)}`, { cache: "no-store" })
      .then(r => r.ok ? r.json() as Promise<EmbedThemePartial> : null)
      .then(theme => { if (!cancelled && theme?.brandColor) setBrandColor(theme.brandColor); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const strict = isStrictConsentMode(mode);

  function handleSave() {
    saveConsentPreferences({
      functional: true,                // always-on; UI mirrors this
      analytics: prefs.analytics,
      marketing: prefs.marketing,
    });
    logActivity({
      category: "settings",
      action: "Cookie consent: saved-prefs",
      diff: {
        analytics:  { from: undefined, to: prefs.analytics },
        marketing:  { from: undefined, to: prefs.marketing },
        functional: { from: undefined, to: true },
        complianceMode: { from: undefined, to: mode },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAcceptAll() {
    acceptAll();
    logActivity({
      category: "settings",
      action: "Cookie consent: accept-all",
      diff: { complianceMode: { from: undefined, to: mode } },
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  }

  function handleDeclineAll() {
    declineAll();
    logActivity({
      category: "settings",
      action: "Cookie consent: decline-all",
      diff: { complianceMode: { from: undefined, to: mode } },
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  }

  function handleDeleteData() {
    deleteMyData();
    setDeleted(true);
    setDeleteConfirm(false);
    setTimeout(() => { onClose(); window.location.href = "/"; }, 1500);
  }

  // Saved-button + Accept-button accent colour. Falls back to the
  // brand-orange Tailwind default if no per-site override is set.
  const accentStyle = useMemo(() => {
    if (!brandColor) return undefined;
    return { backgroundColor: brandColor, color: "white" } as const;
  }, [brandColor]);

  const accentBorderStyle = useMemo(() => {
    if (!brandColor) return undefined;
    return { borderColor: brandColor, color: brandColor } as const;
  }, [brandColor]);

  const CATEGORIES: Array<{
    key: "functional" | "analytics" | "marketing";
    label: string;
    description: string;
    tipId: string;
    tipText: string;
    alwaysOn?: boolean;
  }> = [
    {
      key: "functional",
      label: "Functional",
      description: "Enables features like saved cart items, language preferences, and personalisation. Always on — required for the site to work.",
      tipId: "consent.category.functional",
      tipText: "Functional cookies remember your cart, login state, and theme preferences. They do not track you across sites and cannot be disabled because the site cannot operate without them.",
      alwaysOn: true,
    },
    {
      key: "analytics",
      label: "Analytics",
      description: "Helps us understand how visitors use the site (Google Analytics, Hotjar, Plausible). Data is anonymised and never sold.",
      tipId: "consent.category.analytics",
      tipText: "Analytics cookies measure how visitors use the site so we can improve it. Examples: Google Analytics, Plausible, Hotjar. Under GDPR / HIPAA these stay off until you opt in.",
    },
    {
      key: "marketing",
      label: "Marketing",
      description: "Used to show you relevant ads on social platforms (Meta, TikTok). Only active if you've accepted analytics too.",
      tipId: "consent.category.marketing",
      tipText: "Marketing cookies feed ad platforms (Meta, TikTok, Google Ads) so we can show you relevant ads. Under GDPR / HIPAA these stay off until you opt in.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-brand-black-soft border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="font-display text-lg text-brand-cream truncate">Privacy &amp; Data</h2>
            <ComplianceModePill mode={mode} />
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-brand-cream/50 hover:text-brand-cream text-lg shrink-0">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8 shrink-0">
          {(["cookies", "data"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t ? "border-brand-orange text-brand-cream" : "border-transparent text-brand-cream/45 hover:text-brand-cream/70"
              }`}
              style={tab === t && brandColor ? { borderColor: brandColor } : undefined}
            >
              {t === "cookies" ? "Cookie settings" : "My data"}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
          {tab === "cookies" && (
            <>
              <p className="text-sm text-brand-cream/60 leading-relaxed">
                We use cookies to improve your experience. You can choose which categories to allow below.
                Strictly necessary cookies are always active.
              </p>

              {strict && (
                <div className="rounded-xl border border-brand-amber/30 bg-brand-amber/10 px-3 py-2.5 text-[11px] text-brand-amber leading-relaxed">
                  Your jurisdiction requires opt-in. Analytics &amp; marketing stay off until you actively enable them.
                </div>
              )}

              {/* Necessary — always on */}
              <div className="rounded-xl border border-white/8 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-cream">Strictly necessary</p>
                    <p className="text-xs text-brand-cream/45 mt-0.5">Required for the site to function. Cannot be disabled.</p>
                  </div>
                  <div
                    className="w-10 h-5 rounded-full bg-brand-orange/60 flex items-center justify-end px-0.5 shrink-0 cursor-not-allowed"
                    style={brandColor ? { backgroundColor: `${brandColor}99` } : undefined}
                  >
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Toggleable categories */}
              {CATEGORIES.map(cat => {
                const enabled = cat.alwaysOn
                  ? true
                  : cat.key === "analytics" ? prefs.analytics
                  : cat.key === "marketing" ? prefs.marketing
                  : prefs.functional;
                const disabled = cat.alwaysOn === true;
                return (
                  <div key={cat.key} className="rounded-xl border border-white/8 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-cream flex items-center gap-1.5">
                          {cat.label}
                          <Tip id={cat.tipId} text={cat.tipText} />
                          {disabled && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/8 text-brand-cream/55 border border-white/10">
                              Always on
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-brand-cream/45 mt-0.5 leading-relaxed">{cat.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (disabled) return;
                          setPrefs(p => ({ ...p, [cat.key]: !enabled }));
                        }}
                        disabled={disabled}
                        aria-disabled={disabled}
                        className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 mt-0.5 ${
                          disabled
                            ? "bg-brand-orange/60 justify-end cursor-not-allowed"
                            : enabled ? "bg-brand-orange justify-end"
                            : "bg-white/15 justify-start"
                        }`}
                        style={enabled && brandColor ? { backgroundColor: disabled ? `${brandColor}99` : brandColor } : undefined}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {prefs.updatedAt > 0 && (
                <p className="text-[11px] text-brand-cream/30 text-center">
                  Last updated: {new Date(prefs.updatedAt).toLocaleDateString("en-GB")}
                </p>
              )}
            </>
          )}

          {tab === "data" && (
            <>
              <p className="text-sm text-brand-cream/60 leading-relaxed">
                Under GDPR you have the right to access, download, and delete the data we hold about you in this browser.
              </p>

              {/* Download */}
              <div className="rounded-xl border border-white/8 p-4 space-y-2">
                <p className="text-sm font-semibold text-brand-cream">Download my data</p>
                <p className="text-xs text-brand-cream/45 leading-relaxed">
                  Download a JSON file containing your profile, cart, orders, and preference data stored in this browser.
                </p>
                <button
                  onClick={downloadUserData}
                  className="mt-1 text-xs px-4 py-2 rounded-lg border border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 transition-colors font-semibold"
                  style={accentBorderStyle}
                >
                  ↓ Download data
                </button>
              </div>

              {/* Delete */}
              <div className="rounded-xl border border-red-500/20 p-4 space-y-2">
                <p className="text-sm font-semibold text-brand-cream">Delete my data</p>
                <p className="text-xs text-brand-cream/45 leading-relaxed">
                  Permanently clears all personal data, session, cart, and consent records stored in this browser.
                  You will be signed out and any unsaved cart will be lost.
                </p>

                {deleted ? (
                  <p className="text-xs text-green-400">Data deleted. Redirecting…</p>
                ) : deleteConfirm ? (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleDeleteData}
                      className="text-xs px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
                    >
                      Yes, delete everything
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="text-xs px-4 py-2 rounded-lg border border-white/15 text-brand-cream/60"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="mt-1 text-xs px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-semibold"
                  >
                    Delete all my data
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-white/8 p-4">
                <p className="text-sm font-semibold text-brand-cream mb-1">Data we hold</p>
                <ul className="space-y-1 text-xs text-brand-cream/50">
                  <li>• Session / login state (email, name, role)</li>
                  <li>• Shopping cart contents</li>
                  <li>• Order history</li>
                  <li>• Cookie preferences</li>
                  <li>• Theme / display preferences</li>
                </ul>
                <p className="text-[11px] text-brand-cream/30 mt-2">
                  This data is stored in your browser only. We do not maintain a server-side account database at this time.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {tab === "cookies" && (
          <div className="px-5 py-4 border-t border-white/8 flex flex-wrap gap-2 justify-between shrink-0">
            <div className="flex gap-2">
              <button
                onClick={handleDeclineAll}
                className="text-xs px-3 py-2 rounded-lg border border-white/15 text-brand-cream/60 hover:text-brand-cream"
              >
                Decline all
              </button>
              <button
                onClick={handleAcceptAll}
                className="text-xs px-3 py-2 rounded-lg border border-white/15 text-brand-cream/60 hover:text-brand-cream"
              >
                {strict ? "Accept" : "Accept all"}
              </button>
            </div>
            <button
              onClick={handleSave}
              className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${
                saved ? "bg-green-600/80 text-white" : "bg-brand-orange text-white hover:bg-brand-orange-dark"
              }`}
              style={!saved ? accentStyle : undefined}
            >
              {saved ? "Saved!" : "Save preferences"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
