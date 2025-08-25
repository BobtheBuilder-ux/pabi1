import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Send, Search, Phone, Paperclip, Smile, Mic, X } from 'lucide-react';
import { NavigationBarMainByAnima } from '../LandingPage/sections/NavigationBarMainByAnima';
import { useSocket } from '../../hooks/useSocket';
import { FileSharing } from '../../components/FileSharing';
import EmojiPicker from 'emoji-picker-react';

// Mock data types
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

/**
 * MessagesPage component that displays a chat interface with conversation list and message view
 * Matches the design provided with message notifications and unread counts
 */
export const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('pacific-user');
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Removed showAttachmentMenu state as we now use direct file picker
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFileSharing, setShowFileSharing] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  // Removed attachmentMenuRef as we no longer use dropdown menu
  
  // Initialize socket connection
  const {
    isConnected,
    typingUsers,
    sendMessage: socketSendMessage,
    sendTypingIndicator,
    isUserOnline
  } = useSocket('current-user');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participantId: 'pacific-user',
      participantName: 'Pacific',
      participantAvatar: '/profile-image.png',
      lastMessage: 'Awesome thanks!...',
      lastMessageTime: 'Yesterday',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      participantId: 'new-message-user',
      participantName: 'A new message',
      participantAvatar: '/profile-image-1.png',
      lastMessage: 'Take a look',
      lastMessageTime: '00:30 AM',
      unreadCount: 2,
      isOnline: false
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'pacific-user',
      receiverId: 'current-user',
      content: 'Hey there! How are you doing today?',
      timestamp: new Date('2024-01-15T10:30:00'),
      read: true
    },
    {
      id: '2',
      senderId: 'current-user',
      receiverId: 'pacific-user',
      content: 'Hi Pacific! I\'m doing great, thanks for asking. How about you?',
      timestamp: new Date('2024-01-15T10:32:00'),
      read: true
    },
    {
      id: '3',
      senderId: 'pacific-user',
      receiverId: 'current-user',
      content: 'Awesome thanks! I wanted to discuss the project we talked about earlier.',
      timestamp: new Date('2024-01-15T10:35:00'),
      read: false
    }
  ]);

  /**
   * Handles sending a new message
   */
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      receiverId: selectedConversation,
      content: newMessage,
      timestamp: new Date(),
      read: false
    };

    // Send message through socket
    if (isConnected) {
      socketSendMessage(selectedConversation, newMessage);
    }

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: newMessage, lastMessageTime: 'now' }
        : conv
    ));
    
    // Stop typing indicator
    if (isTyping) {
      sendTypingIndicator(selectedConversation, false);
      setIsTyping(false);
    }
  };

  /**
   * Handles input change and typing indicators
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!selectedConversation || !isConnected) return;

    // Send typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(selectedConversation, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = window.setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(selectedConversation, false);
      }
    }, 1000);
  };

  /**
   * Handles selecting a conversation
   */
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Mark messages as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  /**
   * Handles emoji selection
   */
  const handleEmojiSelect = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  /**
   * Handles direct file attachment - opens file picker immediately
   */
  const handleDirectFileAttachment = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles file selection from file input
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // For now, we'll still use the FileSharing modal to handle the selected files
      // In the future, this could be enhanced to handle files directly
      setShowFileSharing(true);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  /**
   * Filters messages for the selected conversation
   */
  const getConversationMessages = () => {
    if (!selectedConversation) return [];
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return [];
    
    return messages.filter(msg => 
      (msg.senderId === conversation.participantId && msg.receiverId === 'current-user') ||
      (msg.senderId === 'current-user' && msg.receiverId === conversation.participantId)
    );
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

  // Listen for incoming socket messages
  useEffect(() => {
    const handleSocketMessage = (event: CustomEvent) => {
      const messageData = event.detail;
      
      const newMessage: Message = {
        id: messageData.id,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content,
        timestamp: new Date(messageData.timestamp),
        read: false
      };

      setMessages(prev => [...prev, newMessage]);

      // Update conversations with new message
      setConversations(prev => prev.map(conv => {
        if (conv.participantId === messageData.senderId) {
          return {
            ...conv,
            lastMessage: messageData.content,
            lastMessageTime: 'now',
            unreadCount: selectedConversation === conv.id ? 0 : conv.unreadCount + 1
          };
        }
        return conv;
      }));
    };

    window.addEventListener('socket-message-received', handleSocketMessage as EventListener);
    
    return () => {
      window.removeEventListener('socket-message-received', handleSocketMessage as EventListener);
    };
  }, [selectedConversation]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle clicks outside emoji picker and attachment menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      // Removed attachment menu click outside handler
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation bar - keeping it visible as requested */}
      <NavigationBarMainByAnima />
      
      <div className="flex" style={{height: 'calc(100vh - 80px)'}}>
        {/* Conversations List - WhatsApp Style */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] bg-[#f0f2f5] border-r border-gray-300 flex-col`}>
          {/* Header */}
          <div className="bg-white p-4 border-b border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-gray-800 text-xl font-medium">Messages</h1>
              {/* Removed three-dot menu button as requested */}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search conversations" 
                className="w-full bg-gray-100 border-none text-gray-800 placeholder-gray-500 pl-10 rounded-lg"
              />
            </div>
          </div>
          
          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-100 border-b border-gray-200 ${
                    selectedConversation === conversation.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.participantAvatar} alt={conversation.participantName} />
                      <AvatarFallback className="bg-gray-400 text-white">{conversation.participantName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {/* Online status indicator */}
                    {(conversation.isOnline || isUserOnline(conversation.participantId)) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#8a358a] border-2 border-white rounded-full"></div>
                          )}
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gray-800 font-medium truncate">
                        {conversation.participantName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="bg-[#8a358a] text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full font-medium"
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area - White Theme */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 bg-white flex-col`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
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
                  {(() => {
                    const conversation = conversations.find(c => c.id === selectedConversation);
                    return conversation ? (
                      <div className="flex items-center">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.participantAvatar} alt={conversation.participantName} />
                            <AvatarFallback className="bg-gray-400 text-white">{conversation.participantName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {(conversation.isOnline || isUserOnline(conversation.participantId)) && (
                             <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#8a358a] rounded-full border-2 border-white"></div>
                           )}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-gray-800 font-medium">{conversation.participantName}</h3>
                          <p className="text-sm text-gray-500">
                            {(conversation.isOnline || isUserOnline(conversation.participantId)) ? 'online' : 'last seen recently'}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()
                  }
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2">
                    <Phone className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 relative bg-gray-50">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-2">
                    {getConversationMessages().map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                             message.senderId === 'current-user'
                               ? 'bg-[#8a358a] text-white rounded-br-sm'
                               : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                           }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className={`text-xs ${
                               message.senderId === 'current-user' ? 'text-purple-200' : 'text-gray-500'
                             }`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.senderId === 'current-user' && (
                               <span className="text-purple-200 text-xs">✓✓</span>
                             )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Typing indicator */}
                    {selectedConversation && typingUsers.some(user => user.userId === selectedConversation) && (
                      <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md px-3 py-2 rounded-lg bg-white text-gray-800 border border-gray-200 rounded-bl-sm">
                          <p className="text-sm text-gray-500 italic">typing...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-300 p-4 relative">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiSelect} />
                  </div>
                )}
                
                {/* Attachment menu removed - now using direct file picker */}
                
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
                    onClick={handleDirectFileAttachment}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  {/* Hidden file input for direct file selection */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="*/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={handleInputChange}
                      placeholder="Type a message"
                      className="bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg pr-12"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                  </div>
                  {newMessage.trim() ? (
                     <Button 
                       onClick={handleSendMessage} 
                       size="sm"
                       className="bg-[#8a358a] hover:bg-[#7a2f7a] text-white p-2 rounded-full"
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
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
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
               onFileUpload={(files) => {
                 console.log('Files uploaded:', files);
                 setShowFileSharing(false);
               }}
               className="w-full"
             />
           </div>
         </div>
       )}
    </div>
  );
};