"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listGroups, addGroup, updateGroup, deleteGroup, moveGroup,
  addItem, updateItem, deleteItem, moveItem, onFaqChange,
  type FaqGroup,
} from "@/lib/admin/faq";
import { confirm } from "@/components/admin/ConfirmHost";

export default function AdminFaqPage() {
  const [groups, setGroups] = useState<FaqGroup[]>([]);
  useEffect(() => {
    const refresh = () => setGroups(listGroups());
    refresh();
    return onFaqChange(refresh);
  }, []);

  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-4xl">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">FAQ</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Frequently asked questions</h1>
          <p className="text-brand-cream/45 text-sm mt-1">{totalItems} answer{totalItems === 1 ? "" : "s"} across {groups.length} section{groups.length === 1 ? "" : "s"}.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/faq" target="_blank" className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/60 hover:text-brand-cream">View live →</Link>
          <button
            onClick={() => addGroup("New section")}
            className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold"
          >
            + Add section
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No FAQ sections yet.</p>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto">
            FAQ sections show up on your storefront&apos;s <code className="font-mono text-brand-cream/65">/faq</code> page. Group questions by topic (Shipping, Returns, etc.).
          </p>
          <button
            onClick={() => addGroup("New section")}
            className="mt-4 text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold"
          >
            + Add your first section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(g => (
            <GroupEditor key={g.id} group={g} canUp={groups.indexOf(g) > 0} canDown={groups.indexOf(g) < groups.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupEditor({ group, canUp, canDown }: { group: FaqGroup; canUp: boolean; canDown: boolean }) {
  const [heading, setHeading] = useState(group.heading);
  useEffect(() => setHeading(group.heading), [group.heading]);

  return (
    <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-brand-black-soft/40">
        <label className="flex-1 sr-only" htmlFor={`faq-group-${group.id}`}>Section heading</label>
        <input
          id={`faq-group-${group.id}`}
          value={heading}
          onChange={e => setHeading(e.target.value)}
          onBlur={() => updateGroup(group.id, heading)}
          placeholder="Section heading"
          aria-label="Section heading"
          className="flex-1 bg-transparent text-sm font-display font-semibold text-brand-cream focus:outline-none placeholder:text-brand-cream/30"
        />
        <div className="flex items-center gap-1 text-[11px]">
          <button disabled={!canUp} onClick={() => moveGroup(group.id, -1)} aria-label="Move section up" title="Move up" className="px-2 py-0.5 text-brand-cream/40 hover:text-brand-cream disabled:opacity-25">↑</button>
          <button disabled={!canDown} onClick={() => moveGroup(group.id, 1)} aria-label="Move section down" title="Move down" className="px-2 py-0.5 text-brand-cream/40 hover:text-brand-cream disabled:opacity-25">↓</button>
          <button
            onClick={async () => {
              if (await confirm({
                title: `Delete "${group.heading}"?`,
                message: `${group.items.length} item${group.items.length === 1 ? "" : "s"} inside will be removed too.`,
                danger: true,
                confirmLabel: "Delete section",
              })) deleteGroup(group.id);
            }}
            className="px-2 py-0.5 text-brand-cream/40 hover:text-brand-orange"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {group.items.length === 0 && (
          <p className="text-[11px] text-brand-cream/40 italic">No questions in this section yet.</p>
        )}
        {group.items.map((it, i) => (
          <ItemEditor
            key={it.id}
            groupId={group.id}
            item={it}
            canUp={i > 0}
            canDown={i < group.items.length - 1}
          />
        ))}
        <button
          onClick={() => addItem(group.id)}
          className="text-[11px] px-3 py-1.5 rounded-md border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10"
        >
          + Add question
        </button>
      </div>
    </div>
  );
}

function ItemEditor({ groupId, item, canUp, canDown }: { groupId: string; item: { id: string; question: string; answer: string }; canUp: boolean; canDown: boolean }) {
  const [q, setQ] = useState(item.question);
  const [a, setA] = useState(item.answer);
  useEffect(() => { setQ(item.question); setA(item.answer); }, [item.id, item.question, item.answer]);

  return (
    <div className="rounded-lg border border-white/5 bg-brand-black p-3 space-y-2">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`faq-q-${item.id}`}>Question</label>
        <input
          id={`faq-q-${item.id}`}
          value={q}
          onChange={e => setQ(e.target.value)}
          onBlur={() => updateItem(groupId, item.id, { question: q })}
          placeholder="Question"
          aria-label="Question"
          className="flex-1 bg-transparent text-sm font-medium text-brand-cream focus:outline-none placeholder:text-brand-cream/30"
        />
        <div className="flex items-center gap-1 text-[11px]">
          <button disabled={!canUp} onClick={() => moveItem(groupId, item.id, -1)} aria-label="Move question up" title="Move up" className="px-1.5 text-brand-cream/40 hover:text-brand-cream disabled:opacity-25">↑</button>
          <button disabled={!canDown} onClick={() => moveItem(groupId, item.id, 1)} aria-label="Move question down" title="Move down" className="px-1.5 text-brand-cream/40 hover:text-brand-cream disabled:opacity-25">↓</button>
          <button onClick={() => deleteItem(groupId, item.id)} aria-label="Delete question" title="Delete" className="px-1.5 text-brand-cream/40 hover:text-brand-orange">×</button>
        </div>
      </div>
      <label className="sr-only" htmlFor={`faq-a-${item.id}`}>Answer</label>
      <textarea
        id={`faq-a-${item.id}`}
        value={a}
        onChange={e => setA(e.target.value)}
        onBlur={() => updateItem(groupId, item.id, { answer: a })}
        placeholder="Answer"
        aria-label="Answer"
        rows={3}
        className="w-full bg-transparent text-xs text-brand-cream/70 focus:outline-none resize-y leading-relaxed placeholder:text-brand-cream/30"
      />
    </div>
  );
}
