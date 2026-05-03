import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../../context/AppContext';
import { globalTasksModalUI as ui } from './ui';

interface GlobalTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalTasksModal({ isOpen, onClose }: GlobalTasksModalProps) {
  const { todos, setTodos, projectTasks } = useAppContext();
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
      {isOpen && (
        <div className={ui.overlay}>
          <motion.div
            initial={ui.backdrop.motion.initial}
            animate={ui.backdrop.motion.animate}
            exit={ui.backdrop.motion.exit}
            onClick={onClose}
            className={ui.backdrop.className}
          />

          <motion.div
            initial={ui.panel.animation.initial}
            animate={ui.panel.animation.animate}
            exit={ui.panel.animation.exit}
            transition={ui.panel.animation.transition}
            className={ui.panel.base}
          >
            <div className={ui.header.base}>
              <h2 className={ui.header.titleStyle}>{ui.header.title}</h2>
              <button onClick={onClose} className={ui.header.closeButton}>
                <ui.header.closeIcon className={ui.header.closeIconSize} />
              </button>
            </div>

            <div className={ui.tabs.base}>
              <button
                onClick={() => setActiveTab('personal')}
                className={`${ui.tabs.button.base} ${activeTab === 'personal' ? ui.tabs.button.active : ui.tabs.button.inactive}`}
              >
                <ui.tabs.personal.icon className={ui.tabs.iconClass} />
                {ui.tabs.personal.label}
              </button>
              <button
                onClick={() => setActiveTab('project')}
                className={`${ui.tabs.button.base} ${activeTab === 'project' ? ui.tabs.button.active : ui.tabs.button.inactive}`}
              >
                <ui.tabs.project.icon className={ui.tabs.iconClass} />
                {ui.tabs.project.label}
              </button>
            </div>

            <div className={ui.content.base}>
              {activeTab === 'personal' && (
                <div className={ui.content.section}>
                  <div className={ui.content.header}>
                    <h3 className={ui.content.title}>{ui.text.personalTodosTitle}</h3>
                    <button
                      onClick={() => {
                        const text = prompt(ui.text.addTaskPrompt);
                        if (text) setTodos([...todos, { id: Date.now().toString(), text, completed: ui.text.newTodoDefaults.completed, priority: ui.text.newTodoDefaults.priority, category: ui.text.newTodoDefaults.category }]);
                      }}
                      className={ui.content.addButton}
                    >
                      <ui.content.addIcon className={ui.content.addIconSize} />
                    </button>
                  </div>
                  {todos.map((todo, index) => (
                    <div key={todo.id} className={ui.todoItem.base}>
                      <div className={ui.todoItem.moveButtons.base}>
                        <button onClick={() => handleMoveTodo(index, 'up')} disabled={index === 0} className={ui.todoItem.moveButtons.button}>
                          <ui.todoItem.moveButtons.upIcon className={ui.todoItem.moveButtons.iconSize} />
                        </button>
                        <button onClick={() => handleMoveTodo(index, 'down')} disabled={index === todos.length - 1} className={ui.todoItem.moveButtons.button}>
                          <ui.todoItem.moveButtons.downIcon className={ui.todoItem.moveButtons.iconSize} />
                        </button>
                      </div>
                      <button
                        onClick={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t))}
                        className={`${ui.todoItem.checkbox} ${todo.completed ? ui.todoItem.checkboxCompleted : ui.todoItem.checkboxIncomplete}`}
                      >
                        {todo.completed && <ui.todoItem.checkIcon className={ui.todoItem.checkIconSize} />}
                      </button>
                      <div className={ui.todoItem.textContainer}>
                        {editingTodoId === todo.id ? (
                          <div className={ui.todoItem.editContainer}>
                            <input
                              type="text"
                              value={editTodoText}
                              onChange={(e) => setEditTodoText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(todo.id);
                                if (e.key === 'Escape') setEditingTodoId(null);
                              }}
                              autoFocus
                              className={ui.todoItem.editInput}
                            />
                            <button onClick={() => handleSaveEdit(todo.id)} className={ui.todoItem.saveButton}>{ui.text.saveText}</button>
                          </div>
                        ) : (
                          <p className={`${ui.todoItem.text} ${todo.completed ? ui.todoItem.textCompleted : ui.todoItem.textIncomplete}`}>{todo.text}</p>
                        )}
                        <div className={ui.todoItem.tagsContainer}>
                          <span className={`${ui.todoItem.priorityBadge} ${
                            todo.priority === 'High' ? ui.todoItem.priorityHigh :
                            todo.priority === 'Medium' ? ui.todoItem.priorityMedium : ui.todoItem.priorityLow
                          }`}>{todo.priority}</span>
                        </div>
                      </div>
                      <div className={ui.todoItem.actions.base}>
                        <button
                          onClick={() => {
                            setEditingTodoId(todo.id);
                            setEditTodoText(todo.text);
                          }}
                          className={ui.todoItem.actions.button}
                        >
                          <ui.todoItem.actions.editIcon className={ui.todoItem.actions.iconSize} />
                        </button>
                        <button onClick={() => handleDeleteTodo(todo.id)} className={ui.todoItem.actions.button}>
                          <ui.todoItem.actions.deleteIcon className={ui.todoItem.actions.iconSize} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'project' && (
                <div className={ui.content.section}>
                  <div className={ui.content.header}>
                    <h3 className={ui.content.title}>{ui.text.projectTasksTitle}</h3>
                  </div>
                  {projectTasks.map(task => (
                    <div key={task.id} className={ui.projectTaskItem.base}>
                      <div className={ui.projectTaskItem.headerRow}>
                        <p className={ui.projectTaskItem.title}>{task.title}</p>
                        <span className={`${ui.projectTaskItem.statusBadge} ${
                          task.status === 'Done' ? ui.projectTaskItem.statusDone :
                          task.status === 'In Progress' ? ui.projectTaskItem.statusInProgress :
                          ui.projectTaskItem.statusDefault
                        }`}>{task.status}</span>
                      </div>
                      <p className={ui.projectTaskItem.description}>{task.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
