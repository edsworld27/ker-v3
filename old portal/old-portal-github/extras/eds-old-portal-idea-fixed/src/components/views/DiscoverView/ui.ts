import { Globe, ArrowLeft } from 'lucide-react';

export const discoverViewUI = {
  motion: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  container: "h-full flex flex-col items-center justify-center p-10",
  icon: Globe,
  iconClass: "w-16 h-16 text-[var(--color-primary)] mb-6",
  title: "text-4xl font-light tracking-widest text-white uppercase mb-4",
  subtitle: "text-slate-500 mb-8",
  backButton: {
    className: "flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors",
    icon: ArrowLeft,
    iconClass: "w-4 h-4",
    text: "Back to Company Hub",
  },
  text: {
    title: "Discover My Company",
    subtitle: "Internal insights and structure.",
  },
};
