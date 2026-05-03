import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private';
  assignedUserIds: number[];
}

export interface Message {
  id: string;
  channelId: string;
  senderId: number;
  text: string;
  timestamp: string;
}

interface InboxContextType {
  channels: Channel[];
  messages: Message[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  createChannel: (name: string, type: 'public' | 'private', assignedUserIds: number[]) => void;
  sendMessage: (channelId: string, text: string, senderId: number) => void;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export const InboxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'general', name: 'General', type: 'public', assignedUserIds: [] },
    { id: 'announcements', name: 'Announcements', type: 'public', assignedUserIds: [] },
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', channelId: 'general', senderId: 1, text: 'Welcome to the new inbox!', timestamp: new Date().toISOString() },
  ]);
  const [activeChannelId, setActiveChannelId] = useState<string>('general');

  const createChannel = (name: string, type: 'public' | 'private', assignedUserIds: number[]) => {
    const newChannel: Channel = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      type,
      assignedUserIds,
    };
    setChannels([...channels, newChannel]);
    setActiveChannelId(newChannel.id);
  };

  const sendMessage = (channelId: string, text: string, senderId: number) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      channelId,
      senderId,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <InboxContext.Provider value={{ channels, messages, activeChannelId, setActiveChannelId, createChannel, sendMessage }}>
      {children}
    </InboxContext.Provider>
  );
};

export const useInboxContext = () => {
  const context = useContext(InboxContext);
  if (context === undefined) {
    throw new Error('useInboxContext must be used within an InboxProvider');
  }
  return context;
};
