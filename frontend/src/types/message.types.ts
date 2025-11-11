import type { AccountType } from './user.types';

export interface MessageAttachment {
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface MessageParticipant {
  _id: string;
  company: string;
  email: string;
  accountType: AccountType;
  usdotNumber?: string;
  mcNumber?: string;
}

export interface ConversationPreview {
  userId: string;
  company?: string;
  email?: string;
  accountType?: AccountType;
  lastMessage?: {
    subject: string;
    message: string;
    createdAt: string;
  };
  unreadCount: number;
}

export interface ConversationMessage {
  _id: string;
  sender: MessageParticipant;
  receiver: MessageParticipant;
  subject: string;
  message: string;
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  conversationId?: string;
}


