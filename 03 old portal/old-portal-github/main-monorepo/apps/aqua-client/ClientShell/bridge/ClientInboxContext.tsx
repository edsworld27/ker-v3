"use client";
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { Conversation, UnifiedMessage } from '@ClientShell/bridge/types';

export interface UnifiedAttachment {
  id?: string;
  name: string;
  url?: string;
  type?: string;
  size?: number;
}

export interface InboxChannel {
  id: string;
  name: string;
  type?: string;
  allowedRoles: string[];
  assignedUserIds: number[];
  unreadCount?: number;
  lastMessage?: string;
  createdAt?: string;
}

export interface InboxAccount {
  id: string;
  service: string;
  identifier: string;
  label?: string;
  isConnected?: boolean;
}

interface InboxContextType {
  // Core conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  setActiveConversation: (conv: Conversation | null) => void;
  sendMessage: (content: string, conversationId?: string) => void;
  markAsRead: (conversationId: string) => void;
  starConversation: (id: string) => void;
  sendUnifiedMessage: (conversationId: string, payload: any) => void;

  // Channels (team messaging)
  channels: InboxChannel[];
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;
  messages: Record<string, UnifiedMessage[]>;
  unreadCounts: Record<string, number>;
  createChannel: (channel: Partial<InboxChannel>) => void;
  updateChannel: (id: string, updates: Partial<InboxChannel>) => void;
  deleteChannel: (id: string) => void;

  // External accounts
  accounts: InboxAccount[];
  addAccount: (account: InboxAccount) => void;

  // Unified messages
  unifiedMessages: UnifiedMessage[];
}

export const InboxContext = createContext<InboxContextType | undefined>(undefined);

export const InboxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { conversations, setConversations, currentUser, addLog } = useAppContext();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [channels, setChannels] = useState<InboxChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, UnifiedMessage[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [accounts, setAccounts] = useState<InboxAccount[]>([]);
  const [unifiedMessages, setUnifiedMessages] = useState<UnifiedMessage[]>([]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const setActiveConversation = (conv: Conversation | null) => {
    setActiveConversationId(conv?.id || null);
  };

  const sendMessage = (content: string, conversationId?: string) => {
    const targetId = conversationId || activeConversationId;
    if (!targetId || !currentUser) return;
    const newMessage: UnifiedMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id.toString(),
      content,
      createdAt: new Date().toISOString()
    };
    setConversations(prev => prev.map(c =>
      c.id === targetId ? { ...c, lastMessage: newMessage, updatedAt: new Date().toISOString() } : c
    ));
    addLog('Messaging', `Sent message in conversation ${targetId}`, 'action');
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const starConversation = (id: string) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, isStarred: !(c as any).isStarred } : c
    ));
  };

  const sendUnifiedMessage = (conversationId: string, payload: any) => {
    const msg: UnifiedMessage = {
      id: `um-${Date.now()}`,
      conversationId,
      senderId: currentUser?.id.toString(),
      content: payload.text || '',
      type: payload.type || 'text',
      createdAt: new Date().toISOString(),
    };
    setUnifiedMessages(prev => [...prev, msg]);
  };

  const createChannel = (channel: Partial<InboxChannel>) => {
    const newCh: InboxChannel = {
      id: `ch-${Date.now()}`,
      name: channel.name || 'New Channel',
      allowedRoles: channel.allowedRoles ?? [],
      assignedUserIds: channel.assignedUserIds ?? [],
      ...channel,
    };
    setChannels(prev => [...prev, newCh]);
  };

  const updateChannel = (id: string, updates: Partial<InboxChannel>) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteChannel = (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
  };

  const addAccount = (account: InboxAccount) => {
    setAccounts(prev => [...prev, account]);
  };

  return (
    <InboxContext.Provider value={{
      conversations,
      activeConversation,
      activeConversationId,
      setActiveConversationId,
      setActiveConversation,
      sendMessage,
      markAsRead,
      starConversation,
      sendUnifiedMessage,
      channels,
      activeChannelId,
      setActiveChannelId,
      messages,
      unreadCounts,
      createChannel,
      updateChannel,
      deleteChannel,
      accounts,
      addAccount,
      unifiedMessages,
    }}>
      {children}
    </InboxContext.Provider>
  );
};

const noopInbox: any = new Proxy({}, {
  get(_t, prop) {
    if (prop === 'messages' || prop === 'threads' || prop === 'list') return [];
    if (prop === 'unreadCount' || prop === 'count') return 0;
    if (typeof prop === 'string' && (prop.startsWith('handle') || prop.startsWith('mark') || prop.startsWith('send') || prop.startsWith('archive') || prop.startsWith('open') || prop.startsWith('close') || prop.startsWith('select'))) {
      return () => {};
    }
    return undefined;
  },
});

export const useInboxContext = () => {
  const context = useContext(InboxContext);
  return context ?? noopInbox;
};
