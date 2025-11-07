import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/message.service';
import { friendService } from '../services/friend.service';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { MessageSquare, Send, Loader2, Edit2, Trash2, Plus, X, Search, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { FriendConnection, FriendRequest } from '../types/friend.types';

const Messages = () => {
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const { subscribe, joinRoom, leaveRoom } = useWebSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [connections, setConnections] = useState<FriendConnection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    setIsConversationsLoading(true);
    setConversationsError(null);
    try {
      const response = await messageService.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error: any) {
      setConversationsError('Failed to load conversations');
      addNotification({ type: 'error', message: 'Failed to load conversations' });
    } finally {
      setIsConversationsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadFriends = useCallback(async () => {
    setIsFriendsLoading(true);
    try {
      const response = await friendService.getFriends();
      if (response.success) {
        setConnections(response.data);
      }
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to load connections' });
    } finally {
      setIsFriendsLoading(false);
    }
  }, [addNotification]);

  const loadFriendRequests = useCallback(async () => {
    setIsRequestsLoading(true);
    try {
      const [incoming, outgoing] = await Promise.all([
        friendService.getRequests('incoming'),
        friendService.getRequests('outgoing'),
      ]);

      if (incoming.success) {
        setIncomingRequests(incoming.data);
      }
      if (outgoing.success) {
        setOutgoingRequests(outgoing.data);
      }
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to load friend requests' });
    } finally {
      setIsRequestsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [loadFriends, loadFriendRequests]);

  const loadConversation = useCallback(async (userId: string) => {
    setIsMessagesLoading(true);
    setMessagesError(null);
    try {
      const response = await messageService.getConversation(userId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error: any) {
      setMessagesError('Failed to load conversation');
      addNotification({ type: 'error', message: 'Failed to load conversation' });
    } finally {
      setIsMessagesLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    if (selectedUser && user) {
      loadConversation(selectedUser.userId);
      
      // Join conversation room for real-time updates
      const conversationId = [user.id, selectedUser.userId].sort().join('_');
      joinRoom(`conversation_${conversationId}`);
      
      return () => {
        leaveRoom(`conversation_${conversationId}`);
      };
    }
  }, [selectedUser, user, joinRoom, leaveRoom, loadConversation]);

  // WebSocket real-time message updates
  useEffect(() => {
    if (import.meta.env.DEV) console.log('[Messages] Setting up WebSocket listeners');

    const unsubscribeNewMessage = subscribe('new_message', (message: any) => {
      if (import.meta.env.DEV) console.log('[Messages] Received new_message event', message);
      
      const senderId = typeof message.sender === 'object' ? message.sender._id?.toString() : message.sender?.toString();
      const receiverId = typeof message.receiver === 'object' ? message.receiver._id?.toString() : message.receiver?.toString();
      
      // Check if message is for current conversation
      if (selectedUser && (
        senderId === selectedUser.userId || 
        receiverId === selectedUser.userId ||
        senderId === user?.id ||
        receiverId === user?.id
      )) {
        if (import.meta.env.DEV) console.log('[Messages] Adding message to current conversation');
        // Only add if not already in messages (prevent duplicates)
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === message._id);
          if (exists) {
            if (import.meta.env.DEV) console.log('[Messages] Message already exists, skipping');
            return prev;
          }
          if (import.meta.env.DEV) console.log('[Messages] Adding new message to list');
          return [...prev, message];
        });
      }
      
      // Refresh conversations list to update unread counts (but don't reload current messages)
      loadConversations();
    });

    const unsubscribeMessageUpdate = subscribe('message_updated', (message: any) => {
      setMessages(prev => prev.map(msg => 
        msg._id === message._id ? message : msg
      ));
    });

    const unsubscribeMessageDelete = subscribe('message_deleted', (data: any) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageUpdate();
      unsubscribeMessageDelete();
    };
  }, [subscribe, selectedUser, user, loadConversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      addNotification({ type: 'error', message: 'Please select a conversation first' });
      return;
    }

    if (!subject.trim() || !messageInput.trim()) {
      addNotification({ type: 'error', message: 'Subject and message are required' });
      return;
    }

    const isConnected = connections.some(connection => connection.friendId === selectedUser.userId);
    if (!isConnected) {
      addNotification({ type: 'error', message: 'Connect with this user before sending messages.' });
      return;
    }

    setIsSending(true);
    try {
      await messageService.sendMessage({
        receiverId: selectedUser.userId,
        subject: subject.trim(),
        message: messageInput.trim()
      });
      
      setSubject('');
      setMessageInput('');
      await loadConversation(selectedUser.userId);
      await loadConversations();
      addNotification({ type: 'success', message: 'Message sent!' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send message';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (msg: any, newMessage: string) => {
    try {
      await messageService.editMessage(msg._id, newMessage);
      addNotification({ type: 'success', message: 'Message updated!' });
      await loadConversation(selectedUser?.userId || '');
      setEditingMessage(null);
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to edit message' 
      });
    }
  };

  const handleDeleteMessage = async (msg: any) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await messageService.deleteMessage(msg._id);
      addNotification({ type: 'success', message: 'Message deleted!' });
      await loadConversation(selectedUser?.userId || '');
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to delete message' 
      });
    }
  };

  const isMyMessage = (msg: any): boolean => {
    return !!(user && msg.sender?._id?.toString() === user.id);
  };

  const handleNewMessage = async () => {
    try {
      const response = await messageService.getAvailableUsers();
      if (response.success) {
        setAvailableUsers(response.data || []);
        setShowNewMessageModal(true);
      }
    } catch (error: any) {
      addNotification({ type: 'error', message: 'Failed to load users' });
    }
  };

  const handleSendFriendRequest = async (recipientId: string) => {
    try {
      const response = await friendService.sendRequest(recipientId);
      if (response.success) {
        addNotification({ type: 'success', message: response.message || 'Connection request sent!' });
      }
      await loadFriendRequests();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send connection request';
      addNotification({ type: 'error', message: errorMessage });
    } finally {
      setShowNewMessageModal(false);
      setUserSearchQuery('');
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await friendService.respond(requestId, action);
      if (response.success) {
        addNotification({ type: action === 'accept' ? 'success' : 'info', message: response.message });
        await Promise.all([loadFriendRequests(), loadFriends(), loadConversations()]);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update request';
      addNotification({ type: 'error', message: errorMessage });
    }
  };

  const handleCancelFriendRequest = async (requestId: string) => {
    try {
      const response = await friendService.cancel(requestId);
      if (response.success) {
        addNotification({ type: 'info', message: response.message || 'Request cancelled' });
        await loadFriendRequests();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel request';
      addNotification({ type: 'error', message: errorMessage });
    }
  };

  const handleSelectUser = (selectedUser: any) => {
    handleSendFriendRequest(selectedUser._id);
  };

  const blockedUserIds = new Set<string>();
  incomingRequests.forEach(request => blockedUserIds.add(request.requester._id));
  outgoingRequests.forEach(request => blockedUserIds.add(request.recipient._id));
  connections.forEach(connection => blockedUserIds.add(connection.friendId));

  const filteredUsers = availableUsers
    .filter(u => !blockedUserIds.has(u._id))
    .filter(u =>
      u.company.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.accountType.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

  const canMessageSelected = selectedUser
    ? connections.some(connection => connection.friendId === selectedUser.userId)
    : false;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary-blue" />
            Messages
          </h1>
          <button
            onClick={handleNewMessage}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus className="h-5 w-5" />
            New Connection
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Trusted Connections</h2>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  {connections.length} Active
                </span>
              </div>
              <div className="space-y-2 lg:max-h-52 overflow-y-auto pr-1">
                {isFriendsLoading ? (
                  <div className="py-8 flex justify-center"><LoadingSpinner /></div>
                ) : connections.length === 0 ? (
                  <p className="text-gray-500 text-sm">No confirmed connections yet.</p>
                ) : (
                  connections.map((connection) => (
                    <button
                      key={connection.connectionId}
                      onClick={() => setSelectedUser({
                        userId: connection.friendId,
                        company: connection.company,
                        email: connection.email,
                        accountType: connection.accountType,
                      })}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors border ${
                        selectedUser?.userId === connection.friendId
                          ? 'bg-blue-50 border-blue-500 text-blue-900'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{connection.company}</span>
                        <span className="text-xs text-gray-500">{new Date(connection.connectedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">{connection.email}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Connection Requests</h2>
                {isRequestsLoading && <Loader2 className="h-4 w-4 animate-spin text-primary-blue" />}
              </div>
              <div className="space-y-3 lg:max-h-56 overflow-y-auto pr-1">
                {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending requests.</p>
                ) : (
                  <>
                    {incomingRequests.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Incoming</p>
                        <div className="space-y-2">
                          {incomingRequests.map((request) => (
                            <div key={request._id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{request.requester.company}</p>
                                  <p className="text-xs text-gray-500">{request.requester.email}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRespondToRequest(request._id, 'accept')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRespondToRequest(request._id, 'decline')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {outgoingRequests.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Outgoing</p>
                        <div className="space-y-2">
                          {outgoingRequests.map((request) => (
                            <div key={request._id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{request.recipient.company}</p>
                                  <p className="text-xs text-gray-500">{request.recipient.email}</p>
                                </div>
                                <button
                                  onClick={() => handleCancelFriendRequest(request._id)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-white hover:bg-gray-900"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="card min-h-[220px] md:h-[320px] lg:h-[360px] overflow-hidden flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">
                Conversations
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2">
                {isConversationsLoading ? (
                  <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                ) : conversationsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-3">{conversationsError}</p>
                    <button onClick={loadConversations} className="btn btn-secondary">Retry</button>
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No conversations yet</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedUser(conv)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedUser?.userId === conv.userId
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{conv.company}</span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage?.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleString() : 'No messages yet'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            <div className="card min-h-[420px] md:h-[540px] lg:h-[600px] flex flex-col">
              {selectedUser ? (
                <>
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{selectedUser.company}</h2>
                    <p className="text-sm text-gray-600 capitalize">{selectedUser.accountType}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1 sm:px-0">
                    {isMessagesLoading ? (
                      <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                    ) : messagesError ? (
                      <div className="text-center py-8">
                        <p className="text-red-500 mb-3">{messagesError}</p>
                        <button onClick={() => loadConversation(selectedUser.userId)} className="btn btn-secondary">Retry</button>
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No messages yet. Start a conversation!</p>
                    ) : (
                      messages.map((msg: any) => (
                        <div
                          key={msg._id}
                          className={`flex ${
                            isMyMessage(msg) ? 'justify-end' : 'justify-start'
                          }`}
                          onMouseEnter={() => setHoveredMessage(msg._id)}
                          onMouseLeave={() => setHoveredMessage(null)}
                        >
                          <div className="relative group">
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isMyMessage(msg)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="font-medium text-sm mb-1">{msg.subject}</p>
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                              <p className="text-xs opacity-75 mt-2 flex items-center gap-2">
                                {new Date(msg.createdAt).toLocaleString()}
                                {msg.isEdited && (
                                  <span className="italic">(edited)</span>
                                )}
                              </p>
                            </div>
                            {isMyMessage(msg) && hoveredMessage === msg._id && !editingMessage && (
                              <div className="absolute -top-8 right-0 flex gap-1 bg-white shadow-lg rounded border border-gray-200 p-1">
                                <button
                                  onClick={() => setEditingMessage(msg._id)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors text-blue-600"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            {editingMessage === msg._id && (
                              <div className="mt-2">
                                <textarea
                                  defaultValue={msg.message}
                                  className="input w-full min-h-[80px]"
                                  autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => setEditingMessage(null)}
                                    className="btn btn-secondary px-3"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      const newMessage = (e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement)?.value;
                                      if (newMessage) handleEditMessage(msg, newMessage);
                                    }}
                                    className="btn btn-primary px-3"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="space-y-2">
                    {!canMessageSelected && (
                      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-lg px-4 py-3">
                        Establish a connection first to enable secure messaging with this company.
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input w-full"
                      required
                      disabled={!canMessageSelected}
                    />
                    <div className="flex gap-2">
                      <textarea
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        className="input flex-1 min-h-[80px] resize-none"
                        required
                        disabled={!canMessageSelected}
                      />
                      <button
                        type="submit"
                        disabled={isSending || !canMessageSelected}
                        className="btn btn-primary px-6 flex items-center justify-center disabled:opacity-60"
                      >
                        {isSending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <div className="bg-white w-full max-w-md sm:max-w-lg max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Connection Request
                </h2>
                <button
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setUserSearchQuery('');
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-5 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Verified Users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search by company, email, or type..."
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Send a connection request. Once accepted, the conversation will unlock and appear in your trusted connections list.
                </p>

                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No users found</p>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => handleSelectUser(u)}
                        className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{u.company}</p>
                            <p className="text-sm text-gray-600">{u.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded capitalize">
                              {u.accountType}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                            Send Request
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

