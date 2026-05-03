import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Page, PageHeader, Card, Button, Badge, EmptyState } from '@aqua/bridge/ui/kit';
import {
  CALENDAR_HEADING,
  CALENDAR_SUBHEAD,
  WEEKDAY_LABELS,
  MONTH_LABELS,
  buildMonthGrid,
  buildWeekGrid,
  sameDay,
  toIso,
  formatCurrencyShort,
  type CalendarDeal,
  type CalendarMode,
} from './SalesCalendarView.ui';

const TODAY = new Date();
const yyyy = TODAY.getFullYear();
const mm = TODAY.getMonth();

const buildMockDeals = (): CalendarDeal[] => {
  const offsets = [
    { d: 2,  value: 32400,  company: 'Cobalt Software Group',  title: 'SEO Sprint',          owner: 'Sasha Owens',    stage: 'Proposal'         as const },
    { d: 5,  value: 84200,  company: 'Northwind Logistics',    title: 'Brand Refresh',       owner: 'Marcus Hale',    stage: 'Closing'          as const },
    { d: 5,  value: 24000,  company: 'Granite Peak Capital',   title: 'Investor Deck',       owner: 'Marcus Hale',    stage: 'Negotiation'      as const },
    { d: 9,  value: 112500, company: 'Helios Manufacturing',   title: 'Website Build',       owner: 'Priya Banerjee', stage: 'Pending Signature' as const },
    { d: 12, value: 38000,  company: 'BrightWater Studios',    title: 'Content Retainer',    owner: 'Jordan Iverson', stage: 'Verbal'           as const },
    { d: 15, value: 64750,  company: 'Lumen Health Partners',  title: 'Launch Campaign',     owner: 'Jordan Iverson', stage: 'Closing'          as const },
    { d: 15, value: 29400,  company: 'Riverline Media',        title: 'Brand Audit',         owner: 'Sasha Owens',    stage: 'Proposal'         as const },
    { d: 15, value: 41250,  company: 'Ironbark Construction',  title: 'Marketing Refresh',   owner: 'Sasha Owens',    stage: 'Negotiation'      as const },
    { d: 19, value: 156800, company: 'Vertex Aerospace',       title: 'Strategy Sprint',     owner: 'Priya Banerjee', stage: 'Negotiation'      as const },
    { d: 22, value: 96000,  company: 'Atlas Architecture',     title: 'Quarterly Retainer',  owner: 'Marcus Hale',    stage: 'Pending Signature' as const },
    { d: 22, value: 18500,  company: 'Sapphire Boutique',      title: 'Guest Site',          owner: 'Jordan Iverson', stage: 'Proposal'         as const },
    { d: 26, value: 72500,  company: 'Pinecrest Outdoors',     title: 'Ecommerce Build',     owner: 'Sasha Owens',    stage: 'Verbal'           as const },
    { d: 28, value: 48000,  company: 'Halcyon Wellness',       title: 'Membership Site',     owner: 'Priya Banerjee', stage: 'Closing'          as const },
  ];
  return offsets.map((o, i) => {
    const day = Math.min(o.d, 28);
    const date = new Date(yyyy, mm, day);
    return {
      id: `cd-${i}`,
      company: o.company,
      title: o.title,
      value: o.value,
      closeDate: toIso(date),
      owner: o.owner,
      stage: o.stage,
    };
  });
};

const STAGE_TONE: Record<CalendarDeal['stage'], 'success' | 'warning' | 'info' | 'indigo' | 'amber'> = {
  Negotiation: 'amber',
  Proposal: 'warning',
  Closing: 'success',
  Verbal: 'indigo',
  'Pending Signature': 'info',
};

