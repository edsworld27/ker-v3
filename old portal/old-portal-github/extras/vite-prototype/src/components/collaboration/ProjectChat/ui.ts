// ============================================================
// ProjectChat — UI Variables
// Feeds up to: collaboration/ui.config.ts → uiMaster.ts
// ============================================================

export const projectChatUI = {

  // --- Section wrapper ---
  wrapper: {
    padding: 'p-5 md:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    layout: 'flex flex-col',
    height: 'h-[400px] md:h-[500px]',
  },

  // --- Title ---
  title: {
    fontSize: 'text-lg md:text-xl',
    fontWeight: 'font-medium',
    gap: 'mb-5 md:mb-6',
    label: 'Project Chat',
  },

  // --- Messages area ---
  messages: {
    layout: 'flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2',
    gap: 'mb-5 md:mb-6',
  },

  // --- Message bubble: from other ---
  bubbleOther: {
    bg: 'bg-white/5',
    radius: 'rounded-xl md:rounded-2xl',
    padding: 'p-3 md:p-4',
    senderFontSize: 'text-[9px] md:text-[10px]',
    senderFontWeight: 'font-bold',
    senderColor: 'text-[var(--color-primary)]',
    senderGap: 'mb-1',
    senderTransform: 'uppercase',
    senderTracking: 'tracking-widest',
    textSize: 'text-xs md:text-sm',
    // placeholder data
    senderLabel: 'Edward (Admin)',
    messageText: "I've uploaded the latest homepage concept. Let me know what you think about the color palette!",
  },

  // --- Message bubble: from self ---
  bubbleSelf: {
    bg: 'bg-[var(--color-primary)]/20',
    radius: 'rounded-xl md:rounded-2xl',
    padding: 'p-3 md:p-4',
    indent: 'ml-4',
    senderFontSize: 'text-[9px] md:text-[10px]',
    senderFontWeight: 'font-bold',
    senderColor: 'text-white',
    senderGap: 'mb-1',
    senderTransform: 'uppercase',
    senderTracking: 'tracking-widest',
    textSize: 'text-xs md:text-sm',
    // placeholder data
    senderLabel: 'You',
    messageText: 'Looks great! Can we try a slightly darker shade for the header?',
  },

  // --- Input area ---
  inputWrapper: {
    position: 'relative',
  },

  input: {
    width: 'w-full',
    bg: 'bg-white/5',
    border: 'border border-white/10',
    radius: 'rounded-xl',
    paddingY: 'py-2.5 md:py-3',
    paddingLeft: 'pl-4',
    paddingRight: 'pr-12',
    fontSize: 'text-xs md:text-sm',
    outline: 'outline-none',
    focus: 'focus:border-[var(--color-primary)]/50',
    transition: 'transition-colors',
    placeholder: 'Type a message...',
  },

  sendButton: {
    position: 'absolute right-2 top-1/2 -translate-y-1/2',
    padding: 'p-2',
    textColor: 'text-[var(--color-primary)]',
    textColorHover: 'hover:text-[var(--color-primary)]',
    transition: 'transition-colors',
    iconSize: 'w-4 h-4',
  },

};
