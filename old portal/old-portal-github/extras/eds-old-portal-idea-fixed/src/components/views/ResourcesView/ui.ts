import { ArrowLeft, ChevronRight, BookOpen, Users, Shield, Zap, Globe, Play } from 'lucide-react';

export const resourcesViewUI = {
  motion: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  container: "h-full w-full p-6 md:p-10 overflow-y-auto custom-scrollbar",
  header: {
    container: "flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10",
    textContainer: "div",
    title: "text-2xl md:text-3xl font-semibold mb-2",
    subtitle: "text-sm md:text-base text-slate-500",
    backButton: {
      className: "flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm self-start md:self-auto",
      icon: ArrowLeft,
      iconClass: "w-4 h-4",
      text: "Back to Help",
    },
  },
  grid: {
    container: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    card: {
      container: "glass-card p-6 rounded-3xl hover:bg-white/5 transition-all group cursor-pointer border border-white/5",
      iconContainer: "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
      iconClass: "w-6 h-6",
      category: "text-[10px] uppercase tracking-widest font-bold mb-1",
      title: "text-lg font-medium mb-2",
      description: "text-xs text-slate-500 leading-relaxed mb-4",
      link: {
        className: "flex items-center gap-2 text-xs font-medium group-hover:translate-x-1 transition-transform",
        text: "View Resource",
        icon: ChevronRight,
        iconClass: "w-3 h-3",
      },
    },
  },
  text: {
    title: "Resources",
    subtitle: "Training materials, documentation, and helpful guides.",
  },
  resources: [
    { title: 'Getting Started Guide', category: 'Basics', icon: BookOpen, description: 'Learn the fundamentals of navigating and using the portal.' },
    { title: 'CRM Best Practices', category: 'Training', icon: Users, description: 'Optimize your workflow with our recommended CRM strategies.' },
    { title: 'Security Protocols', category: 'Compliance', icon: Shield, description: 'Understand how we protect your data and privacy.' },
    { title: 'API Documentation', category: 'Technical', icon: Zap, description: 'Detailed technical guides for integrating with our systems.' },
    { title: 'Brand Guidelines', category: 'Marketing', icon: Globe, description: 'Assets and rules for using our company branding.' },
    { title: 'Video Tutorials', category: 'Multimedia', icon: Play, description: 'Step-by-step video walkthroughs of key features.' }
  ],
};
