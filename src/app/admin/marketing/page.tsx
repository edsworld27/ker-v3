"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listAllSources, createSource, updateSource, deleteSource, onSourcesChange, type OrderSource,
  listDiscounts, createDiscount, updateDiscount, deleteDiscount, onDiscountsChange, type DiscountCode, type DiscountType,
  listAffiliates, createAffiliate, updateAffiliate, deleteAffiliate, onAffiliatesChange, recordAffiliatePayout, type Affiliate,
} from "@/lib/admin/marketing";
import { listOrders, type Order } from "@/lib/admin/orders";

type Tab = "sources" | "discounts" | "affiliates";

export default function MarketingPage() {
  const [tab, setTab] = useState<Tab>("sources");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(listOrders());
    const handler = () => setOrders(listOrders());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Marketing</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Sources, discounts &amp; affiliates</h1>
        <p className="text-brand-cream/45 text-sm mt-1">
          Track where customers come from, run discount campaigns, and manage affiliate partners.
        </p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-brand-black-card border border-white/8 w-fit">
        {([
          { id: "sources",    label: "Order sources" },
          { id: "discounts",  label: "Discount codes" },
          { id: "affiliates", label: "Affiliates" },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id ? "bg-brand-orange/20 text-brand-cream" : "text-brand-cream/55 hover:text-brand-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sources"    && <SourcesTab orders={orders} />}
      {tab === "discounts"  && <DiscountsTab orders={orders} />}
      {tab === "affiliates" && <AffiliatesTab orders={orders} />}
    </div>
  );
}

// ── Sources Tab ───────────────────────────────────────────────────────────
function SourcesTab({ orders }: { orders: Order[] }) {
  const [sources, setSources] = useState<OrderSource[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setSources(listAllSources());
    return onSourcesChange(() => setSources(listAllSources()));
  }, []);

  const counts = useMemo(() => {
    const m = new Map<string, { count: number; revenue: number }>();
    orders.forEach(o => {
      const id = o.source ?? "unknown";
      const cur = m.get(id) ?? { count: 0, revenue: 0 };
      cur.count += 1; cur.revenue += o.total;
      m.set(id, cur);
    });
    return m;
  }, [orders]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm tracking-wide text-brand-cream/80">Source attribution</h2>
          <button onClick={() => setShowForm(true)} className="text-xs px-3 py-1.5 rounded-lg bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30">+ Add source</button>
        </div>
        {showForm && <SourceForm onClose={() => setShowForm(false)} />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {sources.map(s => {
            const stat = counts.get(s.id);
            return <SourceCard key={s.id} src={s} count={stat?.count ?? 0} revenue={stat?.revenue ?? 0} />;
          })}
        </div>
        {sources.length === 0 && <p className="text-sm text-brand-cream/45 mt-4">No sources yet.</p>}
      </section>

      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5">
        <h2 className="text-sm tracking-wide text-brand-cream/80 mb-3">Tracking-link builder</h2>
        <p className="text-xs text-brand-cream/55 mb-3">
          Append <span className="font-mono text-brand-amber">?src=&lt;slug&gt;</span> to any campaign URL. Customers who land via that link are attributed to the matching source — first-touch, persists through checkout.
        </p>
        <div className="space-y-2">
          {sources.filter(s => s.trackingSlug).map(s => (
            <CopyRow key={s.id} label={s.label} url={`https://luvandker.com/?src=${s.trackingSlug}`} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SourceCard({ src, count, revenue }: { src: OrderSource; count: number; revenue: number }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <SourceForm initial={src} onClose={() => setEditing(false)} />;
  return (
    <div className={`p-4 rounded-xl border ${src.archived ? "bg-white/[0.02] border-white/5" : "bg-brand-black border-white/8"}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm text-brand-cream truncate">{src.label}</p>
          <p className="text-[11px] text-brand-cream/45 truncate">
            {src.trackingSlug ? <>Slug: <span className="font-mono text-brand-amber">{src.trackingSlug}</span></> : "Manual selection only"}
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={() => setEditing(true)} className="text-[10px] text-brand-cream/55 hover:text-brand-cream px-2 py-1 rounded border border-white/10">Edit</button>
          {!src.archived ? (
            <button onClick={() => updateSource(src.id, { archived: true })} className="text-[10px] text-brand-cream/40 hover:text-brand-orange px-2 py-1 rounded border border-white/10">Archive</button>
          ) : (
            <button onClick={() => updateSource(src.id, { archived: false })} className="text-[10px] text-brand-amber px-2 py-1 rounded border border-brand-amber/25">Restore</button>
          )}
          <button onClick={() => { if (confirm(`Delete source "${src.label}"?`)) deleteSource(src.id); }} className="text-[10px] text-brand-cream/40 hover:text-brand-orange px-2 py-1 rounded border border-white/10">×</button>
        </div>
      </div>
      <div className="flex gap-4 pt-2 border-t border-white/5 mt-2">
        <span className="text-[11px] text-brand-cream/55">{count} orders</span>
        <span className="text-[11px] text-brand-amber">£{revenue.toFixed(2)}</span>
      </div>
    </div>
  );
}

function SourceForm({ initial, onClose }: { initial?: OrderSource; onClose: () => void }) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [slug, setSlug] = useState(initial?.trackingSlug ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");

  function save() {
    if (!label.trim()) { alert("Label required"); return; }
    if (initial) {
      updateSource(initial.id, { label: label.trim(), trackingSlug: slug.trim() || undefined, description: desc.trim() || undefined });
    } else {
      createSource({ label: label.trim(), trackingSlug: slug.trim() || undefined, description: desc.trim() || undefined });
    }
    onClose();
  }

  return (
    <div className="p-4 rounded-xl border border-brand-amber/25 bg-brand-amber/5 space-y-2">
      <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (e.g. TikTok ad — Apr 2026)" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" />
      <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="Tracking slug (optional, used in ?src=…)" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream font-mono" />
      <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream/70" />
      <div className="flex gap-2">
        <button onClick={save} className="text-xs px-3 py-1.5 rounded-lg bg-brand-orange text-white">Save</button>
        <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-brand-cream/65">Cancel</button>
      </div>
    </div>
  );
}

function CopyRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-brand-black border border-white/5">
      <span className="text-xs text-brand-cream/55 w-32 shrink-0 truncate">{label}</span>
      <code className="text-[11px] text-brand-amber flex-1 truncate font-mono">{url}</code>
      <button
        onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="text-[10px] px-2 py-1 rounded bg-white/5 text-brand-cream/65 hover:bg-white/10"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// ── Discounts Tab ─────────────────────────────────────────────────────────
function DiscountsTab({ orders }: { orders: Order[] }) {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setDiscounts(listDiscounts());
    return onDiscountsChange(() => setDiscounts(listDiscounts()));
  }, []);

  const usage = useMemo(() => {
    const m = new Map<string, { count: number; revenue: number }>();
    orders.forEach(o => {
      if (!o.discountCode) return;
      const cur = m.get(o.discountCode) ?? { count: 0, revenue: 0 };
      cur.count += 1; cur.revenue += o.total;
      m.set(o.discountCode, cur);
    });
    return m;
  }, [orders]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <p className="text-sm text-brand-cream/55">{discounts.filter(d => !d.archived).length} active · {discounts.filter(d => d.archived).length} archived</p>
        <button onClick={() => setShowForm(true)} className="text-xs px-3 py-1.5 rounded-lg bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30">+ New code</button>
      </div>
      {showForm && <DiscountForm onClose={() => setShowForm(false)} />}
      <div className="space-y-2">
        {discounts.map(d => <DiscountRow key={d.code} d={d} stats={usage.get(d.code) ?? null} />)}
        {discounts.length === 0 && <p className="text-sm text-brand-cream/45">No discount codes yet.</p>}
      </div>
    </div>
  );
}

function DiscountRow({ d, stats }: { d: DiscountCode; stats: { count: number; revenue: number } | null }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <DiscountForm initial={d} onClose={() => setEditing(false)} />;
  const valueLabel =
    d.type === "percent"  ? `${d.value}%` :
    d.type === "fixed"    ? `£${d.value.toFixed(2)}` :
                            "Free shipping";
  const expired = d.expiresAt && d.expiresAt < Date.now();
  const usedUp = d.usageLimit && d.uses >= d.usageLimit;
  return (
    <div className={`p-4 rounded-xl border ${d.archived || expired || usedUp ? "bg-white/[0.02] border-white/5" : "bg-brand-black-card border-white/8"}`}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-3 md:items-center">
        <div className="min-w-0">
          <p className="font-mono text-brand-amber text-sm">{d.code}</p>
          {d.note && <p className="text-[11px] text-brand-cream/45 truncate">{d.note}</p>}
        </div>
        <span className="text-xs text-brand-cream/70 font-display">{valueLabel}</span>
        <span className="text-[11px] text-brand-cream/55">
          {d.uses} uses{d.usageLimit ? ` / ${d.usageLimit}` : ""}
          {stats && stats.count > 0 ? ` · £${stats.revenue.toFixed(0)}` : ""}
        </span>
        <span className="text-[10px] tracking-widest uppercase">
          {d.archived ? <span className="text-brand-cream/40">archived</span> :
           expired   ? <span className="text-brand-cream/40">expired</span> :
           usedUp    ? <span className="text-brand-cream/40">limit reached</span> :
                       <span className="text-brand-amber">active</span>}
        </span>
        <div className="flex gap-1.5">
          <button onClick={() => setEditing(true)} className="text-[10px] text-brand-cream/55 hover:text-brand-cream px-2 py-1 rounded border border-white/10">Edit</button>
          {!d.archived ? (
            <button onClick={() => updateDiscount(d.code, { archived: true })} className="text-[10px] text-brand-cream/40 hover:text-brand-orange px-2 py-1 rounded border border-white/10">Archive</button>
          ) : (
            <button onClick={() => updateDiscount(d.code, { archived: false })} className="text-[10px] text-brand-amber px-2 py-1 rounded border border-brand-amber/25">Restore</button>
          )}
          <button onClick={() => { if (confirm(`Delete code "${d.code}"?`)) deleteDiscount(d.code); }} className="text-[10px] text-brand-cream/40 hover:text-brand-orange px-2 py-1 rounded border border-white/10">×</button>
        </div>
      </div>
    </div>
  );
}

function DiscountForm({ initial, onClose }: { initial?: DiscountCode; onClose: () => void }) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<DiscountType>(initial?.type ?? "percent");
  const [value, setValue] = useState<string>(initial?.value.toString() ?? "10");
  const [minSubtotal, setMinSubtotal] = useState<string>(initial?.minSubtotal?.toString() ?? "");
  const [usageLimit, setUsageLimit] = useState<string>(initial?.usageLimit?.toString() ?? "");
  const [expiresAt, setExpiresAt] = useState<string>(initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 10) : "");
  const [note, setNote] = useState(initial?.note ?? "");

  function save() {
    if (!code.trim()) { alert("Code required"); return; }
    const body = {
      code: code.trim().toUpperCase(),
      type,
      value: type === "freeship" ? 0 : parseFloat(value) || 0,
      minSubtotal: minSubtotal ? parseFloat(minSubtotal) : undefined,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).getTime() : undefined,
      note: note.trim() || undefined,
    };
    try {
      if (initial) updateDiscount(initial.code, body);
      else createDiscount(body);
      onClose();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="p-4 rounded-xl border border-brand-amber/25 bg-brand-amber/5 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Code (e.g. SUMMER20)" disabled={!!initial} className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream font-mono disabled:opacity-50" />
        <select value={type} onChange={e => setType(e.target.value as DiscountType)} className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream">
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed £ off</option>
          <option value="freeship">Free shipping</option>
        </select>
      </div>
      {type !== "freeship" && (
        <input value={value} onChange={e => setValue(e.target.value)} type="number" placeholder={type === "percent" ? "% off" : "£ off"} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={minSubtotal} onChange={e => setMinSubtotal(e.target.value)} type="number" placeholder="Min spend (£)" className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream" />
        <input value={usageLimit} onChange={e => setUsageLimit(e.target.value)} type="number" placeholder="Usage limit" className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream" />
        <input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} type="date" className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream" />
      </div>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Internal note (optional)" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream/70" />
      <div className="flex gap-2">
        <button onClick={save} className="text-xs px-3 py-1.5 rounded-lg bg-brand-orange text-white">{initial ? "Save" : "Create"}</button>
        <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-brand-cream/65">Cancel</button>
      </div>
    </div>
  );
}

// ── Affiliates Tab ────────────────────────────────────────────────────────
function AffiliatesTab({ orders }: { orders: Order[] }) {
  const [affs, setAffs] = useState<Affiliate[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setAffs(listAffiliates());
    return onAffiliatesChange(() => setAffs(listAffiliates()));
  }, []);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; revenue: number }>();
    orders.forEach(o => {
      if (!o.affiliateId) return;
      const cur = m.get(o.affiliateId) ?? { count: 0, revenue: 0 };
      cur.count += 1; cur.revenue += o.total;
      m.set(o.affiliateId, cur);
    });
    return m;
  }, [orders]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <p className="text-sm text-brand-cream/55">{affs.filter(a => !a.archived).length} active partners</p>
        <button onClick={() => setShowForm(true)} className="text-xs px-3 py-1.5 rounded-lg bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30">+ Add affiliate</button>
      </div>
      {showForm && <AffiliateForm onClose={() => setShowForm(false)} />}
      <div className="space-y-3">
        {affs.map(a => <AffiliateCard key={a.id} a={a} stats={stats.get(a.id) ?? null} />)}
        {affs.length === 0 && <p className="text-sm text-brand-cream/45">No affiliates yet. Add a partner to start tracking commissions.</p>}
      </div>
    </div>
  );
}

function AffiliateCard({ a, stats }: { a: Affiliate; stats: { count: number; revenue: number } | null }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <AffiliateForm initial={a} onClose={() => setEditing(false)} />;
  const owed = Math.max(0, a.earnedTotal - a.paidTotal);
  return (
    <div className={`p-5 rounded-xl border ${a.archived ? "bg-white/[0.02] border-white/5" : "bg-brand-black-card border-white/8"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm text-brand-cream">{a.name} {a.archived && <span className="text-[10px] text-brand-cream/40 ml-2">archived</span>}</p>
          <p className="text-[11px] text-brand-cream/45">{a.email}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setEditing(true)} className="text-[10px] text-brand-cream/55 hover:text-brand-cream px-2 py-1 rounded border border-white/10">Edit</button>
          {owed > 0 && (
            <button
              onClick={() => { if (confirm(`Mark £${owed.toFixed(2)} as paid to ${a.name}?`)) recordAffiliatePayout(a.id, owed); }}
              className="text-[10px] text-brand-amber px-2 py-1 rounded border border-brand-amber/30"
            >
              Mark paid £{owed.toFixed(2)}
            </button>
          )}
          {!a.archived ? (
            <button onClick={() => updateAffiliate(a.id, { archived: true })} className="text-[10px] text-brand-cream/40 hover:text-brand-orange px-2 py-1 rounded border border-white/10">Archive</button>
          ) : (
            <button onClick={() => updateAffiliate(a.id, { archived: false })} className="text-[10px] text-brand-amber px-2 py-1 rounded border border-brand-amber/25">Restore</button>
          )}
          <button onClick={() => { if (confirm(`Delete affiliate "${a.name}"?`)) deleteAffiliate(a.id); }} className="text-[10px] text-brand-cream/40 hover:text-brand-orange px-2 py-1 rounded border border-white/10">×</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[11px]">
        <Stat label="Commission" value={`${a.commissionPct}%`} />
        <Stat label="Code" value={a.code ? <code className="text-brand-amber font-mono">{a.code}</code> : "—"} />
        <Stat label="Slug" value={a.trackingSlug ? <code className="text-brand-amber font-mono">?aff={a.trackingSlug}</code> : "—"} />
        <Stat label="Orders" value={`${stats?.count ?? 0} · £${(stats?.revenue ?? 0).toFixed(0)}`} />
        <Stat label="Owed" value={<span className={owed > 0 ? "text-brand-amber" : "text-brand-cream/55"}>£{owed.toFixed(2)}</span>} />
      </div>
      {a.trackingSlug && (
        <div className="mt-3">
          <CopyRow label="Affiliate link" url={`https://luvandker.com/?aff=${a.trackingSlug}`} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.22em] uppercase text-brand-cream/40 mb-0.5">{label}</p>
      <div className="text-brand-cream/85">{value}</div>
    </div>
  );
}

function AffiliateForm({ initial, onClose }: { initial?: Affiliate; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [commissionPct, setCommissionPct] = useState<string>(initial?.commissionPct.toString() ?? "10");
  const [code, setCode] = useState(initial?.code ?? "");
  const [slug, setSlug] = useState(initial?.trackingSlug ?? "");
  const [payout, setPayout] = useState(initial?.payoutMethod ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function save() {
    if (!name.trim() || !email.trim()) { alert("Name and email required"); return; }
    const body = {
      name: name.trim(),
      email: email.trim(),
      commissionPct: parseFloat(commissionPct) || 0,
      code: code.trim().toUpperCase() || undefined,
      trackingSlug: slug.trim().toLowerCase() || undefined,
      payoutMethod: payout.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (initial) updateAffiliate(initial.id, body);
    else createAffiliate(body);
    onClose();
  }

  return (
    <div className="p-4 rounded-xl border border-brand-amber/25 bg-brand-amber/5 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" />
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={commissionPct} onChange={e => setCommissionPct(e.target.value)} type="number" placeholder="Commission %" className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream" />
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Linked code (optional)" className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream font-mono" />
        <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="Tracking slug (?aff=…)" className="bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream font-mono" />
      </div>
      <input value={payout} onChange={e => setPayout(e.target.value)} placeholder="Payout method (e.g. Bank transfer, PayPal)" className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream/70" />
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream/70" />
      <div className="flex gap-2">
        <button onClick={save} className="text-xs px-3 py-1.5 rounded-lg bg-brand-orange text-white">{initial ? "Save" : "Create"}</button>
        <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-brand-cream/65">Cancel</button>
      </div>
    </div>
  );
}
