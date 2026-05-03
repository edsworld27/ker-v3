import { X, Bell, Clock, ArrowRight } from 'lucide-react';

export const inboxModalUI = {
  overlay: 'fixed inset-0 z-50 flex justify-end',
  backdrop: {
    motion: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    className: 'absolute inset-0 bg-black/60 backdrop-blur-sm',
  },
  panel: {
    animation: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
      transition: { type: 'spring' as const, damping: 25, stiffness: 200 },
    },
    base: 'relative w-full sm:max-w-md h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col',
  },
  header: {
    base: 'flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/20 shrink-0',
    title: 'text-lg sm:text-xl font-semibold text-white',
    closeButton: 'p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors',
    closeIcon: X,
    closeIconSize: 'w-5 h-5',
  },
  tabs: {
    base: 'flex border-b border-white/10 bg-black/10 shrink-0',
    iconClass: 'w-4 h-4',
    button: {
      base: 'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2',
      active: 'border-indigo-500 text-indigo-400',
      inactive: 'border-transparent text-slate-400 hover:text-white hover:bg-white/5',
    },
    notifications: { icon: Bell, label: 'Notifications' },
    updates: { icon: Clock, label: 'Updates' },
  },
  content: {
    base: 'flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6',
    emptyState: {
      container: 'flex flex-col items-center justify-center h-full text-center space-y-3 sm:space-y-4 opacity-50',
      icon: Bell,
      iconClass: 'w-10 h-10 sm:w-12 sm:h-12 text-slate-400',
      title: 'text-base sm:text-lg font-medium text-white',
      subtitle: 'text-xs sm:text-sm text-slate-400',
    },
    updatesContainer: 'space-y-4 sm:space-y-6',
    updateCard: {
      base: 'p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 group hover:border-indigo-500/50 transition-colors',
      header: 'flex justify-between items-start mb-1.5 sm:mb-2',
      title: 'text-sm sm:text-base font-medium text-white',
      badge: 'text-[9px] sm:text-[10px] px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest shrink-0',
      description: 'text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4',
      readMoreButton: 'text-[10px] sm:text-xs text-indigo-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all',
      readMoreIcon: ArrowRight,
      readMoreIconClass: 'w-3 h-3',
    },
  },
  text: {
    title: 'Inbox',
    noNotifications: 'No new notifications',
    allCaughtUp: "You're all caught up!",
    readMore: 'Read More',
  },
  updates: [
    { title: 'AI Integration', date: 'Q2 2026', desc: 'Advanced AI capabilities for the website editor.' },
    { title: 'Mobile App', date: 'Q3 2026', desc: 'Native iOS and Android portal apps.' },
    { title: 'Advanced Analytics', date: 'Q4 2026', desc: 'Deep dive into your user behavior and metrics.' },
  ],
};
