/**
 * SocialEngagement.ui — UI variable declarations for social platform aggregates.
 */
export const socialEngagementUI = {
  page: {
    container: 'p-8 min-h-full bg-[var(--revenue-bg-color)]',
    header: 'flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6',
    title: 'text-4xl font-black text-[var(--revenue-widget-text)] tracking-tight italic uppercase',
    subtitle: 'text-[var(--revenue-widget-text-muted)] text-sm font-medium mt-2',
  },
  cards: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6',
    card: 'p-6 flex flex-col gap-3',
    head: 'flex items-center justify-between',
    badge: 'inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white',
    growth: {
      up: 'text-xs font-bold text-[var(--revenue-widget-success)]',
      down: 'text-xs font-bold text-[var(--revenue-widget-error)]',
    },
    followers: 'text-3xl font-black text-[var(--revenue-widget-text)] tracking-tight',
    statRow: 'flex items-center justify-between text-xs',
    statLabel: 'text-[var(--revenue-widget-text-muted)] uppercase tracking-widest font-bold',
    statValue: 'text-[var(--revenue-widget-text)] font-bold',
    topPost: 'mt-2 p-3 rounded-xl bg-[var(--revenue-widget-surface-color-1-glass)] border border-[var(--revenue-widget-border)]',
    topPostLabel: 'text-[10px] uppercase tracking-widest text-[var(--revenue-widget-text-muted)] font-bold mb-1',
    topPostText: 'text-xs text-[var(--revenue-widget-text)] line-clamp-2',
    topPostMeta: 'text-[10px] text-[var(--revenue-widget-text-muted)] mt-1.5',
  },
  recent: {
    wrap: 'p-6',
    title: 'text-base font-bold text-[var(--revenue-widget-text)] mb-3',
    row: 'flex items-center gap-3 py-3 border-b border-[var(--revenue-widget-border)] last:border-0',
    platform: 'inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-xs',
    text: 'flex-1 text-sm text-[var(--revenue-widget-text)] line-clamp-1',
    meta: 'text-xs text-[var(--revenue-widget-text-muted)] tabular-nums whitespace-nowrap',
  },
} as const;

export const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  LinkedIn: '#0A66C2',
  Twitter: '#1DA1F2',
  TikTok: '#69C9D0',
};
