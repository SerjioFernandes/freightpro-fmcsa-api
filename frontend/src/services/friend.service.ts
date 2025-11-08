import api from './api';
import type {
  FriendRequestResponse,
  FriendListResponse,
  FriendRequestActionResponse,
} from '../types/friend.types';

export const friendService = {
  async sendRequestByUserId(uniqueUserId: string): Promise<FriendRequestActionResponse> {
    const response = await api.post<FriendRequestActionResponse>('/friends/request-by-id', { uniqueUserId });
    return response.data;
  },

  async sendRequest(recipientId: string): Promise<FriendRequestActionResponse> {
    const response = await api.post<FriendRequestActionResponse>('/friends/request', { recipientId });
    return response.data;
  },

  async respond(requestId: string, action: 'accept' | 'decline'): Promise<FriendRequestActionResponse> {
    const response = await api.post<FriendRequestActionResponse>(`/friends/request/${requestId}/respond`, { action });
    return response.data;
  },

  async cancel(requestId: string): Promise<FriendRequestActionResponse> {
    const response = await api.delete<FriendRequestActionResponse>(`/friends/request/${requestId}`);
    return response.data;
  },

  async getRequests(type: 'incoming' | 'outgoing' | 'all' = 'incoming'): Promise<FriendRequestResponse> {
    const response = await api.get<FriendRequestResponse>('/friends/requests', { params: { type } });
    return response.data;
  },

  async getFriends(): Promise<FriendListResponse> {
    const response = await api.get<FriendListResponse>('/friends');
    return response.data;
  },
};


