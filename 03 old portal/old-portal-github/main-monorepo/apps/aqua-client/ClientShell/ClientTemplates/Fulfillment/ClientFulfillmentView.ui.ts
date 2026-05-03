export const FulfillmentViewUI = {
  layout: "flex flex-col h-full w-full overflow-hidden bg-[var(--client-widget-bg-color-1)] animate-in fade-in duration-500",
  content: "flex-1 overflow-auto custom-scrollbar p-6",
  container: "max-w-[1900px] mx-auto w-full space-y-6",
  header: {
    wrapper: "flex items-center justify-between mb-6",
    title: "text-2xl font-black text-[var(--client-widget-text)] tracking-tight",
    subtitle: "text-sm text-[var(--client-widget-text-muted)] mt-1",
  },
  card: {
    base: "rounded-2xl border border-white/5 bg-[var(--client-widget-surface-1-glass)] p-6",
    hover: "hover:border-[var(--client-widget-primary-color-1)]/30 transition-all duration-300",
  },
  empty: "text-center py-16 text-[var(--client-widget-text-muted)] italic text-sm",
};
