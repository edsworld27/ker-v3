import React from 'react';
import { motion } from 'motion/react';
import { XCircle } from 'lucide-react';
import { AppTicket, AppUser, LogEntry } from '../../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTicket: { title: string; priority: 'High' | 'Medium' | 'Low'; type: 'internal' | 'client' };
  setNewTicket: (ticket: { title: string; priority: 'High' | 'Medium' | 'Low'; type: 'internal' | 'client' }) => void;
  userProfile: { name: string; email: string };
  currentUser: AppUser | null;
  tickets: AppTicket[];
  setTickets: (tickets: AppTicket[]) => void;
  addLog: (action: string, details: string, type: LogEntry['type']) => void;
}

export function TicketModal({
  isOpen,
  onClose,
  newTicket,
  setNewTicket,
  userProfile,
  currentUser,
  tickets,
  setTickets,
  addLog
}: TicketModalProps) {
  if (!isOpen) return null;

  const handleCreateTicket = () => {
    if (!newTicket.title) return;
    setTickets([...tickets, {
      id: `TIC-00${tickets.length + 1}`,
      title: newTicket.title,
      status: 'Open',
      priority: newTicket.priority,
      creator: userProfile.name,
      creatorId: currentUser?.id || 'guest',
      createdAt: new Date().toISOString(),
      type: newTicket.type
    }]);
    onClose();
    setNewTicket({ title: '', priority: 'Medium', type: 'internal' });
    addLog('Ticket Created', `New ${newTicket.type} ticket: ${newTicket.title}`, 'action');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-lg p-10 rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-semibold mb-1">Create Support Ticket</h3>
            <p className="text-slate-400 text-sm italic">New ticket as {userProfile.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Subject / Title</label>
            <input 
              type="text"
              value={newTicket.title}
              onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
              placeholder="Briefly describe the issue..."
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Priority</label>
              <select 
                value={newTicket.priority}
                onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as 'High' | 'Medium' | 'Low'})}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white cursor-pointer"
              >
                <option value="High" className="bg-slate-900">High Priority</option>
                <option value="Medium" className="bg-slate-900">Medium Priority</option>
                <option value="Low" className="bg-slate-900">Low Priority</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Category</label>
              <select 
                value={newTicket.type}
                onChange={(e) => setNewTicket({...newTicket, type: e.target.value as 'internal' | 'client'})}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all text-white cursor-pointer"
              >
                <option value="internal" className="bg-slate-900">Internal Task</option>
                <option value="client" className="bg-slate-900">Client Support</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-slate-400"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateTicket}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              Create Ticket
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
