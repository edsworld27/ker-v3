import { Lightbulb, Send, CheckCircle } from 'lucide-react';

export const featureRequestViewUI = {
  motion: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  container: "h-full w-full p-4 md:p-6 lg:p-10 flex flex-col items-center justify-center max-w-2xl mx-auto",
  form: {
    motion: {
      key: "form",
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    container: "w-full flex flex-col items-center",
    headerIconContainer: "w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-[var(--color-primary)]/20 flex items-center justify-center mb-6 md:mb-8",
    headerIcon: Lightbulb,
    headerIconClass: "w-7 h-7 md:w-10 md:h-10 text-[var(--color-primary)]",
    title: "text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-center tracking-tight",
    subtitle: "text-xs md:text-base text-slate-400 text-center mb-8 md:mb-10 max-w-md",
    fieldsContainer: "w-full space-y-4 md:space-y-6",
    field: {
      container: "space-y-2",
      label: "text-[10px] md:text-[11px] uppercase tracking-widest font-semibold text-slate-500 ml-1",
      titleInput: "w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-[var(--color-primary)] transition-colors",
      descriptionInput: "w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-[var(--color-primary)] transition-colors h-32 resize-none",
    },
    submitButton: {
      className: "w-full py-3 md:py-4 bg-[var(--color-primary)] hover:brightness-110 text-white font-semibold rounded-xl md:rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group text-sm md:text-base",
      icon: Send,
      iconClass: "w-4 h-4",
      text: "Submit Idea",
    },
  },
  success: {
    motion: {
      key: "success",
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    container: "text-center",
    iconContainer: "w-16 h-16 md:w-24 md:h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 md:mb-8 mx-auto border-2 border-emerald-500/50",
    icon: CheckCircle,
    iconClass: "w-8 h-8 md:w-12 md:h-12 text-emerald-400",
    title: "text-2xl md:text-4xl font-bold text-emerald-400 mb-3 md:mb-4",
    subtitle: "text-sm md:text-base text-slate-400 mb-8 md:mb-10 max-w-md",
    backButton: {
      className: "px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors",
      text: "Back to Dashboard",
    },
  },
  text: {
    title: "Submit a Feature",
    subtitle: "Help us shape the future of the portal. Share your ideas and suggestions with our product team.",
    featureTitleLabel: "Feature Title",
    featureTitlePlaceholder: "e.g., 'Add dark mode toggle'",
    descriptionLabel: "Detailed Description",
    descriptionPlaceholder: "Describe the feature and why it would be helpful...",
    successTitle: "Thank You!",
    successSubtitle: "Your feature request has been submitted. Our team will review it shortly.",
  },
};
