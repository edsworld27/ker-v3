export const webStudioUI = {
  colors: {
    sidebarBg: 'bg-white',
    contentBg: 'bg-[#f4f7f9]',
    cardBg: 'bg-white',
    accent: '#0066ff',
    textPrimary: 'text-[#1a1a1b]',
    textSecondary: 'text-[#606770]',
    border: 'border-[#e4e7eb]',
    success: 'text-[#10b981]',
    danger: 'text-[#ef4444]',
    warning: 'text-[#f59e0b]'
  },
  typography: {
    brand: 'font-bold text-2xl tracking-tight',
    header: 'font-semibold text-3xl text-[#1a1a1b]',
    subHeader: 'text-sm text-[#606770] font-medium',
    navLabel: 'text-[11px] font-bold uppercase tracking-widest text-[#8a94a6] mb-3 px-4',
    navItem: 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200',
    navActive: 'bg-black text-white shadow-lg',
    navInactive: 'text-[#606770] hover:bg-[#f4f7f9] hover:text-[#1a1a1b]'
  },
  cards: {
    default: 'bg-white rounded-2xl border border-[#e4e7eb] shadow-sm',
    hover: 'hover:shadow-md hover:border-[#d1d5db] transition-all duration-300',
    padding: 'p-8'
  },
  tables: {
    header: 'text-[11px] font-bold uppercase tracking-widest text-[#8a94a6] border-b border-[#e4e7eb] px-6 py-4',
    row: 'border-b border-[#f0f2f5] last:border-0 hover:bg-[#f9fafb] transition-colors',
    cell: 'px-6 py-5 text-[14px] font-medium text-[#1a1a1b]'
  },
  badges: {
    published: 'bg-[#ecfdf5] text-[#10b981] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
    draft: 'bg-[#fffbeb] text-[#f59e0b] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
    archived: 'bg-[#f3f4f6] text-[#6b7280] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest'
  }
};
