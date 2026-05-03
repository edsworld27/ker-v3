import { Plus, CheckSquare } from 'lucide-react';

const text = {
  title: 'My Task Center',
  subtitle: 'Founder oversight and strategic priorities.',
  highPriority: 'High Priority',
  mediumPriority: 'Medium Priority',
  lowPriority: 'Low Priority',
  taskDescriptionPrompt: 'Task description:',
  generalCategory: 'General',
};

const priorityStyles = {
  high: 'text-rose-400',
  medium: 'text-amber-400',
  low: 'text-[var(--color-primary)]',
};

const priorityMap: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

const motionProps = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
};

const container = 'h-full w-full p-4 md:p-6 lg:p-10 overflow-y-auto custom-scrollbar';
const wrapper = 'max-w-4xl mx-auto';
const header = 'flex items-center justify-between mb-8 md:mb-12';
const headerTextContainer = 'div';
const title = 'text-2xl md:text-4xl font-bold tracking-tight mb-2';
const subtitle = 'text-sm md:text-base text-slate-400';

const addButton = {
  container: 'w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl text-white flex items-center justify-center transition-all shadow-lg active:scale-95',
  icon: Plus,
  iconClass: 'w-5 h-5 md:w-6 md:h-6',
};

const mainSection = {
  container: 'space-y-6 md:space-y-8',
  priorityGroup: 'space-y-3 md:space-y-4',
  priorityHeader: 'text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] px-2',
  todoList: 'space-y-2 md:space-y-3',
};

const todoItem = {
  container: 'glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-6 group transition-all border border-white/5 hover:border-white/10',
  completed: 'opacity-50',
  button: 'w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0',
  buttonCompleted: '', // Handled by inline styles now
  buttonIncomplete: 'border-white/10',
  checkIcon: CheckSquare,
  checkIconClass: 'w-3 h-3 md:w-4 md:h-4 text-white',
  textContainer: 'flex-1 min-w-0',
  text: 'text-sm md:text-lg font-medium transition-all break-words',
  textCompleted: 'line-through text-slate-500',
  textIncomplete: 'text-slate-100', // Hover handled via css var in component
  categoryContainer: 'flex items-center gap-3 mt-1',
  category: 'text-[8px] md:text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 font-bold uppercase tracking-widest',
};

export const founderTodosUI = {
  text,
  priorityStyles,
  priorityMap,
  motionProps,
  container,
  wrapper,
  header,
  headerTextContainer,
  title,
  subtitle,
  addButton,
  mainSection,
  todoItem,
};
