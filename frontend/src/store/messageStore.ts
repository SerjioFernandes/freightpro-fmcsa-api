import { create } from 'zustand';

export interface Message {
  _id: string;
  sender: any;
  receiver: any;
  subject: string;
  message: string;
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: Date;
  createdAt: string;
}

interface MessageState {
  conversations: any[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setConversations: (conversations: any[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;
  clearError: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  updateMessage: (message) => set((state) => ({
    messages: state.messages.map(msg => 
      msg._id === message._id ? message : msg
    )
  })),

  deleteMessage: (messageId) => set((state) => ({
    messages: state.messages.filter(msg => msg._id !== messageId)
  })),

  clearError: () => set({ error: null }),
}));

