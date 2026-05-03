import React, { useState, useRef, useEffect } from 'react';
import { aiChatbotUI as ui } from './ui';

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: ui.initialMessage }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: ui.mockResponse }]);
    }, ui.mockResponseDelay);
  };

  return (
    <div className={ui.card}>
      <div className={ui.header.base}>
        <div className={ui.header.avatarContainer}>
          <ui.header.avatarIcon className={ui.header.avatarIconSize} />
        </div>
        <h3 className={ui.header.titleStyle}>{ui.header.title}</h3>
      </div>

      <div className={ui.messageList.base}>
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? ui.messageList.userWrapper : ui.messageList.aiWrapper}>
            <div className={msg.role === 'user' ? ui.messageList.userBubble : ui.messageList.aiBubble}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className={ui.inputRow.base}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={ui.inputRow.placeholder}
          className={ui.inputRow.input}
        />
        <button onClick={handleSend} className={ui.inputRow.sendButton}>
          <ui.inputRow.sendIcon className={ui.inputRow.sendIconSize} />
        </button>
      </div>
    </div>
  );
};

export default AIChatbot;
