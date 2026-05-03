import { Sparkles, ChevronRight } from 'lucide-react';

export const agencyLoginViewUI = {
  wrapper: 'flex items-center justify-center w-full min-h-screen relative z-[100] px-6',
  gradient: 'absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]',
  card: {
    base: 'relative w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-white/10',
    animation: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },
  headerContainer: 'flex flex-col items-center mb-8',
  logoContainer: 'w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 bg-[var(--color-primary)] shadow-[var(--color-primary)]/30',
  logoIcon: Sparkles,
  logoIconSize: 'w-8 h-8 text-white',
  text: {
    loginTitle: 'Welcome Back',
    signupTitle: 'Get Started',
    loginSubtitle: 'Sign in to your agency hub',
    signupSubtitle: 'Create your agency account',
    titleStyle: 'text-3xl font-bold tracking-tight',
    subtitleStyle: 'text-slate-500 mt-2',
    loginButtonLabel: 'Sign In',
    signupButtonLabel: 'Sign Up',
    toggleToSignup: "Don't have an account? Sign up",
    toggleToLogin: 'Already have an account? Sign in',
  },
  form: {
    base: 'space-y-4',
    input: 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[var(--color-primary)] transition-all',
  },
  submitButton: {
    base: 'w-full py-3 bg-[var(--color-primary)] hover:brightness-110 rounded-xl font-bold transition-all flex items-center justify-center gap-2',
    icon: ChevronRight,
    iconSize: 'w-4 h-4',
  },
  toggleButton: 'w-full mt-6 text-sm text-slate-400 hover:text-white transition-colors',
};
