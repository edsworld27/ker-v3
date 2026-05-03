import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';

export const ProjectChat: React.FC = () => {
  const context = useAppContext();
  const { setAgencyMessages, currentUser } = context;

  // Rule 4: Use design-aware data for historical lists
  const { data: agencyMessages = [] } = useDesignAwareData(context.agencyMessages, 'project-chat-history');
  const { data: users = [] } = useDesignAwareData(context.users, 'project-chat-users');
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agencyMessages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !currentUser) return;
    setAgencyMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        senderId: currentUser.id,
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getSenderName = (id: number) => {
    if (id === currentUser?.id) return 'You';
    return users.find(u => u.id === id)?.name ?? 'Team Member';
  };

  const getAvatar = (id: number) => {
    const u = users.find(u => u.id === id);
    return u?.avatar ?? u?.name?.charAt(0) ?? '?';
  };

  return (
    <section className="glass-card rounded-[var(--radius-card)] border border-[var(--client-widget-border)] flex flex-col h-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--client-widget-border)] shrink-0">
        <h3 className="text-sm font-bold text-[var(--client-widget-text)]">Project Chat</h3>
        <span className="flex items-center gap-1.5 text-[10px] text-[var(--client-widget-success)] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--client-widget-success)] animate-pulse" />
          Live
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" data-design-static="true">
        {agencyMessages.length === 0 && (
          <p className="text-xs text-[var(--client-widget-text-muted)] text-center pt-8">
            No messages yet. Start the conversation!
          </p>
        )}
        {agencyMessages.map(msg => {
          const isSelf = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ backgroundColor: 'color-mix(in srgb, var(--client-widget-primary-color-1) 20%, transparent)', color: 'var(--client-widget-primary-color-1)' }}
              >
                {getAvatar(msg.senderId)}
              </div>
              <div className={`max-w-[70%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <span className="text-[9px] text-[var(--client-widget-text-muted)] font-semibold uppercase tracking-widest">
                  {getSenderName(msg.senderId)}
                </span>
                <div
                  className="px-3 py-2 rounded-2xl text-xs leading-relaxed"
                  style={isSelf
                    ? { backgroundColor: 'var(--client-widget-primary-color-1)', color: 'var(--client-widget-text-on-primary)' }
                    : { backgroundColor: 'var(--client-widget-surface-1-glass)', color: 'var(--client-widget-text)', border: '1px solid var(--client-widget-border)' }}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-[var(--client-widget-text-muted)]">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[var(--client-widget-border)] shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 bg-[var(--client-widget-surface-1-glass)] border border-[var(--client-widget-border)] rounded-[var(--radius-button)] px-3 py-2 text-xs text-[var(--client-widget-text)] placeholder-[var(--client-widget-text-muted)] focus:outline-none focus:border-[var(--client-widget-primary-color-1)] transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-8 h-8 rounded-[var(--radius-button)] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--client-widget-primary-color-1)', color: 'var(--client-widget-text-on-primary)' }}
        >
          <Send size={13} />
        </button>
      </div>
    </section>
  );
};
