// ============================================================
// SupportView — UI Variables
// Every string, colour, size and text label lives here.
// Feeds up to: views/ui.config.ts → uiMaster.ts
// ============================================================

import { LifeBuoy, BookOpen, Calendar, FileText, MessageSquare, Star } from 'lucide-react';

export const supportViewUI = {

  // --- Page wrapper ---
  page: {
    motionKey: 'support',
    animation: { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
    layout: 'min-h-full w-full flex flex-col items-center justify-center',
    padding: 'p-4 md:p-6 lg:p-10',
    maxWidth: 'max-w-4xl mx-auto',
  },

  // --- Hero section ---
  hero: {
    layout: 'text-center',
    gap: 'mb-8 md:mb-12',
    iconSize: 'w-10 h-10 md:w-14 lg:w-16 md:h-14 lg:h-16',
    iconColor: '', // Handled by inline styles now
    iconLayout: 'mx-auto mb-3 md:mb-4',
    icon: LifeBuoy,
    title: 'How can we help?',
    titleSize: 'text-2xl md:text-3xl lg:text-4xl',
    titleWeight: 'font-semibold',
    titleGap: 'mb-2 md:mb-4',
    subtitle: "Select an option below to get in touch with our team.",
    subtitleSize: 'text-xs md:text-sm lg:text-base',
    subtitleColor: 'text-slate-400',
  },

  // --- Card grid ---
  grid: {
    layout: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full',
  },

  // --- Shared card styles ---
  card: {
    padding: 'p-5 md:p-6 lg:p-8',
    radius: 'rounded-2xl md:rounded-3xl',
    bgHover: 'hover:bg-white/5',
    transition: 'transition-all',
    layout: 'text-left group',
    iconSize: 'w-6 h-6 md:w-7 lg:w-8 md:h-7 lg:h-8',
    iconColor: '', // Handled by inline styles now
    iconGap: 'mb-3 md:mb-4',
    iconHover: 'group-hover:scale-110 transition-transform',
    titleSize: 'text-lg md:text-xl',
    titleWeight: 'font-medium',
    titleGap: 'mb-1 md:mb-2',
    bodySize: 'text-xs md:text-sm',
    bodyColor: 'text-slate-500',
  },

  // --- Support option cards (all text + icons live here) ---
  options: [
    {
      icon: BookOpen,
      title: 'Resources',
      body: 'Access training materials, brand assets, and documentation.',
      action: 'navigate',
      target: 'resources',
    },
    {
      icon: Calendar,
      title: 'Book a support call',
      body: 'Schedule a 1-on-1 session with our technical experts.',
      action: 'alert',
      alertMessage: 'Booking system coming soon!',
    },
    {
      icon: FileText,
      title: 'Send a support form',
      body: "Submit a detailed ticket and we'll get back to you via email.",
      action: 'alert',
      alertMessage: 'Support form coming soon!',
    },
    {
      icon: MessageSquare,
      title: 'Send some feedback',
      body: 'Tell us what you think about the portal and our services.',
      action: 'navigate',
      target: 'feature-request',
    },
    {
      icon: Star,
      title: 'Leave a review',
      body: 'Share your experience with others on our public platforms.',
      action: 'alert',
      alertMessage: 'Review system coming soon!',
    },
  ],

};
