import React from 'react';
import { MessageSquare, User } from 'lucide-react';
import { useAppContext } from '@CRMShell/bridge/CRMAppContext';

interface Props { onClose?: () => void; }

export function InboxModal({ onClose }: Props) {
  const { agencyMessages, currentUser } = useAppContext();
  const messages = [...(agencyMessages || [])].reverse();

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--people-widget-primary-color-1)]" />
          <h2 className="text-lg font-semibold text-white">Inbox</h2>
          {messages.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--people-widget-primary-color-1)]/20 text-[var(--people-widget-primary-color-1)] rounded-full">
              {messages.length}
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs uppercase tracking-widest">
            Close
          </button>
        )}
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-white/5">
        {messages.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
            Your inbox is empty.
          </div>
        )}
        {messages.map((msg: any, i: number) => (
          <div key={msg.id || i} className="flex items-start gap-3 px-6 py-4 hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[var(--people-widget-primary-color-1)]/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[var(--people-widget-primary-color-1)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">{msg.senderName || msg.from || 'Unknown'}</p>
                <p className="text-[10px] text-slate-600 shrink-0">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</p>
              </div>
              {msg.subject && <p className="text-xs text-slate-300 mt-0.5 font-medium">{msg.subject}</p>}
              <p className="text-xs text-slate-400 mt-0.5 truncate">{msg.content || msg.message || msg.text || ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
