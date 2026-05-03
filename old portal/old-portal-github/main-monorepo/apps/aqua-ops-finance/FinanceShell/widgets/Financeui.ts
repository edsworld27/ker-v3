import { Briefcase, Calendar, CheckCircle2, Users, FolderOpen } from 'lucide-react';

export const projectListWidgetUI = {
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  card: {
    base: 'glass-card p-6 rounded-[var(--radius-button)] cursor-pointer',
    header: {
      layout: 'flex justify-between items-center mb-4',
      iconWrapper: 'w-10 h-10 rounded-lg bg-[var(--finance-primary-color)]/20 flex items-center justify-center',
      icon: FolderOpen,
      iconSize: 'w-5 h-5 text-[var(--finance-primary-color)]',
      statusBadge: {
        base: 'px-3 py-1 rounded-lg text-xs font-semibold',
        active: 'bg-[color-mix(in_srgb,var(--finance-widget-success)_20%,transparent)] text-[var(--finance-widget-success)]',
        planning: 'bg-[color-mix(in_srgb,var(--finance-widget-info)_20%,transparent)] text-[var(--finance-widget-info)]',
      },
    },
    title: 'text-base font-semibold mb-1',
    description: 'text-sm text-[var(--finance-text-color-muted)] mb-4 line-clamp-2',
    details: {
      container: 'space-y-3',
      clientRow: {
        layout: 'flex justify-between items-center',
        labelStyle: 'text-xs text-[var(--finance-text-color-muted)]',
        label: 'Client',
        valueStyle: 'text-xs font-semibold',
      },
      progress: {
        container: 'pt-2',
        header: 'flex justify-between text-xs mb-1',
        label: 'Progress',
        track: 'w-full h-1.5 bg-[var(--finance-surface-color-glass)] rounded-full overflow-hidden',
        fillBase: 'h-full bg-gradient-to-r from-[var(--finance-primary-color)] to-[var(--finance-secondary-color,var(--finance-primary-color))] rounded-full',
      },
    },
  },
};

export const projectsStatsWidgetUI = {
  container: 'w-full',
  grid: 'grid grid-cols-2 lg:grid-cols-4 gap-4',
  card: 'glass-card p-5 rounded-[var(--radius-button)] flex items-center gap-4',
  cardIconWrapper: 'w-10 h-10 rounded-[var(--radius-button)] bg-[var(--finance-primary-color)]/10 flex items-center justify-center shrink-0',
  cardIcon: 'w-5 h-5 text-[var(--finance-primary-color)]',
  cardContent: 'min-w-0',
  statValue: 'text-2xl font-bold block',
  statLabel: 'text-xs text-[var(--finance-text-color-muted)] truncate',
  icons: {
    briefcase: Briefcase,
    calendar: Calendar,
    checkCircle: CheckCircle2,
    users: Users,
  },
};
