import { Activity } from 'lucide-react';

export const customPageViewUI = {
  notFound: {
    base: 'p-10 max-w-6xl mx-auto w-full text-center',
    titleStyle: 'text-2xl font-semibold mb-2',
    subtitleStyle: 'text-slate-500',
    text: {
      title: 'Page Not Found',
      subtitle: 'The requested page does not exist or you do not have permission to view it.',
    },
  },
  container: {
    base: 'p-6 md:p-10 max-w-6xl mx-auto w-full',
    animation: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
    },
  },
  header: {
    base: 'flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10',
    titleStyle: 'text-2xl md:text-3xl font-semibold mb-2',
    subtitleStyle: 'text-sm md:text-base text-slate-500',
    text: {
      subtitle: 'Custom dashboard view.',
    },
  },
  metricsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10',
  metricWidget: {
    icon: Activity,
    value: '---',
    trend: 'Live',
    color: 'primary' as const,
  },
  widgetGrid: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
  widgetCard: {
    base: 'glass-card p-8 rounded-3xl',
    fullWidth: 'lg:col-span-2',
    titleStyle: 'text-xl font-medium mb-6',
  },
  textWidget: {
    base: 'text-slate-400',
    emptyText: 'No content provided.',
  },
  chartWidget: {
    height: 'h-64',
    gradientId: 'colorValue',
    gradientStartColor: 'var(--color-primary)',
    gradientStartOpacity: 0.3,
    gradientEndOpacity: 0,
    gridStroke: 'rgba(255,255,255,0.1)',
    axisStroke: 'rgba(255,255,255,0.5)',
    axisFontSize: 12,
    tooltipStyle: {
      backgroundColor: '#1e1e2d',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
    },
    tooltipItemStyle: { color: '#fff' },
    lineColor: 'var(--color-primary)',
    lineWidth: 3,
  },
  listWidget: {
    base: 'space-y-3',
    item: 'p-4 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors',
    itemLeft: 'flex items-center gap-3',
    statusDot: 'w-2 h-2 rounded-full',
    statusColors: {
      success: 'bg-emerald-400',
      warning: 'bg-amber-400',
      error: 'bg-red-400',
    },
    itemTitle: 'text-sm font-medium text-white',
    itemTime: 'text-xs text-slate-500',
  },
  dummyChartData: [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ],
  dummyListData: [
    { id: 1, title: 'New User Registration', time: '2 mins ago', status: 'success' },
    { id: 2, title: 'Server CPU Spike', time: '15 mins ago', status: 'warning' },
    { id: 3, title: 'Database Backup Completed', time: '1 hour ago', status: 'success' },
    { id: 4, title: 'Failed Login Attempt', time: '2 hours ago', status: 'error' },
  ],
};
