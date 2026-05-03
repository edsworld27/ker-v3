import React from 'react';
import { motion } from 'motion/react';
import { XCircle, Calendar, CheckCircle2, BookOpen, ExternalLink, Download } from 'lucide-react';
import { AppUser } from '../../types';

interface TaskDetailModalProps {
  selectedTask: any; // Using any for now, ideally should use a specific Task type
  setSelectedTask: (task: any | null) => void;
  users: AppUser[];
  projectTasks: any[];
  setProjectTasks: (tasks: any[]) => void;
}

export function TaskDetailModal({
  selectedTask,
  setSelectedTask,
  users,
  projectTasks,
  setProjectTasks
}: TaskDetailModalProps) {
  if (!selectedTask) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedTask(null)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div 
        layoutId={selectedTask.id}
        className="relative w-full max-w-2xl glass-card rounded-[2.5rem] p-10 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              selectedTask.status === 'Backlog' ? 'bg-slate-500' :
              selectedTask.status === 'In Progress' ? 'bg-indigo-500' :
              selectedTask.status === 'Review' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedTask.status}</span>
          </div>
          <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-4">{selectedTask.title}</h2>
        <p className="text-slate-400 mb-10 leading-relaxed">{selectedTask.description}</p>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="space-y-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignee</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                {users.find(u => u.id === selectedTask.assigneeId)?.avatar}
              </div>
              <div>
                <div className="font-semibold">{users.find(u => u.id === selectedTask.assigneeId)?.name}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">{users.find(u => u.id === selectedTask.assigneeId)?.role}</div>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timeline</div>
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span className="font-medium">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'No Due Date'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sub-tasks</h3>
            <span className="text-xs text-slate-500 font-bold">{selectedTask.steps.filter((s: any) => s.completed).length}/{selectedTask.steps.length} Complete</span>
          </div>
          <div className="space-y-3">
            {selectedTask.steps.map((step: any) => (
              <button
                key={step.id}
                onClick={() => {
                  const updatedTasks = projectTasks.map(t => {
                    if (t.id === selectedTask.id) {
                      return {
                        ...t,
                        steps: t.steps.map((s: any) => s.id === step.id ? { ...s, completed: !s.completed } : s)
                      };
                    }
                    return t;
                  });
                  setProjectTasks(updatedTasks);
                  setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id) || null);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  step.completed ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                  step.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/10'
                }`}>
                  {step.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className={`text-sm font-medium ${step.completed ? 'line-through opacity-50' : ''}`}>{step.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Attachments</h3>
          <div className="grid grid-cols-2 gap-4">
            {selectedTask.attachments.map((att: any) => (
              <a
                key={att.id}
                href={att.url}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <div className={`p-2 rounded-lg ${
                  att.type === 'sop' ? 'bg-indigo-500/20 text-indigo-400' :
                  att.type === 'link' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {att.type === 'sop' ? <BookOpen className="w-4 h-4" /> :
                   att.type === 'link' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-semibold truncate">{att.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{att.type}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
