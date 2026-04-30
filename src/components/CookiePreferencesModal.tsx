"use client";

import { useEffect, useState } from "react";
import {
  getConsentPreferences,
  saveConsentPreferences,
  acceptAll,
  declineAll,
  downloadUserData,
  deleteMyData,
  onConsentPrefsChange,
  type ConsentPreferences,
} from "@/lib/consent";

interface Props {
  onClose: () => void;
  initialTab?: "cookies" | "data";
}

export default function CookiePreferencesModal({ onClose, initialTab = "cookies" }: Props) {
  const [tab, setTab] = useState<"cookies" | "data">(initialTab);
  const [prefs, setPrefs] = useState<ConsentPreferences>(getConsentPreferences);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    return onConsentPrefsChange(() => setPrefs(getConsentPreferences()));
  }, []);

  function handleSave() {
    saveConsentPreferences({
      functional: prefs.functional,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAcceptAll() {
    acceptAll();
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  }

  function handleDeclineAll() {
    declineAll();
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  }

  function handleDeleteData() {
    deleteMyData();
    setDeleted(true);
    setDeleteConfirm(false);
    setTimeout(() => { onClose(); window.location.href = "/"; }, 1500);
  }

  const CATEGORIES: Array<{
    key: keyof Omit<ConsentPreferences, "necessary" | "updatedAt" | "decided">;
    label: string;
    description: string;
    required?: boolean;
  }> = [
    {
      key: "functional",
      label: "Functional",
      description: "Enables features like saved cart items, language preferences, and personalisation. Removing these may affect your experience.",
    },
    {
      key: "analytics",
      label: "Analytics",
      description: "Helps us understand how visitors use the site (Google Analytics, Hotjar, Plausible). Data is anonymised and never sold.",
    },
    {
      key: "marketing",
      label: "Marketing",
      description: "Used to show you relevant ads on social platforms (Meta, TikTok). Only active if you've accepted analytics too.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-brand-black-soft border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="font-display text-lg text-brand-cream">Privacy &amp; Data</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-brand-cream/50 hover:text-brand-cream text-lg">✕</button>
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

              {/* Necessary — always on */}
              <div className="rounded-xl border border-white/8 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-cream">Strictly necessary</p>
                    <p className="text-xs text-brand-cream/45 mt-0.5">Required for the site to function. Cannot be disabled.</p>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-brand-orange/60 flex items-center justify-end px-0.5 shrink-0 cursor-not-allowed">
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Toggleable categories */}
              {CATEGORIES.map(cat => {
                const enabled = cat.key === "functional" ? prefs.functional
                  : cat.key === "analytics" ? prefs.analytics
                  : prefs.marketing;
                return (
                  <div key={cat.key} className="rounded-xl border border-white/8 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-cream">{cat.label}</p>
                        <p className="text-xs text-brand-cream/45 mt-0.5 leading-relaxed">{cat.description}</p>
                      </div>
                      <button
                        onClick={() => setPrefs(p => ({ ...p, [cat.key]: !enabled }))}
                        className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 mt-0.5 ${
                          enabled ? "bg-brand-orange justify-end" : "bg-white/15 justify-start"
                        }`}
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
                Accept all
              </button>
            </div>
            <button
              onClick={handleSave}
              className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${
                saved ? "bg-green-600/80 text-white" : "bg-brand-orange text-white hover:bg-brand-orange-dark"
              }`}
            >
              {saved ? "Saved!" : "Save preferences"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
