export type CalendarMode = 'month' | 'week';

export interface CalendarDeal {
  id: string;
  company: string;
  title: string;
  value: number;
  closeDate: string; // ISO date (YYYY-MM-DD)
  owner: string;
  stage: 'Negotiation' | 'Proposal' | 'Closing' | 'Verbal' | 'Pending Signature';
}

export const CALENDAR_HEADING = 'Sales Calendar';
export const CALENDAR_SUBHEAD =
  'Forecasted close dates for active opportunities. Click a day for the deal list.';

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const formatCurrencyShort = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

/**
 * Builds a 6×7 grid (42 cells) for the month containing `anchor`,
 * starting on Sunday of the first row.
 */
export const buildMonthGrid = (anchor: Date): Date[] => {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
  const startDate = new Date(year, month, 1 - startOffset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
  }
  return cells;
};

/**
 * Builds a 7-cell week row containing the anchor date.
 */
export const buildWeekGrid = (anchor: Date): Date[] => {
  const startOffset = anchor.getDay();
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - startOffset);
  const cells: Date[] = [];
  for (let i = 0; i < 7; i++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
};

export const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const toIso = (d: Date): string => {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};
