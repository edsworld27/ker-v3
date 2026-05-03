import { Briefcase, Calendar, CheckCircle2, Users, FolderOpen } from 'lucide-react';

export const projectListWidgetUI = {
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  card: {
    base: 'glass-card p-6 rounded-[var(--radius-button)] cursor-pointer',
    header: {
      layout: 'flex justify-between items-center mb-4',
      iconWrapper: 'w-10 h-10 rounded-lg bg-[var(--people-widget-primary-color-1)]/20 flex items-center justify-center',
      icon: FolderOpen,
      iconSize: 'w-5 h-5 text-[var(--people-widget-primary-color-1)]',
      statusBadge: {
        base: 'px-3 py-1 rounded-lg text-xs font-semibold',
        active: 'bg-[color-mix(in_srgb,var(--crm-widget-success)_20%,transparent)] text-[var(--crm-widget-success)]',
        planning: 'bg-[color-mix(in_srgb,var(--crm-widget-info)_20%,transparent)] text-[var(--crm-widget-info)]',
      },
    },
    title: 'text-base font-semibold mb-1',
    description: 'text-sm text-[var(--crm-widget-text-muted)] mb-4 line-clamp-2',
    details: {
      container: 'space-y-3',
      clientRow: {
        layout: 'flex justify-between items-center',
        labelStyle: 'text-xs text-[var(--crm-widget-text-muted)]',
        label: 'Client',
        valueStyle: 'text-xs font-semibold',
      },
      progress: {
        container: 'pt-2',
        header: 'flex justify-between text-xs mb-1',
        label: 'Progress',
        track: 'w-full h-1.5 bg-[var(--crm-widget-surface-1-glass)] rounded-full overflow-hidden',
        fillBase: 'h-full bg-gradient-to-r from-[var(--people-widget-primary-color-1)] to-[var(--crm-widget-secondary,var(--people-widget-primary-color-1))] rounded-full',
      },
    },
  },
};

export const projectsStatsWidgetUI = {
  container: 'w-full',
  grid: 'grid grid-cols-2 lg:grid-cols-4 gap-4',
  card: 'glass-card p-5 rounded-[var(--radius-button)] flex items-center gap-4',
  cardIconWrapper: 'w-10 h-10 rounded-[var(--radius-button)] bg-[var(--people-widget-primary-color-1)]/10 flex items-center justify-center shrink-0',
  cardIcon: 'w-5 h-5 text-[var(--people-widget-primary-color-1)]',
  cardContent: 'min-w-0',
  statValue: 'text-2xl font-bold block',
  statLabel: 'text-xs text-[var(--crm-widget-text-muted)] truncate',
  icons: {
    briefcase: Briefcase,
    calendar: Calendar,
    checkCircle: CheckCircle2,
    users: Users,
  },
};
