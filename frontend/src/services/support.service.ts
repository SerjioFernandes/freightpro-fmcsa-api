import api from './api';

export const supportService = {
  async sendMessage(message: string): Promise<any> {
    const response = await api.post('/support/chat', { message });
    return response.data;
  }
};

