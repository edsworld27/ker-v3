import { FolderOpen } from 'lucide-react';

export const projectListWidgetUI = {
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  card: {
    base: 'glass-card p-6 rounded-[var(--radius-button)] cursor-pointer',
    header: {
      layout: 'flex justify-between items-center mb-4',
      iconWrapper: 'w-10 h-10 rounded-lg bg-[var(--client-widget-primary-color-1)]/20 flex items-center justify-center',
      icon: FolderOpen,
      iconSize: 'w-5 h-5 text-[var(--client-widget-primary-color-1)]',
      statusBadge: {
        base: 'px-3 py-1 rounded-lg text-xs font-semibold',
        active: 'bg-[color-mix(in_srgb,var(--client-widget-success)_20%,transparent)] text-[var(--client-widget-success)]',
        planning: 'bg-[color-mix(in_srgb,var(--client-widget-info)_20%,transparent)] text-[var(--client-widget-info)]',
      },
    },
    title: 'text-base font-semibold mb-1',
    description: 'text-sm text-[var(--client-widget-text-muted)] mb-4 line-clamp-2',
    details: {
      container: 'space-y-3',
      clientRow: {
        layout: 'flex justify-between items-center',
        labelStyle: 'text-xs text-[var(--client-widget-text-muted)]',
        label: 'Client',
        valueStyle: 'text-xs font-semibold',
      },
      progress: {
        container: 'pt-2',
        header: 'flex justify-between text-xs mb-1',
        label: 'Progress',
        track: 'w-full h-1.5 bg-[var(--client-widget-surface-1-glass)] rounded-full overflow-hidden',
        fillBase: 'h-full bg-gradient-to-r from-[var(--client-widget-primary-color-1)] to-[var(--client-widget-secondary,var(--client-widget-primary-color-1))] rounded-full',
      },
    },
  },
};
