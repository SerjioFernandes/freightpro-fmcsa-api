import type { AccountType } from './user.types';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendProfile {
  _id: string;
  company: string;
  email: string;
  accountType: AccountType;
}

export interface FriendRequest {
  _id: string;
  requester: FriendProfile;
  recipient: FriendProfile;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface FriendConnection {
  connectionId: string;
  friendId: string;
  company: string;
  email: string;
  accountType: AccountType;
  connectedAt: string;
}

export interface FriendRequestResponse {
  success: boolean;
  data: FriendRequest[];
}

export interface FriendListResponse {
  success: boolean;
  data: FriendConnection[];
}

export interface FriendRequestActionResponse {
  success: boolean;
  message: string;
}


