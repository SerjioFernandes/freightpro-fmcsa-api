import { useState, useEffect } from 'react';
import { messageService } from '../services/message.service';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { MessageSquare, Send, Loader2, Edit2, Trash2 } from 'lucide-react';

const Messages = () => {
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const { subscribe } = useWebSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  const { subscribe, joinRoom, leaveRoom } = useWebSocket();

  useEffect(() => {
    loadConversations();
  }, []);

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
  }, [selectedUser, user, joinRoom, leaveRoom]);

  // WebSocket real-time message updates
  useEffect(() => {
    const unsubscribeNewMessage = subscribe('new_message', (message: any) => {
      const senderId = typeof message.sender === 'object' ? message.sender._id?.toString() : message.sender?._id?.toString();
      const receiverId = typeof message.receiver === 'object' ? message.receiver._id?.toString() : message.receiver?._id?.toString();
      
      // Check if message is for current conversation
      if (selectedUser && (
        senderId === selectedUser.userId || 
        receiverId === selectedUser.userId ||
        senderId === user?.id ||
        receiverId === user?.id
      )) {
        // Only add if not already in messages (prevent duplicates)
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
      // Always refresh conversations list to update unread counts
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

  const loadConversations = async () => {
    try {
      const response = await messageService.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error: any) {
      addNotification({ type: 'error', message: 'Failed to load conversations' });
    }
  };

  const loadConversation = async (userId: string) => {
    try {
      const response = await messageService.getConversation(userId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error: any) {
      addNotification({ type: 'error', message: 'Failed to load conversation' });
    }
  };

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
      addNotification({ type: 'error', message: 'Failed to send message' });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary-blue" />
          Messages
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="card h-[600px] overflow-hidden flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">
                Conversations
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2">
                {conversations.length === 0 ? (
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
                        {new Date(conv.lastMessage?.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            <div className="card h-[600px] flex flex-col">
              {selectedUser ? (
                <>
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{selectedUser.company}</h2>
                    <p className="text-sm text-gray-600 capitalize">{selectedUser.accountType}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.length === 0 ? (
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
                    <input
                      type="text"
                      placeholder="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input w-full"
                      required
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
                      />
                      <button
                        type="submit"
                        disabled={isSending}
                        className="btn btn-primary px-6 flex items-center justify-center"
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
      </div>
    </div>
  );
};

export default Messages;

