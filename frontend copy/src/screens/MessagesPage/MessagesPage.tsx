import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Send, Search, Phone, Paperclip, Smile, Mic, X } from 'lucide-react';
import { NavigationBarMainByAnima } from '../LandingPage/sections/NavigationBarMainByAnima';
import { FileSharing } from '../../components/FileSharing';
import EmojiPicker from 'emoji-picker-react';
import { useSocket } from '../../hooks/useSocket';
import { useConnections } from '../../hooks/useConnections';
import { useAuth } from '../../lib/hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCreateConversationMutation } from '../../lib/api/conversationsApi';
import { Message } from '../../hooks/useSocket';

// Add missing type definitions
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface MessageHistoryResponse {
  messages: Message[];
}

interface MessagesPageProps {
  conversationId?: string;
  onSendMessage?: (message: string) => void;
  conversations?: any[];
  messages?: any[];
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ conversationId, messages: initialMessages = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [createConversation] = useCreateConversationMutation();

  const { 
    connectionStatus: socketStatus, 
    connectionError, 
    sendMessage: socketSendMessage, 
    editMessage, 
    deleteMessage,
    onlineUsers,
    sendTypingIndicator 
  } = useSocket(user?.id);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(socketStatus);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId || null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'connections'>('conversations');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFileSharing, setShowFileSharing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Get connections using our new hook
  const { connections, isLoading: isLoadingConnections } = useConnections();

  // Update connectionStatus when socketStatus changes
  useEffect(() => {
    setConnectionStatus(socketStatus);
    console.log('Socket status changed:', socketStatus);
  }, [socketStatus]);

  const getConnectionStatusMessage = (status: ConnectionStatus) => {
    switch (status) {
      case 'connecting':
        return 'Connecting to chat server...';
      case 'connected':
        return '';
      case 'disconnected':
        return 'Disconnected from chat server. Attempting to reconnect...';
      case 'error':
        return `Failed to connect to chat server. ${connectionError || 'Please try refreshing the page.'}`;
      default:
        return '';
    }
  };

  const getConnectionStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      case 'connected':
        return '';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  // Check for conversation start intent from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    const action = params.get('action');

