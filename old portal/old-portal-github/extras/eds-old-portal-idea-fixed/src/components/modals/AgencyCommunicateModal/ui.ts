import { X, PlusCircle, Users, Settings, MessageCircle } from 'lucide-react';

const channels = ['general', 'design', 'development', 'client-feedback'];

export const agencyCommunicateModalUI = {
  channels,
  overlay: "absolute inset-0 bg-black/60 backdrop-blur-sm",
  container: "fixed inset-0 z-50 flex items-center justify-center p-4",
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    className: "relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden h-[80vh] flex flex-col",
  },
  header: {
    container: "flex items-center justify-between px-8 py-6 border-b border-white/10",
    title: "text-xl font-semibold",
    closeButton: {
      className: "p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors",
      icon: X,
      iconClass: "w-5 h-5",
    },
  },
  body: {
    container: "flex-1 flex overflow-hidden",
  },
  sidebar: {
    container: "w-64 border-r border-white/5 bg-white/[0.02] flex-col shrink-0 hidden md:flex",
    header: {
      container: "p-6 border-b border-white/5 flex items-center justify-between",
      title: "font-semibold",
      icon: PlusCircle,
      iconClass: "w-4 h-4 text-slate-500 cursor-pointer hover:text-white",
    },
    content: "flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar",
    channel: {
      className: "px-4 py-2 rounded-xl text-sm cursor-pointer transition-all",
      active: "bg-indigo-600/20 text-indigo-400 font-medium",
      inactive: "text-slate-500 hover:bg-white/5 hover:text-slate-300",
    },
    dmHeader: "pt-6 pb-2 text-[10px] uppercase tracking-widest font-bold text-slate-600 px-4",
    dm: {
      className: "px-4 py-2 rounded-xl text-sm cursor-pointer text-slate-500 hover:bg-white/5 hover:text-slate-300 flex items-center gap-2",
      status: "w-2 h-2 rounded-full bg-emerald-500",
    },
  },
  chat: {
    container: "flex-1 flex flex-col min-w-0",
    header: {
      container: "p-6 border-b border-white/5 flex items-center justify-between bg-black/20",
      textContainer: "flex items-center gap-3 overflow-hidden",
      title: "font-semibold shrink-0",
      subtitle: "text-xs text-slate-500 truncate hidden sm:inline",
      actions: {
        container: "flex items-center gap-4 text-slate-400",
        icon: "w-4 h-4 cursor-pointer hover:text-white",
        usersIcon: Users,
        settingsIcon: Settings,
      }
    },
    messages: {
      container: "flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar",
      message: {
        container: "flex gap-4 group",
        avatar: "w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold shrink-0 text-base",
        content: "space-y-1 min-w-0",
        header: "flex items-center gap-3",
        name: "font-semibold text-sm truncate",
        timestamp: "text-[10px] text-slate-600 shrink-0",
        text: "text-sm text-slate-300 leading-relaxed font-light break-words",
      }
    },
    input: {
      container: "p-6 border-t border-white/5",
      inputContainer: "relative",
      input: "w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 text-base",
      actions: {
        container: "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-500",
        icon: "w-5 h-5 cursor-pointer hover:text-white",
        addIcon: PlusCircle,
        messageIcon: MessageCircle,
      },
    },
  },
  text: {
    title: "Agency Communication",
    channels: "Channels",
    dm: "Direct Messages",
    generalChannel: "# general",
    generalChannelDesc: "Company-wide announcements and talk",
    inputPlaceholder: "Message #general",
  }
};
