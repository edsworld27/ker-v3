import { Sparkles, Users, MessageSquare, Zap } from 'lucide-react';

export const aiSessionsViewUI = {
  page: {
    motionKey: 'ai-sessions',
    animation: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    layout: 'p-4 md:p-8 max-w-7xl mx-auto w-full',
  },
  header: {
    layout: 'flex items-center justify-between mb-8',
    titleStyle: 'text-2xl font-bold tracking-tight',
    title: 'AI Sessions',
    subtitleStyle: 'text-slate-400 text-sm mt-1',
    subtitle: 'Monitor all AI assistant interactions across your portal.',
    actions: {
      layout: 'flex items-center gap-3',
      exportBtn: 'flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-all',
      exportLabel: 'Export',
    },
  },
  widgets: {
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-8',
    items: [
      { id: 'total', icon: Sparkles, label: 'Total Sessions', value: '—', trend: undefined, color: 'primary' },
      { id: 'users', icon: Users, label: 'Active Users', value: '—', trend: undefined, color: 'emerald' },
      { id: 'messages', icon: MessageSquare, label: 'Total Messages', value: '—', trend: undefined, color: 'amber' },
      { id: 'avg', icon: Zap, label: 'Avg. Per Session', value: '—', trend: undefined, color: 'slate' },
    ],
  },
  sessions: {
    layout: 'space-y-4',
    titleStyle: 'text-lg font-semibold mb-4',
    title: 'Session Log',
    card: {
      layout: 'glass-card rounded-2xl border border-white/5 p-6',
      header: {
        layout: 'flex items-center justify-between mb-4',
        userGroup: 'flex items-center gap-3',
        avatar: 'w-9 h-9 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm flex items-center justify-center font-bold',
        infoGroup: 'flex flex-col',
        userName: 'text-sm font-semibold text-slate-200',
        sessionId: 'text-xs text-slate-500 font-mono',
        interactionsBadge: 'text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-400',
        interactionsSuffix: ' interactions',
      },
      interactionsList: 'space-y-3',
      interaction: {
        layout: 'bg-white/5 rounded-xl p-4',
        promptHeader: 'flex items-center justify-between mb-2',
        promptLabel: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest',
        promptLabelText: 'Prompt',
        timeStyle: 'text-[10px] text-slate-600',
        promptText: 'text-sm text-slate-300',
        responseSection: 'mt-3 pt-3 border-t border-white/5',
        responseLabel: 'text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mb-1',
        responseLabelText: 'Response',
        responseText: 'text-sm text-slate-400',
      },
    },
  },
};
