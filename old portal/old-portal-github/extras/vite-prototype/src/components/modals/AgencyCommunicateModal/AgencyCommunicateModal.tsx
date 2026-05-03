import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { agencyCommunicateModalUI as ui } from './ui';
import { useAppContext } from '../../../context/AppContext';

interface AgencyCommunicateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgencyCommunicateModal({ isOpen, onClose }: AgencyCommunicateModalProps) {
  const { users, currentUser, agencyMessages, setAgencyMessages } = useAppContext();

  if (!isOpen) return null;

  const handleSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      setAgencyMessages([...agencyMessages, {
        id: Date.now().toString(),
        senderId: currentUser?.id || 1,
        text: e.currentTarget.value,
        timestamp: new Date().toISOString()
      }]);
      e.currentTarget.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={ui.container}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={ui.overlay}
          />
          <motion.div
            initial={ui.modal.initial}
            animate={ui.modal.animate}
            exit={ui.modal.exit}
            className={ui.modal.className}
          >
            <div className={ui.header.container}>
              <h2 className={ui.header.title}>{ui.text.title}</h2>
              <button
                onClick={onClose}
                className={ui.header.closeButton.className}
              >
                <ui.header.closeButton.icon className={ui.header.closeButton.iconClass} />
              </button>
            </div>
            <div className={ui.body.container}>
              {/* Channel Sidebar */}
              <div className={ui.sidebar.container}>
                <div className={ui.sidebar.header.container}>
                  <h3 className={ui.sidebar.header.title}>{ui.text.channels}</h3>
                  <ui.sidebar.header.icon className={ui.sidebar.header.iconClass} />
                </div>
                <div className={ui.sidebar.content}>
                  {ui.channels.map(channel => (
                    <div key={channel} className={`${ui.sidebar.channel.className} ${channel === 'general' ? ui.sidebar.channel.active : ui.sidebar.channel.inactive}`}>
                      # {channel}
                    </div>
                  ))}
                  <div className={ui.sidebar.dmHeader}>{ui.text.dm}</div>
                  {users.filter(u => u.id !== currentUser?.id).map(u => (
                    <div key={u.id} className={ui.sidebar.dm.className}>
                      <div className={ui.sidebar.dm.status} />
                      {u.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className={ui.chat.container}>
                <div className={ui.chat.header.container}>
                  <div className={ui.chat.header.textContainer}>
                    <h3 className={ui.chat.header.title}>{ui.text.generalChannel}</h3>
                    <span className={ui.chat.header.subtitle}>{ui.text.generalChannelDesc}</span>
                  </div>
                  <div className={ui.chat.header.actions.container}>
                    <ui.chat.header.actions.usersIcon className={ui.chat.header.actions.icon} />
                    <ui.chat.header.actions.settingsIcon className={ui.chat.header.actions.icon} />
                  </div>
                </div>

                <div className={ui.chat.messages.container}>
                  {agencyMessages.map(msg => {
                    const sender = users.find(u => u.id === msg.senderId);
                    return (
                      <div key={msg.id} className={ui.chat.messages.message.container}>
                        <div className={ui.chat.messages.message.avatar}>
                          {sender?.avatar}
                        </div>
                        <div className={ui.chat.messages.message.content}>
                          <div className={ui.chat.messages.message.header}>
                            <span className={ui.chat.messages.message.name}>{sender?.name}</span>
                            <span className={ui.chat.messages.message.timestamp}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className={ui.chat.messages.message.text}>{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={ui.chat.input.container}>
                  <div className={ui.chat.input.inputContainer}>
                    <input
                      type="text"
                      placeholder={ui.text.inputPlaceholder}
                      className={ui.chat.input.input}
                      onKeyDown={handleSendMessage}
                    />
                    <div className={ui.chat.input.actions.container}>
                      <ui.chat.input.actions.addIcon className={`${ui.chat.input.actions.icon} hidden sm:block`} />
                      <ui.chat.input.actions.messageIcon className={ui.chat.input.actions.icon} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
