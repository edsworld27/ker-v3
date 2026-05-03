"use client";

import { useEffect, useState } from "react";
import {
  getShippingConfig, updatePolicy, updateDefaults,
  addZone, updateZone, deleteZone,
  addRate, updateRate, deleteRate,
  onShippingChange, type ShippingConfig,
} from "@/lib/admin/shipping";
import Tip from "@/components/admin/Tip";
import PluginRequired from "@/components/admin/PluginRequired";
import { confirm } from "@/components/admin/ConfirmHost";

export default function AdminShippingPage() {
  return <PluginRequired plugin="ecommerce" feature="shipping"><AdminShippingPageInner /></PluginRequired>;
}

function AdminShippingPageInner() {
  const [cfg, setCfg] = useState<ShippingConfig | null>(null);

  useEffect(() => {
    const refresh = () => setCfg(getShippingConfig());
    refresh();
    return onShippingChange(refresh);
  }, []);

  if (!cfg) return null;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-5xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Shipping</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Zones, rates &amp; policy</h1>
        <p className="text-brand-cream/45 text-sm mt-1">Drives checkout pricing, the shipping page, and the chatbot's shipping answers.</p>
      </div>

      {/* Defaults */}
      <Section title="Dispatch defaults">
        <Field label="Handling time" tipId="shipping.handling-time" tip="How long between order and shipment. Shown on the storefront and used by the chatbot.">
          <input
            value={cfg.defaults.handlingTime}
            onChange={e => updateDefaults({ handlingTime: e.target.value })}
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
          />
        </Field>
        <Field label="Cutoff" tipId="shipping.cutoff" tip="Daily cutoff time for same-day dispatch. Orders placed after this ship the next business day.">
          <input
            value={cfg.defaults.cutoff}
            onChange={e => updateDefaults({ cutoff: e.target.value })}
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
          />
        </Field>
        <Field label="Default carrier" tipId="shipping.carrier" tip="Used when an order's tracking is missing carrier metadata.">
          <input
            value={cfg.defaults.carrier}
            onChange={e => updateDefaults({ carrier: e.target.value })}
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
          />
        </Field>
      </Section>

      {/* Zones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/60">Shipping zones</h2>
          <Tip id="shipping.zones" text="Group destination countries and assign carrier rates to each. The first matching zone wins, so order zones from most specific to most general (eg. UK first, then Europe, then Worldwide)." />
        </div>
        <button onClick={() => addZone()} className="text-xs px-3 py-1.5 rounded-lg border border-brand-orange/30 text-brand-orange hover:bg-brand-orange/10">+ Add zone</button>
      </div>

      <div className="space-y-4">
        {cfg.zones.map(z => (
          <div key={z.id} className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 bg-brand-black-soft/40 flex flex-wrap items-center gap-3">
              <input
                value={z.name}
                onChange={e => updateZone(z.id, { name: e.target.value })}
                className="flex-1 min-w-[12rem] bg-transparent text-sm font-semibold text-brand-cream focus:outline-none"
              />
              <input
                value={z.countries.join(", ")}
                onChange={e => updateZone(z.id, { countries: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder="ISO codes: GB, IE, FR…"
                className="flex-1 min-w-[10rem] bg-brand-black border border-white/10 rounded px-2 py-1 text-xs text-brand-cream"
              />
              <input
                type="number"
                value={z.freeThreshold ?? ""}
                onChange={e => updateZone(z.id, { freeThreshold: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Free over £"
                className="w-24 bg-brand-black border border-white/10 rounded px-2 py-1 text-xs text-brand-cream"
              />
              <button onClick={async () => { if (await confirm({ title: `Delete zone "${z.name}"?`, message: "Existing orders that used this zone keep their shipping cost.", danger: true, confirmLabel: "Delete" })) deleteZone(z.id); }} className="text-[11px] text-brand-cream/40 hover:text-brand-orange">Delete</button>
            </div>
            <div className="p-4 space-y-2">
              {z.rates.map(r => (
                <div key={r.id} className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg bg-brand-black border border-white/5">
                  <input value={r.label} onChange={e => updateRate(z.id, r.id, { label: e.target.value })} placeholder="Label" className="flex-1 min-w-[10rem] bg-transparent text-sm text-brand-cream focus:outline-none" />
                  <span className="text-[11px] text-brand-cream/40">£</span>
                  <input type="number" step="0.01" value={r.price} onChange={e => updateRate(z.id, r.id, { price: Number(e.target.value) })} className="w-20 bg-brand-black border border-white/10 rounded px-2 py-1 text-xs text-brand-cream" />
                  <input type="number" value={r.minDays} onChange={e => updateRate(z.id, r.id, { minDays: Number(e.target.value) })} placeholder="min" className="w-14 bg-brand-black border border-white/10 rounded px-2 py-1 text-xs text-brand-cream" />
                  <span className="text-[11px] text-brand-cream/40">–</span>
                  <input type="number" value={r.maxDays} onChange={e => updateRate(z.id, r.id, { maxDays: Number(e.target.value) })} placeholder="max" className="w-14 bg-brand-black border border-white/10 rounded px-2 py-1 text-xs text-brand-cream" />
                  <span className="text-[11px] text-brand-cream/40">days</span>
                  <button onClick={() => deleteRate(z.id, r.id)} className="text-brand-cream/40 hover:text-brand-orange">×</button>
                </div>
              ))}
              <button onClick={() => addRate(z.id)} className="text-[11px] px-3 py-1.5 rounded-md border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10">+ Add rate</button>
            </div>
          </div>
        ))}
      </div>

      {/* Policy */}
      <Section title="Public policy text">
        <Field label="Headline"><input value={cfg.policy.headline} onChange={e => updatePolicy({ headline: e.target.value })} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" /></Field>
        <Field label="Intro"><textarea value={cfg.policy.intro} onChange={e => updatePolicy({ intro: e.target.value })} rows={2} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" /></Field>
        <Field label="Returns headline"><input value={cfg.policy.returnsHeadline} onChange={e => updatePolicy({ returnsHeadline: e.target.value })} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" /></Field>
        <Field label="Returns body"><textarea value={cfg.policy.returnsBody} onChange={e => updatePolicy({ returnsBody: e.target.value })} rows={3} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" /></Field>
        <Field label="Damage headline"><input value={cfg.policy.damageHeadline} onChange={e => updatePolicy({ damageHeadline: e.target.value })} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" /></Field>
        <Field label="Damage body"><textarea value={cfg.policy.damageBody} onChange={e => updatePolicy({ damageBody: e.target.value })} rows={3} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" /></Field>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-brand-black-soft/40">
        <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/60">{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, tip, tipId, children }: { label: string; tip?: string; tipId?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 sm:col-span-2">
      <label className="text-[11px] tracking-widest uppercase text-brand-cream/45 flex items-center gap-1.5">
        {label}
        {tip && <Tip id={tipId} text={tip} />}
      </label>
      {children}
    </div>
  );
}
