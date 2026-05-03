import React from 'react';
import { motion } from 'motion/react';
import { founderTodosUI as ui } from './ui';
import { useTheme } from '../../../hooks/useTheme';
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { Todo } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

interface FounderTodosViewProps {
  todos?: Todo[];
  setTodos?: React.Dispatch<React.SetStateAction<Todo[]>>;
}

export const FounderTodosView: React.FC<FounderTodosViewProps> = (props) => {
  const { todos: contextTodos, setTodos: contextSetTodos } = useAppContext();
  const todos = props.todos || contextTodos;
  const setTodos = props.setTodos || contextSetTodos;

  const theme = useTheme();
  const { label } = useRoleConfig();

  const handleAddTodo = () => {
    const text = prompt(ui.text.taskDescriptionPrompt);
    if (text) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        priority: 'Medium',
        category: ui.text.generalCategory,
      };
      setTodos(prev => [newTodo, ...prev]);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <motion.div
      initial={ui.motionProps.initial}
      animate={ui.motionProps.animate}
      className={ui.container}
    >
      <div className={ui.wrapper}>
        <header className={ui.header}>
          <div className={ui.headerTextContainer}>
            <h1 className={ui.title}>{label('tasks') || ui.text.title}</h1>
            <p className={ui.subtitle}>{ui.text.subtitle}</p>
          </div>
          <button onClick={handleAddTodo} className={ui.addButton.container} style={theme.primaryBgStyle}>
            <ui.addButton.icon className={ui.addButton.iconClass} />
          </button>
        </header>

        <main className={ui.mainSection.container}>
          {ui.priorityMap.map(priority => (
            <div key={priority} className={ui.mainSection.priorityGroup}>
              <h2 className={`${ui.mainSection.priorityHeader} ${ui.priorityStyles[priority.toLowerCase() as keyof typeof ui.priorityStyles]}`}>
                {ui.text[`${priority.toLowerCase()}Priority` as keyof typeof ui.text]}
              </h2>
              <div className={ui.mainSection.todoList}>
                {todos.filter(t => t.priority === priority).map(todo => (
                  <div key={todo.id} className={`${ui.todoItem.container} ${todo.completed ? ui.todoItem.completed : ''}`}>
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`${ui.todoItem.button} ${todo.completed ? '' : ui.todoItem.buttonIncomplete}`}
                      style={todo.completed ? { ...theme.primaryBgStyle, borderColor: theme.primary } : {}}
                    >
                      {todo.completed && <ui.todoItem.checkIcon className={ui.todoItem.checkIconClass} />}
                    </button>
                    <div className={ui.todoItem.textContainer}>
                      <p className={`${ui.todoItem.text} ${todo.completed ? ui.todoItem.textCompleted : ui.todoItem.textIncomplete}`}>{todo.text}</p>
                      <div className={ui.todoItem.categoryContainer}>
                        <span className={ui.todoItem.category}>{todo.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </motion.div>
  );
};