    if (userId && action === 'start-conversation') {
      handleStartConversation(userId);
      // Clear the URL params
      navigate('/messages', { replace: true });
    }
  }, [location]);

  const handleStartConversation = async (userId: string) => {
    try {
      const result = await createConversation({ participantId: userId }).unwrap();
      if (result.data?.id) {
        setSelectedConversation(result.data.id);
        setActiveTab('conversations');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  // Filter connections based on search term
  const filteredConnections = connections.filter(connection => 
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch message history
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessageHistory = async () => {
      try {
        const response = await axios.get<MessageHistoryResponse>(
          `https://chat.pabup.com/messages/chat/${selectedConversation}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Failed to fetch message history:', error);
      }
    };

    fetchMessageHistory();
  }, [selectedConversation]);

  // Handle incoming messages
  useEffect(() => {
    const handleMessageReceived = (event: CustomEvent<Message>) => {
      setMessages(prev => [...prev, event.detail]);
    };

    const handleMessageEdited = (event: CustomEvent<Message>) => {
      setMessages(prev => prev.map(msg => 
        msg.messageId === event.detail.messageId ? event.detail : msg
      ));
    };

    const handleMessageDeleted = (event: CustomEvent<{ messageId: string }>) => {
      setMessages(prev => prev.filter(msg => msg.messageId !== event.detail.messageId));
    };

    const handleTypingIndicator = (event: CustomEvent<{ userId: string; isTyping: boolean }>) => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        if (event.detail.isTyping) {
          updated.add(event.detail.userId);
        } else {
          updated.delete(event.detail.userId);
        }
        return updated;
      });
    };

    window.addEventListener('socket-message-received', handleMessageReceived as EventListener);
    window.addEventListener('socket-message-edited', handleMessageEdited as EventListener);
    window.addEventListener('socket-message-deleted', handleMessageDeleted as EventListener);
    window.addEventListener('typing-indicator', handleTypingIndicator as EventListener);

    return () => {
      window.removeEventListener('socket-message-received', handleMessageReceived as EventListener);
      window.removeEventListener('socket-message-edited', handleMessageEdited as EventListener);
      window.removeEventListener('socket-message-deleted', handleMessageDeleted as EventListener);
      window.removeEventListener('typing-indicator', handleTypingIndicator as EventListener);
    };
  }, []);

  // Handle sending a message
  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation && connectionStatus === 'connected') {
      socketSendMessage(selectedConversation, newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (selectedConversation) {
      sendTypingIndicator(selectedConversation, true);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  };

  const renderMessage = (message: Message) => (
    <div key={message.messageId} className="p-2 bg-white rounded-lg shadow-sm">
      {editingMessageId === message.messageId ? (
        <div className="flex gap-2">
          <Input 
            defaultValue={message.content}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEditMessage(message.messageId, (e.target as HTMLInputElement).value);
              }
            }}
          />
          <Button size="sm" onClick={() => setEditingMessageId(null)}>Cancel</Button>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <p className="text-gray-800">{message.content}</p>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditingMessageId(message.messageId)}
            >
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDeleteMessage(message.messageId)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    return (
      <div className="text-sm text-gray-500 italic px-4 py-2">
        {Array.from(typingUsers).map(userId => {
          const user = connections.find(c => c.id === userId);
          return user?.name || 'Someone';
        }).join(', ')}
        {typingUsers.size === 1 ? ' is ' : ' are '} typing...
      </div>
    );
  };

  const renderOnlineStatus = (userId: string) => (
    <div className={`w-3 h-3 rounded-full ${onlineUsers.has(userId) ? 'bg-green-500' : 'bg-gray-400'}`} />
  );

  const renderChatHeader = () => {
    if (!selectedConversation) return null;

    const activeConnection = connections.find(c => c.id === selectedConversation);
    if (!activeConnection) return null;

    return (
      <div className="bg-white p-4 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-gray-600 hover:bg-gray-100 p-2 mr-2"
            onClick={() => setSelectedConversation(null)}
          >
            ←
          </Button>
          <div className="flex items-center">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeConnection.avatar} />
                <AvatarFallback>{activeConnection.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                {renderOnlineStatus(activeConnection.id)}
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-gray-800 font-medium">{activeConnection.name}</h3>
              <p className="text-sm text-gray-500">
                {onlineUsers.has(activeConnection.id) ? 'online' : 'offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2">
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Update the connections tab content
  const renderConnectionsList = () => {
    if (isLoadingConnections) {
      return <div className="p-4 text-center text-gray-500">Loading connections...</div>;
    }

    if (filteredConnections.length === 0) {
      return <div className="p-4 text-center text-gray-500">No connections found</div>;
    }

    return (
      <div className="space-y-2">
        {filteredConnections.map((connection) => (
          <div
            key={connection.id}
            onClick={() => handleStartConversation(connection.id)}
            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={connection.avatar} />
              <AvatarFallback>{connection.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">
                {connection.name}
              </div>
              {(connection.title || connection.company) && (
                <div className="text-xs text-gray-500 truncate">
                  {connection.title} {connection.company ? `at ${connection.company}` : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation bar - keeping it visible as requested */}
      <NavigationBarMainByAnima />
      
      {connectionStatus !== 'connected' && (
        <div className={`p-2 text-center ${getConnectionStatusColor(connectionStatus)}`}>
          <p className="text-sm">
            {getConnectionStatusMessage(connectionStatus)}
          </p>
        </div>
      )}
      
      <div className="flex" style={{height: 'calc(100vh - 80px)'}}>
        {/* Conversations List - WhatsApp Style */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] bg-[#f0f2f5] border-r border-gray-300 flex-col`}>
          {/* Header */}
          <div className="bg-white p-4 border-b border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-gray-800 text-xl font-medium">Messages</h1>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'conversations'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'connections'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Connections
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'conversations' ? 'Search conversations' : 'Search connections'} 
                className="w-full bg-gray-100 border-none text-gray-800 placeholder-gray-500 pl-10 rounded-lg"
              />
            </div>
          </div>
          
          {/* Content Area - Conversations or Connections */}
          <ScrollArea className="flex-1">
            {activeTab === 'conversations' ? (
              <div>
                <div className="p-4 text-center text-gray-500">No conversations yet</div>
              </div>
            ) : (
              renderConnectionsList()
            )}
          </ScrollArea>
        </div>

        {/* Chat Area - White Theme */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 bg-white flex-col`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              {renderChatHeader()}

              {/* Messages Area */}
              <div className="flex-1 relative bg-gray-50">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-2">
                    {messages.map(renderMessage)}
                    {renderTypingIndicator()}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-300 p-4 relative">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-50">
                    <EmojiPicker />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:bg-gray-100 p-2"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:bg-gray-100 p-2"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="*/*"
                    className="hidden"
                  />
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message"
                      className="bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg pr-12"
                    />
                  </div>
                  {newMessage.trim() ? (
                     <Button 
                       size="sm"
                       className="bg-[#8a358a] hover:bg-[#7a2f7a] text-white p-2 rounded-full"
                       onClick={handleSendMessage}
                     >
                       <Send className="h-4 w-4" />
                     </Button>
                   ) : (
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2">
                      <Mic className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-center px-8">
              <div className="max-w-md">
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto mb-8 bg-[#8a358a] rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to Messages</h3>
                <p className="text-gray-600 leading-relaxed">
                  Select a conversation from the list to start chatting.<br/>
                  Connect with your network and share ideas instantly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* File Sharing Modal */}
       {showFileSharing && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold">Share Files</h3>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setShowFileSharing(false)}
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             <FileSharing 
               conversationId={selectedConversation || ''}
               className="w-full"
             />
           </div>
         </div>
       )}
    </div>
  );
};