import type { ApiResponse } from '../types/api.types';
import api from './api';

export interface SupportChatResponse {
  answer: string;
  matchedQuestion: string | null;
  source: 'faq' | 'default';
}

export const supportService = {
  async sendMessage(message: string): Promise<ApiResponse<SupportChatResponse>> {
    const response = await api.post<ApiResponse<SupportChatResponse>>('/support/chat', { message });
    return response.data;
  }
};

