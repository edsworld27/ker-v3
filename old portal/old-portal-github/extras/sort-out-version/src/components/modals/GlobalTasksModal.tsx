import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckSquare, Briefcase, Plus, Trash2, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface GlobalTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalTasksModal({ isOpen, onClose }: GlobalTasksModalProps) {
  const { todos, setTodos, projectTasks, setProjectTasks, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'personal' | 'project'>('personal');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTodoText, setEditTodoText] = useState('');

  if (!isOpen) return null;

  const handleMoveTodo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newTodos = [...todos];
      [newTodos[index - 1], newTodos[index]] = [newTodos[index], newTodos[index - 1]];
      setTodos(newTodos);
    } else if (direction === 'down' && index < todos.length - 1) {
      const newTodos = [...todos];
      [newTodos[index + 1], newTodos[index]] = [newTodos[index], newTodos[index + 1]];
      setTodos(newTodos);
    }
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleSaveEdit = (id: string) => {
    if (editTodoText.trim()) {
      setTodos(todos.map(t => t.id === id ? { ...t, text: editTodoText } : t));
    }
    setEditingTodoId(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 shrink-0">
            <h2 className="text-xl font-semibold text-white">Tasks</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 bg-black/10 shrink-0">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'personal' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              My Todos
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'project' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Project Tasks
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Personal Todos</h3>
                  <button 
                    onClick={() => {
                      const text = prompt('Task description:');
                      if (text) setTodos([...todos, { id: Date.now().toString(), text, completed: false, priority: 'Medium', category: 'General' }]);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {todos.map((todo, index) => (
                  <div key={todo.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group">
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleMoveTodo(index, 'up')} disabled={index === 0} className="p-0.5 hover:bg-white/10 rounded text-slate-400 disabled:opacity-30">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleMoveTodo(index, 'down')} disabled={index === todos.length - 1} className="p-0.5 hover:bg-white/10 rounded text-slate-400 disabled:opacity-30">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t))}
                      className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-indigo-400'}`}
                    >
                      {todo.completed && <CheckSquare className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      {editingTodoId === todo.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTodoText}
                            onChange={(e) => setEditTodoText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(todo.id);
                              if (e.key === 'Escape') setEditingTodoId(null);
                            }}
                            autoFocus
                            className="w-full bg-black/40 border border-indigo-500/50 rounded px-2 py-1 text-sm text-white outline-none"
                          />
                          <button onClick={() => handleSaveEdit(todo.id)} className="text-xs text-indigo-400 font-medium">Save</button>
                        </div>
                      ) : (
                        <p className={`text-sm truncate ${todo.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{todo.text}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${todo.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'}`}>{todo.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingTodoId(todo.id);
                          setEditTodoText(todo.text);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'project' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Project Tasks</h3>
                </div>
                {projectTasks.map(task => (
                  <div key={task.id} className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        task.status === 'Done' ? 'bg-emerald-500/20 text-emerald-400' :
                        task.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{task.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
