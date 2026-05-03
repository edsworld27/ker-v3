// ============================================================
// InboxView — UI Variables
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

export const inboxViewUI = {

  // --- Root layout ---
  root: {
    layout: 'h-full w-full flex',
    bg: 'bg-slate-950',
    textColor: 'text-slate-200',
  },

  // --- Channel sidebar ---
  sidebar: {
    width: 'w-64',
    border: 'border-r border-white/10',
    layout: 'flex flex-col',
    // Header
    header: {
      padding: 'p-4',
      border: 'border-b border-white/10',
      layout: 'flex items-center justify-between',
      title: 'Channels',
      titleWeight: 'font-semibold',
      titleColor: 'text-white',
      addBtn: 'p-1 hover:bg-white/10 rounded',
      addIconSize: 'w-4 h-4',
    },
    // New channel input area
    newChannel: {
      padding: 'p-2',
      input: 'w-full p-2 bg-white/5 rounded text-sm mb-2',
      placeholder: 'New channel name',
      userListSpacing: 'space-y-1 mb-2',
      userBtn: {
        layout: 'w-full flex items-center gap-2',
        padding: 'p-2',
        fontSize: 'text-xs',
        radius: 'rounded',
        activeStyle: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
        inactiveStyle: 'hover:bg-white/5',
        iconSize: 'w-3 h-3',
      },
      createBtn: 'w-full p-2 bg-[var(--color-primary)] rounded text-sm font-medium mb-4',
      createLabel: 'Create Channel',
      },
      // Channel list
      channelList: {
      wrapper: 'flex-1 overflow-y-auto',
      btn: {
        layout: 'w-full flex items-center gap-2',
        padding: 'p-3',
        fontSize: 'text-sm',
        activeStyle: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
        inactiveStyle: 'hover:bg-white/5',
        iconSize: 'w-4 h-4',
      },
      },
      },

      // --- Main message area ---
      main: {
      layout: 'flex-1 flex flex-col',
      // Message area header
      header: {
      padding: 'p-4',
      border: 'border-b border-white/10',
      titleLayout: 'font-semibold text-white flex items-center gap-2',
      iconSize: 'w-5 h-5',
      },
      // Message list
      messages: {
      wrapper: 'flex-1 overflow-y-auto p-4 space-y-4',
      bubble: {
        padding: 'p-3',
        bg: 'bg-white/5',
        radius: 'rounded-lg',
        timestampSize: 'text-xs',
        timestampColor: 'text-slate-500',
        timestampGap: 'mb-1',
      },
      },
      // Input area
      input: {
      wrapper: 'p-4 border-t border-white/10',
      layout: 'flex gap-2',
      field: 'flex-1 p-2 bg-white/5 rounded text-sm',
      sendBtn: 'px-4 py-2 bg-[var(--color-primary)] rounded text-sm font-medium',
      sendLabel: 'Send',
      // Placeholder uses channel name dynamically
      placeholderPrefix: 'Message #',
      },
  },

};
