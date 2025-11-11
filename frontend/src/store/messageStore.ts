import { create } from 'zustand';
import type { ConversationMessage, ConversationPreview } from '../types/message.types';

type MessageState = {
  conversations: ConversationPreview[];
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;

  setConversations: (conversations: ConversationPreview[]) => void;
  setMessages: (messages: ConversationMessage[]) => void;
  addMessage: (message: ConversationMessage) => void;
  updateMessage: (message: ConversationMessage) => void;
  deleteMessage: (messageId: string) => void;
  clearError: () => void;
};

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (message) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg._id === message._id ? message : msg)),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== messageId),
    })),

  clearError: () => set({ error: null }),
}));

