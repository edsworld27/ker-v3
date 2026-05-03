import { Briefcase, Calendar, CheckCircle2, Users } from 'lucide-react';

export const projectsStatsWidgetUI = {
  container: 'w-full',
  grid: 'grid grid-cols-2 lg:grid-cols-4 gap-4',
  card: 'glass-card p-5 rounded-[var(--radius-button)] flex items-center gap-4',
  cardIconWrapper: 'w-10 h-10 rounded-[var(--radius-button)] bg-[var(--client-widget-primary-color-1)]/10 flex items-center justify-center shrink-0',
  cardIcon: 'w-5 h-5 text-[var(--client-widget-primary-color-1)]',
  cardContent: 'min-w-0',
  statValue: 'text-2xl font-bold block',
  statLabel: 'text-xs text-[var(--client-widget-text-muted)] truncate',
  icons: {
    briefcase: Briefcase,
    calendar: Calendar,
    checkCircle: CheckCircle2,
    users: Users,
  },
};
