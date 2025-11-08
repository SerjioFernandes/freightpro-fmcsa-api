import { useState } from 'react';
import { supportService } from '../../services/support.service';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { X, Send, Minimize2, Maximize2, Headphones } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const getQuickQuestionsForUser = (accountType?: string) => {
  const commonQuestions = [
    { text: 'What is USDOT?', query: 'what is usdot' },
    { text: 'Contact support', query: 'how to contact support' }
  ];
  
  const accountSpecificQuestions = {
    carrier: [
      { text: 'How to book a load?', query: 'how to book load' },
      { text: 'How to view my deliveries?', query: 'view deliveries' }
    ],
    broker: [
      { text: 'How to post a load?', query: 'how to post load' },
      { text: 'How to manage carriers?', query: 'manage carriers' }
    ],
    shipper: [
      { text: 'How to request shipping?', query: 'request shipping' },
      { text: 'How to track shipments?', query: 'track shipments' }
    ]
  };
  
  if (!accountType) {
    return commonQuestions.concat({ text: 'How to post a load?', query: 'how to post load' });
  }
  
  return [
    ...(accountSpecificQuestions[accountType as keyof typeof accountSpecificQuestions] || []),
    ...commonQuestions
  ];
};

const SupportChatWidget = () => {
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I\'m CargoLume Support Bot. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await supportService.sendMessage(userMessage.text);
      
      if (response.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: response.data.answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch {
      addNotification({ type: 'error', message: 'Failed to send message to support' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] right-4 md:bottom-6 md:right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 z-[9999] flex items-center justify-center"
        title="Open Support Chat"
        aria-label="Open Support Chat"
      >
        <Headphones className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] right-4 md:bottom-6 md:right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] flex flex-col transition-all ${
        isMinimized ? 'w-[90vw] max-w-[320px] h-16' : 'w-[90vw] max-w-[400px] h-[500px] md:h-[560px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 md:p-4 rounded-t-lg flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5" />
          <span className="font-semibold text-sm md:text-base">Support Chat</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
            title="Close"
            aria-label="Close Support Chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-gray-50 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2.5 md:p-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-3 md:px-4 py-2 shrink-0 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {getQuickQuestionsForUser(user?.accountType).map((q) => (
                  <button
                    key={q.query}
                    onClick={() => {
                      setInput(q.query);
                      handleSend({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className="text-xs bg-blue-50 text-blue-700 px-2.5 md:px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-gray-200 bg-white rounded-b-lg shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default SupportChatWidget;

