"use client";

import { useEffect, useState } from "react";
import {
  loadOrgs, listOrgs, getActiveOrgId, setActiveOrgId, createOrg, updateOrg, deleteOrg,
  onOrgsChange, type OrgRecord,
} from "@/lib/admin/orgs";
import Tip from "@/components/admin/Tip";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [activeId, setActiveId] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadOrgs().then(list => { if (!cancelled) { setOrgs(list); setActiveId(getActiveOrgId()); } });
    const off = onOrgsChange(() => { setOrgs(listOrgs()); setActiveId(getActiveOrgId()); });
    return () => { cancelled = true; off(); };
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    const created = await createOrg({ name: newName.trim(), ownerEmail: newOwner.trim() || undefined });
    if (created) {
      setNewName(""); setNewOwner(""); setCreating(false);
      setEditing(created.id);
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Agency</p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Organisations</h1>
            <Tip text="Each client gets their own org. Sites, content overrides, settings and (in G-3) billing all scope to the active org. The agency itself is the 'primary' org and can't be deleted." />
          </div>
          <p className="text-brand-cream/45 text-sm mt-1">{orgs.length} {orgs.length === 1 ? "org" : "orgs"}</p>
        </div>
        <button onClick={() => setCreating(true)} className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold">
          + New org
        </button>
      </div>

      {creating && (
        <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/5 p-5 space-y-3">
          <p className="text-sm font-medium text-brand-cream">New organisation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name (e.g. Felicia Skincare LLC)" className={INPUT} autoFocus />
            <input value={newOwner} onChange={e => setNewOwner(e.target.value)} placeholder="Owner email (optional)" className={INPUT} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim()} className="text-xs px-4 py-2 rounded-lg bg-brand-orange text-white font-semibold disabled:opacity-40">Create</button>
            <button onClick={() => { setCreating(false); setNewName(""); setNewOwner(""); }} className="text-xs px-4 py-2 text-brand-cream/55 hover:text-brand-cream">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {orgs.map(o => (
          <div key={o.id} className={`rounded-2xl border overflow-hidden ${o.id === activeId ? "border-brand-amber/40 bg-brand-amber/5" : "border-white/8 bg-brand-black-card"}`}>
            <button onClick={() => setEditing(editing === o.id ? null : o.id)} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02]">
              <div className="w-10 h-10 rounded-xl bg-brand-amber/15 border border-brand-amber/25 flex items-center justify-center shrink-0 overflow-hidden">
                {o.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.logoUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="font-display text-lg font-bold text-brand-amber">{o.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-brand-cream">{o.name}</p>
                  {o.isPrimary && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber font-semibold uppercase tracking-wider">Primary</span>}
                  {o.id === activeId && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange font-semibold uppercase tracking-wider">Active</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${o.status === "active" ? "bg-green-500/20 text-green-400" : o.status === "trialing" ? "bg-brand-amber/20 text-brand-amber" : "bg-white/8 text-brand-cream/40"}`}>
                    {o.status}
                  </span>
                </div>
                {o.ownerEmail && <p className="text-[11px] text-brand-cream/45 truncate font-mono mt-0.5">{o.ownerEmail}</p>}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-brand-cream/30 shrink-0 transition-transform ${editing === o.id ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {editing === o.id && (
              <div className="border-t border-white/5 p-5 space-y-4 bg-black/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={o.name} onChange={e => updateOrg(o.id, { name: e.target.value })} placeholder="Name" className={INPUT} />
                  <input value={o.ownerEmail ?? ""} onChange={e => updateOrg(o.id, { ownerEmail: e.target.value })} placeholder="Owner email" className={INPUT + " font-mono text-xs"} />
                  <input value={o.logoUrl ?? ""} onChange={e => updateOrg(o.id, { logoUrl: e.target.value })} placeholder="Logo URL" className={INPUT + " font-mono text-xs"} />
                  <select value={o.status} onChange={e => updateOrg(o.id, { status: e.target.value as OrgRecord["status"] })} className={INPUT}>
                    <option value="active">Active</option>
                    <option value="trialing">Trialing</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {o.id !== activeId && (
                    <button onClick={() => setActiveOrgId(o.id)} className="text-[11px] px-3 py-1.5 rounded-lg border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10">
                      Switch to this org
                    </button>
                  )}
                  {!o.isPrimary && (
                    <button onClick={async () => { if (confirm(`Delete org "${o.name}"? Sites under it stay but their orgId becomes orphaned.`)) await deleteOrg(o.id); }} className="text-[11px] px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto">
                      Delete org
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
