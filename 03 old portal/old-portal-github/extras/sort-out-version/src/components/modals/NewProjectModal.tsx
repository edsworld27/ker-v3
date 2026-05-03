import React from 'react';
import { motion } from 'motion/react';
import { XCircle } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  newProjectForm: { name: string; description: string; clientId: string };
  setNewProjectForm: (form: { name: string; description: string; clientId: string }) => void;
  clients: { id: string; name: string }[];
  handleAddProject: () => void;
}

export function NewProjectModal({
  isOpen,
  onClose,
  newProjectForm,
  setNewProjectForm,
  clients,
  handleAddProject
}: NewProjectModalProps) {
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
            <h3 className="text-2xl font-semibold">Initiate New Project</h3>
            <p className="text-sm text-slate-500">Define a new strategic initiative for the agency.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Project Name</label>
            <input 
              type="text" 
              placeholder="e.g. Q4 Website Relaunch"
              value={newProjectForm.name}
              onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Associate Client</label>
            <select 
              value={newProjectForm.clientId}
              onChange={(e) => setNewProjectForm({...newProjectForm, clientId: e.target.value})}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all appearance-none"
            >
              <option value="" className="bg-slate-900">Internal Agency Project</option>
              {clients.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Description</label>
            <textarea 
              placeholder="Briefly outline the project scope..."
              value={newProjectForm.description}
              onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all h-32 resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold">Cancel</button>
            <button onClick={handleAddProject} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-white shadow-lg shadow-indigo-600/20">Create Project</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
