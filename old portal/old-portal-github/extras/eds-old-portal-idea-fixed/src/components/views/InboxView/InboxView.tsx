import React, { useState } from 'react';
import { Hash, Plus, Lock, User } from 'lucide-react';
import { useInboxContext } from '../../../context/InboxContext';
import { useAppContext } from '../../../context/AppContext';
import { inboxViewUI as ui } from './ui';

export const InboxView: React.FC = () => {
  const { channels, messages, activeChannelId, setActiveChannelId, createChannel, sendMessage } = useInboxContext();
  const { users } = useAppContext();
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeMessages = messages.filter(m => m.channelId === activeChannelId);

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      createChannel(newChannelName, 'private', selectedUserIds);
      setNewChannelName('');
      setSelectedUserIds([]);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(activeChannelId, newMessage, 1);
      setNewMessage('');
    }
  };

  return (
    <div className={`${ui.root.layout} ${ui.root.bg} ${ui.root.textColor}`}>

      {/* Channel sidebar */}
      <div className={`${ui.sidebar.width} ${ui.sidebar.border} ${ui.sidebar.layout}`}>
        <div className={`${ui.sidebar.header.padding} ${ui.sidebar.header.border} ${ui.sidebar.header.layout}`}>
          <h2 className={`${ui.sidebar.header.titleWeight} ${ui.sidebar.header.titleColor}`}>{ui.sidebar.header.title}</h2>
          <button onClick={handleCreateChannel} className={ui.sidebar.header.addBtn}>
            <Plus className={ui.sidebar.header.addIconSize} />
          </button>
        </div>

        <div className={ui.sidebar.newChannel.padding}>
          <input
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder={ui.sidebar.newChannel.placeholder}
            className={ui.sidebar.newChannel.input}
          />
          <div className={ui.sidebar.newChannel.userListSpacing}>
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => toggleUserSelection(user.id)}
                className={`${ui.sidebar.newChannel.userBtn.layout} ${ui.sidebar.newChannel.userBtn.padding} ${ui.sidebar.newChannel.userBtn.fontSize} ${ui.sidebar.newChannel.userBtn.radius} ${selectedUserIds.includes(user.id) ? ui.sidebar.newChannel.userBtn.activeStyle : ui.sidebar.newChannel.userBtn.inactiveStyle}`}
              >
                <User className={ui.sidebar.newChannel.userBtn.iconSize} />
                {user.name}
              </button>
            ))}
          </div>
          <button onClick={handleCreateChannel} className={ui.sidebar.newChannel.createBtn}>
            {ui.sidebar.newChannel.createLabel}
          </button>
        </div>

        <div className={ui.sidebar.channelList.wrapper}>
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannelId(channel.id)}
              className={`${ui.sidebar.channelList.btn.layout} ${ui.sidebar.channelList.btn.padding} ${ui.sidebar.channelList.btn.fontSize} ${activeChannelId === channel.id ? ui.sidebar.channelList.btn.activeStyle : ui.sidebar.channelList.btn.inactiveStyle}`}
            >
              {channel.type === 'private' ? <Lock className={ui.sidebar.channelList.btn.iconSize} /> : <Hash className={ui.sidebar.channelList.btn.iconSize} />}
              {channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className={ui.main.layout}>
        <div className={`${ui.main.header.padding} ${ui.main.header.border}`}>
          <h2 className={ui.main.header.titleLayout}>
            <Hash className={ui.main.header.iconSize} />
            {activeChannel?.name}
          </h2>
        </div>

        <div className={ui.main.messages.wrapper}>
          {activeMessages.map(msg => (
            <div key={msg.id} className={`${ui.main.messages.bubble.padding} ${ui.main.messages.bubble.bg} ${ui.main.messages.bubble.radius}`}>
              <div className={`${ui.main.messages.bubble.timestampSize} ${ui.main.messages.bubble.timestampColor} ${ui.main.messages.bubble.timestampGap}`}>{msg.timestamp}</div>
              <div>{msg.text}</div>
            </div>
          ))}
        </div>

        <div className={ui.main.input.wrapper}>
          <div className={ui.main.input.layout}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`${ui.main.input.placeholderPrefix}${activeChannel?.name}`}
              className={ui.main.input.field}
            />
            <button onClick={handleSendMessage} className={ui.main.input.sendBtn}>
              {ui.main.input.sendLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
