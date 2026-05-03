import React from 'react';
import { motion } from 'motion/react';
import { XCircle } from 'lucide-react';
import { AppUser } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTaskForm: { title: string; projectId: string; assigneeId: number; priority: 'High' | 'Medium' | 'Low' };
  setNewTaskForm: (task: { title: string; projectId: string; assigneeId: number; priority: 'High' | 'Medium' | 'Low' }) => void;
  projects: { id: string; name: string }[];
  users: AppUser[];
  handleAddTask: () => void;
}

export function TaskModal({
  isOpen,
  onClose,
  newTaskForm,
  setNewTaskForm,
  projects,
  users,
  handleAddTask
}: TaskModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl glass-card rounded-[2.5rem] p-10 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-semibold">Create Operational Task</h3>
            <p className="text-sm text-slate-500">Assign a new action item to the board.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Task Title</label>
            <input 
              type="text" 
              placeholder="e.g. Design Landing Page Hero"
              value={newTaskForm.title}
              onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Project</label>
              <select 
                value={newTaskForm.projectId}
                onChange={(e) => setNewTaskForm({...newTaskForm, projectId: e.target.value})}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 appearance-none"
              >
                {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Priority</label>
              <select 
                value={newTaskForm.priority}
                onChange={(e) => setNewTaskForm({...newTaskForm, priority: e.target.value as 'High' | 'Medium' | 'Low'})}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="High" className="bg-slate-900 text-rose-400">High</option>
                <option value="Medium" className="bg-slate-900 text-amber-400">Medium</option>
                <option value="Low" className="bg-slate-900 text-indigo-400">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Assign To</label>
            <select 
              value={newTaskForm.assigneeId}
              onChange={(e) => setNewTaskForm({...newTaskForm, assigneeId: parseInt(e.target.value)})}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 appearance-none"
            >
              {users.filter(u => u.role.includes('Agency')).map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name}</option>)}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold">Cancel</button>
            <button onClick={handleAddTask} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-white shadow-lg shadow-indigo-600/20">Publish Task</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
