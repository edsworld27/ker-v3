/**
 * Clientui — global UI token barrel
 * Provides shared UI token objects used by template components.
 */

import type { ComponentType } from 'react';
import { ListChecks, Paperclip, Calendar } from 'lucide-react';

type TaskStatus = 'Backlog' | 'In Progress' | 'Review' | 'Done';
type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

interface TaskBoardViewUI {
  board: {
    layout: string;
    column: {
      layout: string;
      header: {
        layout: string;
        titleGroup: string;
        indicator: string;
        colors: Record<TaskStatus, string>;
        title: string;
        countBadge: string;
      };
      list: string;
    };
  };
  taskCard: {
    base: string;
    header: {
      layout: string;
      priorityBadge: { base: string } & Record<TaskPriority, string>;
      assigneeGroup: string;
      assigneeAvatar: string;
    };
    title: string;
    footer: {
      layout: string;
      itemGroup: string;
      iconSize: string;
      stepsIcon: ComponentType<{ className?: string }>;
      attachmentsIcon: ComponentType<{ className?: string }>;
      dateGroup: string;
      dateIcon: ComponentType<{ className?: string }>;
    };
  };
}

export const taskBoardViewUI: TaskBoardViewUI = {
  board: {
    layout: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4',
    column: {
      layout: 'flex flex-col bg-white/5 rounded-xl p-3 min-h-[24rem]',
      header: {
        layout: 'flex items-center justify-between mb-3',
        titleGroup: 'flex items-center gap-2',
        indicator: 'w-2 h-2 rounded-full',
        colors: {
          'Backlog':     'bg-slate-400',
          'In Progress': 'bg-amber-400',
          'Review':      'bg-indigo-400',
          'Done':        'bg-emerald-400',
        },
        title: 'text-xs font-bold text-white/70 uppercase tracking-wider',
        countBadge: 'text-[10px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full',
      },
      list: 'flex flex-col gap-2 flex-1',
    },
  },
  taskCard: {
    base: 'bg-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/15 transition-colors border border-white/5',
    header: {
      layout: 'flex items-center justify-between mb-2',
      priorityBadge: {
        base: 'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
        'Low':    'bg-slate-500/20 text-slate-300',
        'Medium': 'bg-sky-500/20 text-sky-300',
        'High':   'bg-amber-500/20 text-amber-300',
        'Urgent': 'bg-red-500/20 text-red-300',
      },
      assigneeGroup: 'flex items-center gap-1',
      assigneeAvatar: 'w-5 h-5 rounded-full bg-indigo-500/40 text-[10px] font-bold text-white flex items-center justify-center',
    },
    title: 'text-sm font-medium text-white mb-2 leading-snug',
    footer: {
      layout: 'flex items-center gap-3 text-xs text-white/40',
      itemGroup: 'flex items-center gap-1',
      iconSize: 'w-3 h-3',
      stepsIcon: ListChecks,
      attachmentsIcon: Paperclip,
      dateGroup: 'flex items-center gap-1 ml-auto',
      dateIcon: Calendar,
    },
  },
};

export const taskListViewUI = {
  container: 'flex flex-col gap-2 p-4',
  row: 'flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10',
  checkbox: 'w-4 h-4 rounded border border-white/20',
  title: 'text-sm text-white flex-1',
  meta: 'text-xs text-white/40',
};

export const projectListViewUI = {
  container: 'flex flex-col gap-3 p-4',
  card: 'bg-white/5 rounded-xl p-4 hover:bg-white/10 cursor-pointer',
  title: 'text-sm font-semibold text-white',
  subtitle: 'text-xs text-white/50 mt-1',
  progress: 'mt-2 h-1 bg-white/10 rounded-full overflow-hidden',
  progressBar: 'h-full bg-indigo-500 rounded-full',
};
