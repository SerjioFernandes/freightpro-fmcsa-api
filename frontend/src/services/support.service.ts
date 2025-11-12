import type { ApiResponse } from '../types/api.types';
import api from './api';

export interface SupportChatResponse {
  answer: string;
  matchedQuestion: string | null;
  source: 'faq' | 'default';
}

export interface SupportTicket {
  _id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  response?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const supportService = {
  async sendMessage(message: string): Promise<ApiResponse<SupportChatResponse>> {
    const response = await api.post<ApiResponse<SupportChatResponse>>('/support/chat', { message });
    return response.data;
  },

  async createTicket(payload: { subject: string; message: string }): Promise<ApiResponse<SupportTicket>> {
    const response = await api.post<ApiResponse<SupportTicket>>('/support/tickets', payload);
    return response.data;
  },

  async listTickets(): Promise<ApiResponse<SupportTicket[]>> {
    const response = await api.get<ApiResponse<SupportTicket[]>>('/support/tickets');
    return response.data;
  },
};

