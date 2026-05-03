/**
 * @aqua/bridge/ui/AIChatPanel — slide-over chat panel powered by Claude.
 *
 * Posts to `/api/ai/chat` on the host shell and streams the response via SSE.
 * Self-contained: kit primitives only, no lucide-react dependency in the
 * Bridge package (inline SVG icons).
 *
 * Open from anywhere by dispatching the `aqua:open-chat` CustomEvent on
 * `window`. The host's `HostBridgeHub` already listens for `aqua:open-modal`
 * style events; this component is mounted globally and toggles its own
 * visibility on the dedicated event.
 *
 * Optional `systemContext` prop is surfaced to Claude as a "Live UI context"
 * block on every request so callers can pass the active view, agency, etc.
 */
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Textarea, Card, Avatar } from './kit';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  systemContext?: string;
  defaultOpen?: boolean;
}

const SparkIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const renderMarkdown = (text: string): React.ReactNode => {
  // Tiny markdown renderer — handles paragraphs, code blocks, inline code, bold, lists.
  const parts: React.ReactNode[] = [];
  const blocks = text.split(/\n{2,}/);
  blocks.forEach((block, blockIdx) => {
    if (block.startsWith('```')) {
      const fenceMatch = block.match(/^```(\w*)\n?([\s\S]*?)```$/);
      const code = fenceMatch ? fenceMatch[2] : block.replace(/^```|```$/g, '');
      parts.push(
        <pre
          key={`b${blockIdx}`}
          className="my-2 bg-black/40 border border-white/5 rounded-md px-3 py-2 text-[12px] font-mono text-slate-200 overflow-x-auto"
        >
          {code}
        </pre>,
      );
      return;
    }
    if (/^[-*]\s/.test(block.split('\n')[0] ?? '')) {
      const items = block.split('\n').filter(l => /^[-*]\s/.test(l)).map(l => l.replace(/^[-*]\s/, ''));
      parts.push(
        <ul key={`b${blockIdx}`} className="my-2 list-disc pl-5 space-y-1">
          {items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      return;
    }
    parts.push(
      <p key={`b${blockIdx}`} className="my-2 leading-relaxed first:mt-0 last:mb-0">
        {renderInline(block)}
      </p>,
    );
  });
  return parts;
};

const renderInline = (text: string): React.ReactNode => {
  // Handle `code` and **bold** in a simple pass.
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('`') && tok.endsWith('`')) {
      return (
        <code key={i} className="px-1 py-0.5 bg-white/[0.06] border border-white/10 rounded text-[12px] font-mono">
          {tok.slice(1, -1)}
        </code>
      );
    }
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{tok.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });
};

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ systemContext, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Open via global event so any view can request the chat.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    window.addEventListener('aqua:open-chat', onOpen);
    window.addEventListener('aqua:close-chat', onClose);
    return () => {
      window.removeEventListener('aqua:open-chat', onOpen);
      window.removeEventListener('aqua:close-chat', onClose);
    };
  }, []);

  // Esc closes the panel (when open).
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    return undefined;
  }, [open]);

  // Auto-scroll on new content.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cancel any inflight request when the panel closes.
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setStreaming(false);
    }
  }, [open]);

  const send = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || streaming) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      const assistantId = `a-${Date.now() + 1}`;
      const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' };
      const next = [...messages, userMsg, assistantMsg];
      setMessages(next);
      setInput('');
      setError(null);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: next
              .filter(m => m.id !== assistantId)
              .map(({ role, content }) => ({ role, content })),
            systemContext,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => 'Request failed');
          throw new Error(text || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';
          for (const evt of events) {
            const line = evt.split('\n').find(l => l.startsWith('data: '));
            if (!line) continue;
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.type === 'text' && typeof payload.delta === 'string') {
                setMessages(prev =>
                  prev.map(m => (m.id === assistantId ? { ...m, content: m.content + payload.delta } : m)),
                );
              } else if (payload.type === 'error') {
                throw new Error(payload.message ?? 'Streaming error');
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== 'Streaming error') {
                console.error('[AIChatPanel] parse error', parseErr);
              } else {
                throw parseErr;
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setMessages(prev =>
          prev.map(m => (m.id === assistantId && m.content === '' ? { ...m, content: `_Error: ${message}_` } : m)),
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, systemContext],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const onClear = () => {
    if (streaming) abortRef.current?.abort();
    setMessages([]);
    setError(null);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch justify-end bg-black/50 backdrop-blur-sm"
      onClick={() => !streaming && setOpen(false)}
    >
      <aside
        onClick={e => e.stopPropagation()}
        className="w-full sm:w-[440px] h-full bg-[#0e0e10] border-l border-white/10 flex flex-col shadow-2xl"
        style={{ animation: 'aqua-chat-slide-in 200ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <header className="flex items-center justify-between px-5 h-14 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300">
              <SparkIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-tight">Aqua AI</div>
              <div className="text-[11px] text-slate-500">Powered by Claude</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 ? (
              <Button variant="ghost" size="sm" icon={RefreshIcon} onClick={onClear} aria-label="Reset chat" />
            ) : null}
            <Button variant="ghost" size="sm" icon={CloseIcon} onClick={() => setOpen(false)} aria-label="Close" />
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <Empty onPick={text => void send(text)} />
          ) : (
            <ul className="space-y-4">
              {messages.map(m => (
                <li key={m.id}>
                  <MessageBubble message={m} />
                </li>
              ))}
              {streaming ? (
                <li className="text-[11px] text-slate-500 inline-flex items-center gap-2 pl-11">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span>Aqua is thinking…</span>
                </li>
              ) : null}
            </ul>
          )}
        </div>

        {error ? (
          <div className="px-5 pt-2 -mb-1">
            <Card padding="sm" className="border-rose-500/25 bg-rose-500/[0.06]">
              <p className="text-xs text-rose-300">{error}</p>
            </Card>
          </div>
        ) : null}

        <footer className="border-t border-white/5 px-3 py-3 shrink-0">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask Aqua AI…"
              rows={1}
              className="resize-none max-h-32"
            />
            <Button
              variant="primary"
              size="md"
              icon={SendIcon}
              onClick={() => void send(input)}
              disabled={streaming || input.trim().length === 0}
              aria-label="Send"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 px-1">
            Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px]">Shift+Enter</kbd> for newline
          </p>
        </footer>

        <style>{`
          @keyframes aqua-chat-slide-in {
            from { transform: translateX(40px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>
      </aside>
    </div>
  );
};

const SUGGESTIONS = [
  'Summarize my open deals over $50k',
  'Draft a follow-up email for a stalled proposal',
  'What KPIs should I track for the new ad campaign?',
  'Walk me through the marketplace install flow',
];

const Empty: React.FC<{ onPick: (text: string) => void }> = ({ onPick }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-2">
    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 mb-3">
      <SparkIcon className="w-5 h-5" />
    </div>
    <h3 className="text-base font-semibold text-white mb-1">How can I help?</h3>
    <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-5">
      Ask anything about your portal — the CRM pipeline, marketing analytics,
      client portal flows, or just brainstorm.
    </p>
    <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
      {SUGGESTIONS.map(s => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="text-left px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-colors text-xs text-slate-300"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
);

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? (
        <Avatar name="You" size="sm" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 shrink-0">
          <SparkIcon className="w-3.5 h-3.5" />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
          isUser
            ? 'bg-indigo-500/15 border border-indigo-500/25 text-white rounded-tr-sm'
            : 'bg-white/[0.04] border border-white/5 text-slate-200 rounded-tl-sm'
        }`}
      >
        {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : renderMarkdown(message.content || '…')}
      </div>
    </div>
  );
};

export default AIChatPanel;
