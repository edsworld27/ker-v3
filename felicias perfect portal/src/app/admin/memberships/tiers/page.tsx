"use client";

// /admin/memberships/tiers — tier configuration.
//
// CRUD for the tier list. Persists by replacing the whole list
// (POST /api/portal/memberships/tiers). Free tier has no price; paid
// tiers carry a Stripe price id wired up via the Subscriptions plugin.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { confirm } from "@/components/admin/ConfirmHost";
import { notify } from "@/components/admin/Toaster";
import Tip from "@/components/admin/Tip";
import { friendlyError } from "@/lib/admin/friendlyError";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Tier {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  recurringInterval?: "month" | "year";
  benefits: string[];
  stripePriceId?: string;
  contentSlug: string;
}

const DEFAULT_CURRENCY = "GBP";

function makeTierId(): string {
  return `tier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function blankTier(): Tier {
  return {
    id: makeTierId(),
    name: "New tier",
    description: "",
    benefits: [],
    contentSlug: "",
  };
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function tiersEqual(a: Tier[], b: Tier[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function MembershipTiersPage() {
  return (
    <PluginRequired plugin="memberships">
      <MembershipTiersPageInner />
    </PluginRequired>
  );
}

function MembershipTiersPageInner() {
  const [orgId, setOrgId] = useState<string>("");
  const [draft, setDraft] = useState<Tier[]>([]);
  const [saved, setSaved] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = getActiveOrgId();
    setOrgId(id);
    (async () => {
      try {
        const res = await fetch(`/api/portal/memberships/tiers?orgId=${id}`, { cache: "no-store" });
        const data = await res.json() as { ok: boolean; tiers?: Tier[] };
        if (cancelled) return;
        const tiers = (data.tiers ?? []).map(t => ({ ...t, benefits: [...(t.benefits ?? [])] }));
        setDraft(tiers);
        setSaved(tiers);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const dirty = useMemo(() => !tiersEqual(draft, saved), [draft, saved]);

  function patch(tierId: string, patch: Partial<Tier>) {
    setDraft(prev => prev.map(t => t.id === tierId ? { ...t, ...patch } : t));
  }

  function addTier() {
    setDraft(prev => [...prev, blankTier()]);
  }

  async function deleteTier(tierId: string) {
    const target = draft.find(t => t.id === tierId);
    if (!target) return;
    const ok = await confirm({
      title: `Delete "${target.name}"?`,
      message: "Existing members on this tier won't be removed, but new joiners can't pick it.",
      danger: true,
      confirmLabel: "Delete tier",
    });
    if (!ok) return;
    setDraft(prev => prev.filter(t => t.id !== tierId));
  }

  function moveTier(tierId: string, dir: -1 | 1) {
    setDraft(prev => {
      const idx = prev.findIndex(t => t.id === tierId);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  async function save() {
    if (!orgId || saving) return;
    // Light validation: every tier needs a name + contentSlug.
    const bad = draft.find(t => !t.name.trim() || !t.contentSlug.trim());
    if (bad) {
      notify({ tone: "warn", title: "Missing fields", message: "Every tier needs a name and a content slug." });
      return;
    }
    // Slugs must be unique within the list.
    const slugs = draft.map(t => t.contentSlug.trim());
    if (new Set(slugs).size !== slugs.length) {
      notify({ tone: "warn", title: "Duplicate slug", message: "Each tier needs a unique content slug." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/portal/memberships/tiers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId, tiers: draft }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) {
        const f = friendlyError(data.error, "Save failed");
        notify({ tone: "error", title: f.title, message: f.hint ? `${f.message} ${f.hint}` : f.message });
        return;
      }
      setSaved(draft.map(t => ({ ...t, benefits: [...t.benefits] })));
      notify({ tone: "ok", message: `Saved ${draft.length} ${draft.length === 1 ? "tier" : "tiers"}` });
    } catch (e: unknown) {
      notify({ tone: "error", title: "Save failed", message: e instanceof Error ? e.message : "Network error" });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setDraft(saved.map(t => ({ ...t, benefits: [...t.benefits] })));
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <Link href="/admin/memberships" className="text-xs text-brand-cream/55 hover:text-brand-cream inline-block">
        ← Memberships
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Memberships</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Tiers</h1>
          <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
            Define the tiers your members can join. Free tier is signup-gated; paid tiers bill recurring via Stripe (Subscriptions plugin).
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {dirty && (
            <button
              type="button"
              onClick={discard}
              disabled={saving}
              className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/60 hover:text-brand-cream px-3 py-1.5 disabled:opacity-50"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={addTier}
            className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 hover:border-white/30 px-3 py-1.5 transition-colors"
          >
            + Add tier
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="text-[11px] uppercase tracking-[0.2em] text-brand-black bg-brand-amber hover:bg-brand-amber/90 rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : draft.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No tiers yet</p>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto leading-relaxed">
            Add at least one tier so visitors have something to join. A free tier is a good first step.
          </p>
          <button
            type="button"
            onClick={addTier}
            className="mt-4 text-[11px] uppercase tracking-[0.2em] text-brand-black bg-brand-amber hover:bg-brand-amber/90 rounded-lg px-3 py-1.5"
          >
            + Add first tier
          </button>
        </section>
      ) : (
        <ul className="space-y-3">
          {draft.map((tier, idx) => (
            <TierCard
              key={tier.id}
              tier={tier}
              index={idx}
              total={draft.length}
              onChange={p => patch(tier.id, p)}
              onDelete={() => deleteTier(tier.id)}
              onMove={dir => moveTier(tier.id, dir)}
            />
          ))}
        </ul>
      )}

      {!loading && draft.length > 0 && (
        <p className="text-[11px] text-brand-cream/45 max-w-prose leading-relaxed">
          List order = tier hierarchy. A member on tier <em>n</em> can access content gated to any tier ≤ <em>n</em>.
          Use ↑ / ↓ to reorder.
        </p>
      )}
    </div>
  );
}

interface TierCardProps {
  tier: Tier;
  index: number;
  total: number;
  onChange: (patch: Partial<Tier>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}

function TierCard({ tier, index, total, onChange, onDelete, onMove }: TierCardProps) {
  const isPaid = tier.price !== undefined && tier.price > 0;
  const benefitsText = tier.benefits.join("\n");

  return (
    <li className="rounded-2xl border border-white/8 bg-brand-black-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <input
            value={tier.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Tier name"
            className="w-full bg-transparent text-brand-cream font-display text-xl focus:outline-none focus:border-brand-orange/50 border-b border-transparent hover:border-white/10 focus:border-white/20 pb-1"
          />
          <input
            value={tier.description ?? ""}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Short description (optional)"
            className="w-full bg-transparent text-brand-cream/65 text-sm focus:outline-none border-b border-transparent hover:border-white/10 focus:border-white/20 pb-1"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Move up"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="text-brand-cream/55 hover:text-brand-cream disabled:opacity-25 disabled:cursor-not-allowed w-7 h-7 flex items-center justify-center rounded hover:bg-white/5"
          >
            ↑
          </button>
          <button
            type="button"
            title="Move down"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="text-brand-cream/55 hover:text-brand-cream disabled:opacity-25 disabled:cursor-not-allowed w-7 h-7 flex items-center justify-center rounded hover:bg-white/5"
          >
            ↓
          </button>
          <button
            type="button"
            title="Delete tier"
            onClick={onDelete}
            className="text-brand-cream/55 hover:text-red-400 w-7 h-7 flex items-center justify-center rounded hover:bg-white/5"
          >
            ×
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="Content slug"
          hint="Used in gate checks (e.g. content tier ≥ paid)."
          tip="Short identifier you reference when gating content. e.g. set this to 'paid' and any page marked 'requires:paid' becomes visible only to members on this tier or higher."
        >
          <input
            value={tier.contentSlug}
            onChange={e => onChange({ contentSlug: e.target.value })}
            onBlur={e => {
              if (!e.target.value.trim() && tier.name.trim()) {
                onChange({ contentSlug: slugify(tier.name) });
              }
            }}
            placeholder={tier.name ? slugify(tier.name) : "free"}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-brand-cream focus:outline-none focus:border-brand-orange/50"
          />
        </Field>

        <Field
          label="Stripe price id"
          hint="Required for paid tiers (Subscriptions plugin)."
          tip="Find this in your Stripe dashboard under Products → pick a product → copy the 'price_…' id. Free tiers leave this blank — Stripe never gets called."
        >
          <input
            value={tier.stripePriceId ?? ""}
            onChange={e => onChange({ stripePriceId: e.target.value || undefined })}
            placeholder="price_..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-brand-cream focus:outline-none focus:border-brand-orange/50"
          />
        </Field>

        <Field
          label="Price"
          hint="In smallest unit (pence/cents). Leave blank for free."
          tip="In pence/cents — £9.99 = 999, $5 = 500. The storefront converts back to a friendly £/$/€ when displaying. Leave both fields blank for a free tier."
        >
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={tier.price ?? ""}
              onChange={e => {
                const v = e.target.value;
                onChange({ price: v === "" ? undefined : Number(v) });
              }}
              placeholder="0"
              className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
            />
            <input
              value={tier.currency ?? ""}
              onChange={e => onChange({ currency: e.target.value.toUpperCase() || undefined })}
              placeholder={DEFAULT_CURRENCY}
              maxLength={3}
              className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm uppercase font-mono text-brand-cream focus:outline-none focus:border-brand-orange/50"
            />
          </div>
        </Field>

        <Field
          label="Billing interval"
          hint={isPaid ? "How often Stripe charges members." : "Only used for paid tiers."}
          tip="Monthly = card charged every month. Yearly = once a year (often discounted). Has to match the interval set on the Stripe price id above."
        >
          <select
            value={tier.recurringInterval ?? ""}
            onChange={e => {
              const v = e.target.value;
              onChange({ recurringInterval: v === "" ? undefined : (v as "month" | "year") });
            }}
            disabled={!isPaid}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">—</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </Field>
      </div>

      <Field label="Benefits" hint="One per line. Shown as bullet points on the join page.">
        <textarea
          rows={Math.max(3, tier.benefits.length)}
          value={benefitsText}
          onChange={e => onChange({
            benefits: e.target.value.split("\n").map(s => s.trim()).filter(Boolean),
          })}
          placeholder="Free articles&#10;Newsletter&#10;Members-only forum"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50 leading-relaxed"
        />
      </Field>
    </li>
  );
}

function Field({ label, hint, tip, children }: { label: string; hint?: string; tip?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] uppercase tracking-[0.18em] text-brand-cream/55 inline-flex items-center gap-1.5">
        {label}
        {tip && <Tip text={tip} />}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-brand-cream/40">{hint}</span>}
    </label>
  );
}
