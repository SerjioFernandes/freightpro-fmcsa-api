import api from './api';

export interface MessageData {
  receiverId: string;
  subject: string;
  message: string;
}

export const messageService = {
  async getConversations(): Promise<any> {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  async getConversation(userId: string): Promise<any> {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data;
  },

  async sendMessage(data: MessageData): Promise<any> {
    const response = await api.post('/messages/send', data);
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/messages/unread-count');
    return response.data.data?.count || 0;
  },

  async editMessage(id: string, message: string): Promise<any> {
    const response = await api.put(`/messages/${id}/edit`, { message });
    return response.data;
  },

  async deleteMessage(id: string): Promise<any> {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  }
};