export const SalesCalendarView: React.FC = () => {
  const [anchor, setAnchor] = useState(new Date(yyyy, mm, 1));
  const [mode, setMode] = useState<CalendarMode>('month');
  const [selected, setSelected] = useState<Date | null>(null);

  const deals = useMemo(() => buildMockDeals(), []);
  const dealsByDate = useMemo(() => {
    const map = new Map<string, CalendarDeal[]>();
    deals.forEach(d => {
      const list = map.get(d.closeDate) ?? [];
      list.push(d);
      map.set(d.closeDate, list);
    });
    return map;
  }, [deals]);

  const cells = useMemo(
    () => (mode === 'month' ? buildMonthGrid(anchor) : buildWeekGrid(anchor)),
    [anchor, mode],
  );

  const headingTitle = `${MONTH_LABELS[anchor.getMonth()]} ${anchor.getFullYear()}`;

  const goPrev = () => {
    if (mode === 'month') setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 7));
  };
  const goNext = () => {
    if (mode === 'month') setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 7));
  };
  const goToday = () => {
    setAnchor(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()));
    setSelected(TODAY);
  };

  const selectedDeals = selected ? dealsByDate.get(toIso(selected)) ?? [] : [];

  return (
    <Page>
      <PageHeader
        eyebrow="Sales"
        title={CALENDAR_HEADING}
        subtitle={CALENDAR_SUBHEAD}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={goPrev} aria-label="Previous" />
            <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
            <Button variant="ghost" size="sm" icon={ChevronRight} onClick={goNext} aria-label="Next" />
            <div className="ml-2 inline-flex items-center bg-white/[0.03] border border-white/10 rounded-lg p-0.5">
              {(['month', 'week'] as CalendarMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-2.5 h-7 rounded-md text-xs font-medium capitalize transition-colors ${
                    mode === m
                      ? 'bg-white/[0.08] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">{headingTitle}</h2>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAY_LABELS.map(w => (
              <div
                key={w}
                className="text-center text-[10px] uppercase tracking-[0.18em] font-medium text-slate-500 py-2"
              >
                {w}
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-7 gap-1 ${mode === 'month' ? 'grid-rows-6' : 'grid-rows-1'}`}>
            {cells.map(cell => {
              const inMonth = cell.getMonth() === anchor.getMonth();
              const isToday = sameDay(cell, TODAY);
              const isSelected = selected ? sameDay(cell, selected) : false;
              const dayDeals = dealsByDate.get(toIso(cell)) ?? [];
              return (
                <button
                  key={`${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`}
                  type="button"
                  onClick={() => setSelected(cell)}
                  className={`aspect-square min-h-[72px] p-2 text-left rounded-lg border transition-colors relative flex flex-col ${
                    isSelected
                      ? 'border-indigo-400/50 bg-indigo-500/10'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                  } ${inMonth ? '' : 'opacity-40'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? 'rounded-full w-6 h-6 flex items-center justify-center text-white'
                          : 'text-slate-200'
                      }`}
                      style={isToday ? { backgroundColor: 'var(--revenue-widget-primary-color-1)' } : undefined}
                    >
                      {cell.getDate()}
                    </span>
                    {dayDeals.length > 0 && (
                      <span className="text-[10px] font-medium px-1.5 h-4 inline-flex items-center rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                        {dayDeals.length}
                      </span>
                    )}
                  </div>
                  {dayDeals.length > 0 && (
                    <div className="text-[10px] text-emerald-300 mt-auto tabular-nums">
                      {formatCurrencyShort(dayDeals.reduce((sum, d) => sum + d.value, 0))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card padding="md">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">
              {selected
                ? selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Select a day'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {selected
                ? `${selectedDeals.length} deal${selectedDeals.length === 1 ? '' : 's'} closing`
                : 'Tap any day to see closing deals.'}
            </p>
          </div>

          {selected && selectedDeals.length === 0 ? (
            <EmptyState title="No deals" description="Nothing scheduled to close this day." />
          ) : null}

          <ul className="space-y-2">
            {selectedDeals.map(deal => (
              <li
                key={deal.id}
                className="p-3 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-sm font-medium text-white truncate">{deal.company}</div>
                  <Badge tone={STAGE_TONE[deal.stage]}>{deal.stage}</Badge>
                </div>
                <div className="text-xs text-slate-400 mb-2 truncate">{deal.title}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-semibold tabular-nums">
                    {formatCurrencyShort(deal.value)}
                  </span>
                  <span className="text-slate-500">{deal.owner}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Page>
  );
};
