import { Send, Bot } from 'lucide-react';

export const aiChatbotUI = {
  card: 'glass-card p-6 rounded-3xl flex flex-col h-[500px]',
  header: {
    base: 'flex items-center gap-3 mb-6',
    avatarContainer: 'w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]',
    avatarIcon: Bot,
    avatarIconSize: 'w-6 h-6',
    titleStyle: 'text-lg font-medium',
    title: 'Aqua AI Assistant',
  },
  messageList: {
    base: 'flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar',
    userWrapper: 'flex justify-end',
    aiWrapper: 'flex justify-start',
    userBubble: 'max-w-[80%] p-3 rounded-2xl text-sm bg-[var(--color-primary)] text-white',
    aiBubble: 'max-w-[80%] p-3 rounded-2xl text-sm bg-white/5 text-slate-200',
  },
  inputRow: {
    base: 'flex gap-2',
    input: 'flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-primary)]/50',
    placeholder: 'Ask me anything...',
    sendButton: 'p-3 bg-[var(--color-primary)] rounded-xl hover:brightness-110 transition-all',
    sendIcon: Send,
    sendIconSize: 'w-4 h-4',
  },
  initialMessage: "Hello! I'm your Aqua AI assistant. How can I help you with your onboarding today?",
  mockResponse: "I'm here to help! What specifically do you need assistance with regarding your onboarding?",
  mockResponseDelay: 1000,
};
