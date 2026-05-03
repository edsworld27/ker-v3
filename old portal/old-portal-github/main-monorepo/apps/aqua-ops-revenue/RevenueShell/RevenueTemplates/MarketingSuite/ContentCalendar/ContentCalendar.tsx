'use client';

import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Page, PageHeader, Card, Button, EmptyState } from '@aqua/bridge/ui/kit';

type ContentType = 'Blog' | 'Social' | 'Email' | 'Video';

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  Blog:   '#6366f1',
  Social: '#ec4899',
  Email:  '#10b981',
  Video:  '#f59e0b',
};

interface ScheduledContent {
  id: string;
  date: string;
  title: string;
  type: ContentType;
  channel: string;
}

const TODAY = new Date();
const isoDay = (d: Date): string => d.toISOString().slice(0, 10);
const dayOf = (d: Date, offset: number): Date => {
  const next = new Date(d);
  next.setDate(d.getDate() + offset);
  return next;
};

const SCHEDULED: readonly ScheduledContent[] = [
  { id: 's1',  date: isoDay(dayOf(TODAY, -3)),  title: '"Five Ways AI Can Save Your Q3" — guest post', type: 'Blog',   channel: 'aqua.blog' },
  { id: 's2',  date: isoDay(dayOf(TODAY, -1)),  title: 'IG carousel: "Founder rituals that work"',     type: 'Social', channel: 'Instagram' },
  { id: 's3',  date: isoDay(TODAY),             title: 'Newsletter #42 — May launch recap',            type: 'Email',  channel: 'Mailchimp' },
  { id: 's4',  date: isoDay(TODAY),             title: 'TikTok: behind-the-scenes office tour',        type: 'Video',  channel: 'TikTok' },
  { id: 's5',  date: isoDay(dayOf(TODAY, 2)),   title: 'LinkedIn thought leadership thread',           type: 'Social', channel: 'LinkedIn' },
  { id: 's6',  date: isoDay(dayOf(TODAY, 4)),   title: 'Webinar promo email — wave 1',                 type: 'Email',  channel: 'Klaviyo' },
  { id: 's7',  date: isoDay(dayOf(TODAY, 5)),   title: '"The agency pricing playbook" — long-form',    type: 'Blog',   channel: 'aqua.blog' },
  { id: 's8',  date: isoDay(dayOf(TODAY, 7)),   title: 'YouTube: customer interview cut #4',           type: 'Video',  channel: 'YouTube' },
  { id: 's9',  date: isoDay(dayOf(TODAY, 9)),   title: 'Twitter thread: pricing experiments',          type: 'Social', channel: 'X' },
  { id: 's10', date: isoDay(dayOf(TODAY, 12)),  title: 'Re-engagement drip — wave 2',                  type: 'Email',  channel: 'Klaviyo' },
];

const TYPES: readonly ContentType[] = ['Blog', 'Social', 'Email', 'Video'];

const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);
const monthLabel = (d: Date): string => d.toLocaleString('en-US', { month: 'long', year: 'numeric' });

interface CalendarCell {
  date: Date;
  iso: string;
  inMonth: boolean;
}

const buildMonthGrid = (anchor: Date): CalendarCell[] => {
  const first = startOfMonth(anchor);
  const startDay = first.getDay();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = dayOf(first, i - startDay);
    cells.push({ date: d, iso: isoDay(d), inMonth: d.getMonth() === anchor.getMonth() });
  }
  return cells;
};

export const ContentCalendar: React.FC = () => {
  const [anchor, setAnchor] = useState(() => startOfMonth(TODAY));
  const [selected, setSelected] = useState<string>(isoDay(TODAY));

  const cells = useMemo(() => buildMonthGrid(anchor), [anchor]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ScheduledContent[]>();
    SCHEDULED.forEach(s => {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    });
    return map;
  }, []);

  const selectedItems = itemsByDate.get(selected) ?? [];
  const goPrev = () => setAnchor(a => new Date(a.getFullYear(), a.getMonth() - 1, 1));
  const goNext = () => setAnchor(a => new Date(a.getFullYear(), a.getMonth() + 1, 1));
  const todayIso = isoDay(TODAY);

  return (
    <Page>
      <PageHeader
        eyebrow="Marketing"
        title="Content calendar"
        subtitle="Scheduled content across blog, social, email, and video."
        actions={
          <>
            <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={goPrev} aria-label="Previous month" />
            <div className="px-3 py-1.5 text-sm font-medium text-white inline-flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-300" />
              {monthLabel(anchor)}
            </div>
            <Button variant="ghost" size="sm" icon={ChevronRight} onClick={goNext} aria-label="Next month" />
          </>
        }
      />

      <div className="flex items-center gap-4 mb-4">
        {TYPES.map(t => (
          <div key={t} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CONTENT_TYPE_COLORS[t] }} />
            {t}
          </div>
        ))}
      </div>

      <Card padding="md" className="mb-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
            <div key={w} className="text-center text-[10px] uppercase tracking-[0.18em] font-medium text-slate-500 py-2">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map(cell => {
            const items = itemsByDate.get(cell.iso) ?? [];
            const isToday = cell.iso === todayIso;
            const isSelected = cell.iso === selected;
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelected(cell.iso)}
                className={`aspect-square min-h-[64px] p-1.5 text-left rounded-lg border transition-colors flex flex-col ${
                  isSelected
                    ? 'border-indigo-400/50 bg-indigo-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                } ${cell.inMonth ? '' : 'opacity-40'}`}
              >
                <div className={`text-xs font-medium ${
                  isToday
                    ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white'
                    : 'text-slate-200'
                }`}>
                  {cell.date.getDate()}
                </div>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {items.slice(0, 4).map(it => (
                    <span
                      key={it.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: CONTENT_TYPE_COLORS[it.type] }}
                      title={it.title}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card padding="md">
        <div className="text-base font-semibold text-white mb-3">
          {new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        {selectedItems.length === 0 ? (
          <EmptyState title="Nothing scheduled" description="No content lined up for this day." />
        ) : (
          <ul className="space-y-2">
            {selectedItems.map(it => (
              <li key={it.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CONTENT_TYPE_COLORS[it.type] }} />
                <span className="flex-1 text-sm text-white truncate">{it.title}</span>
                <span className="text-[11px] text-slate-500 shrink-0">{it.type} · {it.channel}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
};
