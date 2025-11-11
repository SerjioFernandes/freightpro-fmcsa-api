import type { ApiResponse } from '../types/api.types';
import type { ConversationMessage, ConversationPreview, MessageParticipant } from '../types/message.types';
import api from './api';

export interface MessageData {
  receiverId: string;
  subject: string;
  message: string;
}

export interface UnreadCountPayload {
  count: number;
}

export const messageService = {
  async getConversations(): Promise<ApiResponse<ConversationPreview[]>> {
    const response = await api.get<ApiResponse<ConversationPreview[]>>('/messages/conversations');
    return response.data;
  },

  async getAvailableUsers(): Promise<ApiResponse<MessageParticipant[]>> {
    const response = await api.get<ApiResponse<MessageParticipant[]>>('/messages/users');
    return response.data;
  },

  async getConversation(userId: string): Promise<ApiResponse<ConversationMessage[]>> {
    const response = await api.get<ApiResponse<ConversationMessage[]>>(`/messages/conversation/${userId}`);
    return response.data;
  },

  async sendMessage(data: MessageData): Promise<ApiResponse<ConversationMessage>> {
    const response = await api.post<ApiResponse<ConversationMessage>>('/messages/send', data);
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<UnreadCountPayload>>('/messages/unread-count');
    return response.data.data?.count ?? 0;
  },

  async editMessage(id: string, message: string): Promise<ApiResponse<ConversationMessage>> {
    const response = await api.put<ApiResponse<ConversationMessage>>(`/messages/${id}/edit`, { message });
    return response.data;
  },

  async deleteMessage(id: string): Promise<ApiResponse<undefined>> {
    const response = await api.delete<ApiResponse<undefined>>(`/messages/${id}`);
    return response.data;
  }
};
