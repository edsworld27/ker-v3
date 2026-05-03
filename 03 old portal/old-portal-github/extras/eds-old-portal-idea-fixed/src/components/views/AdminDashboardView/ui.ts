import { Plus, Users, LayoutDashboard, Briefcase, Activity, CheckCircle2 } from 'lucide-react';

export const adminDashboardUI = {
  page: {
    motionKey: 'admin-dashboard',
    animation: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    padding: 'p-4 md:p-6 lg:p-10',
    maxWidth: 'max-w-7xl mx-auto w-full',
  },
  header: {
    layout: 'flex flex-col md:flex-row md:items-center justify-between',
    gap: 'gap-6 mb-8 md:mb-10',
    title: {
      base: 'text-2xl md:text-3xl font-semibold',
      founder: 'Founder Dashboard',
      manager: 'Agency Overview',
      employee: 'My Workspace'
    },
    subtitle: {
      base: 'text-sm md:text-base text-slate-400',
      founder: 'Platform-wide metrics and agency performance.',
      manager: 'Monitor client progress and team workload.',
      employee: 'Your active tasks and assigned clients.'
    },
    actions: {
      layout: 'flex gap-2',
      addClientBtn: {
        layout: 'w-full md:w-auto px-6 py-3 bg-[var(--color-primary)] hover:brightness-110 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/20',
        icon: Plus,
        iconSize: 'w-4 h-4',
        label: 'New Client'
      }
    }
  },
  widgets: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12',
    founder: [
      { id: 'w1', icon: Users, label: 'Total Clients', valueKey: 'clients.length', trend: '+12%', color: 'primary' },
      { id: 'w2', icon: Briefcase, label: 'Active Projects', valueKey: 'activeProjects.length', trend: '+5%', color: 'emerald' },
      { id: 'w3', icon: Activity, label: 'Platform Revenue', value: '£45,200', trend: '+18%', color: 'amber' }
    ],
    manager: [
      { id: 'w1', icon: Users, label: 'My Clients', valueKey: 'userClients.length', trend: '+2', color: 'primary' },
      { id: 'w2', icon: Briefcase, label: 'Active Projects', valueKey: 'activeProjects.length', trend: '+1', color: 'emerald' },
      { id: 'w3', icon: LayoutDashboard, label: 'Tasks Pending', value: '12', trend: '-3', color: 'amber' }
    ],
    employee: [
      { id: 'w1', icon: Briefcase, label: 'Active Projects', valueKey: 'userClients.length', trend: 'On Track', color: 'primary' },
      { id: 'w2', icon: CheckCircle2, label: 'Tasks Completed', value: '24', trend: '+8 this week', color: 'emerald' },
      { id: 'w3', icon: Activity, label: 'Hours Tracked', value: '32h', trend: 'Productive', color: 'amber' }
    ]
  },
  mainGrid: {
    layout: 'grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8',
    cards: {
      base: 'glass-card p-8 rounded-3xl',
      title: 'text-xl font-medium mb-8',
      list: 'space-y-6',
      listTight: 'space-y-4',
      operator: {
        item: 'flex items-center justify-between p-4 bg-white/5 rounded-2xl',
        leftGroup: 'flex items-center gap-4',
        avatar: 'w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold',
        name: 'text-sm font-medium',
        role: 'text-[10px] text-slate-500 uppercase tracking-widest',
        rightGroup: 'text-right',
        rating: 'text-sm font-bold text-emerald-400',
        clients: 'text-[10px] text-slate-500'
      },
      revenue: {
        item: 'flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5',
        leftGroup: 'flex items-center gap-4',
        avatar: 'w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold',
        name: 'text-sm font-medium',
        stage: 'text-[10px] uppercase tracking-widest font-bold text-slate-500',
        amount: 'text-sm font-bold text-[var(--color-primary)]'
      },
      pipeline: {
        item: 'space-y-2',
        header: 'flex justify-between text-xs',
        stageLabel: 'text-slate-400',
        count: 'font-bold',
        track: 'h-1.5 w-full bg-white/5 rounded-full overflow-hidden',
        fill: 'h-full transition-all duration-1000'
      },
      workload: {
        item: 'flex items-center justify-between p-4 bg-white/5 rounded-2xl',
        leftGroup: 'flex items-center gap-4',
        avatar: 'w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold',
        name: 'text-sm font-medium',
        clients: 'text-[10px] text-slate-500',
        statusBadge: 'px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest'
      },
      tasks: {
        item: 'flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[var(--color-primary)]/30 transition-all',
        leftGroup: 'flex items-center gap-4',
        dotHigh: 'bg-red-500',
        dotMedium: 'bg-amber-500',
        dotLow: 'bg-blue-500',
        dotBase: 'w-2 h-2 rounded-full',
        taskName: 'text-sm font-medium',
        client: 'text-[10px] text-slate-500',
        checkBtn: 'p-2 hover:bg-white/10 rounded-lg transition-colors',
        checkIcon: 'w-4 h-4 text-slate-400'
      },
      deadlines: {
        item: 'flex items-center justify-between p-4 bg-white/5 rounded-2xl',
        leftGroup: 'flex items-center gap-4',
        avatar: 'w-10 h-10 rounded-xl bg-slate-500/10 flex flex-col items-center justify-center text-[10px] font-bold',
        dateMonth: 'text-[var(--color-primary)]',
        taskName: 'text-sm font-medium',
        status: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest'
      }
    }
  }
};