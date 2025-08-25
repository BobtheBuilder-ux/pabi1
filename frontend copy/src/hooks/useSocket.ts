import { Socket, io } from "socket.io-client";
import { useEffect, useState, useCallback, useRef } from 'react';

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  fileName: string | null;
  createdAt: string;
  isRead: boolean;
  updatedAt: string;
  deletedAt: string | null;
  parentMessageId: string | null;
}

export interface UseSocketReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  connectionError: string | null;
  sendMessage: (conversationId: string, content: string) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  onlineUsers: Set<string>;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
}

export const useSocket = (userId?: string): UseSocketReturn => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!userId) return;

    const newSocket = io('https://chat.pabup.com', {
      auth: { userId },
      autoConnect: true,
      transports: ['websocket'],
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnection: true,
      timeout: 10000
    });

    setSocket(newSocket);
    setConnectionStatus('connecting');

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      setConnectionError(null);
      reconnectAttempts.current = 0;
      newSocket.emit('new-user-add', userId);
    });

    newSocket.on('disconnect', (reason: string) => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      console.warn('Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error: Error) => {
      setIsConnected(false);
      setConnectionStatus('error');
      setConnectionError(error.message);
      
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current++;
        console.log(`Reconnecting... Attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS}`);
      }
    });

    // Message events
    newSocket.on('message', (message: Message) => {
      window.dispatchEvent(new CustomEvent('socket-message-received', { 
        detail: message 
      }));
    });

    newSocket.on('editMessage', (message: Message) => {
      window.dispatchEvent(new CustomEvent('socket-message-edited', {
        detail: message
      }));
    });

    newSocket.on('deleteMessage', (messageId: string) => {
      window.dispatchEvent(new CustomEvent('socket-message-deleted', {
        detail: { messageId }
      }));
    });

    // Online status events
    newSocket.on('get-users', (users: string[]) => {
      setOnlineUsers(new Set(users));
    });

    newSocket.on('online_status', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (isOnline) {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    return () => {
      // Clear all typing timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
      
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setOnlineUsers(new Set());
    };
  }, [userId]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!socket || !isConnected) return;
    
    const messageData = {
      conversationId,
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    socket.emit('sendMessage', messageData);
  }, [socket, isConnected]);

  const editMessage = useCallback((messageId: string, content: string) => {
    if (!socket || !isConnected) return;
    
    socket.emit('editMessage', {
      messageId,
      content,
      updatedAt: new Date().toISOString()
    });
  }, [socket, isConnected]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!socket || !isConnected) return;
    
    socket.emit('deleteMessage', {
      messageId,
      deletedAt: new Date().toISOString()
    });
  }, [socket, isConnected]);

  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean) => {
    if (!socket || !isConnected) return;

    socket.emit('typing', { receiverId, isTyping });

    // Clear existing timeout for this receiver
    const existingTimeout = typingTimeouts.current.get(receiverId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      const timeout = setTimeout(() => {
        socket.emit('typing', { receiverId, isTyping: false });
      }, 3000);
      typingTimeouts.current.set(receiverId, timeout);
    }
  }, [socket, isConnected]);

  return {
    isConnected,
    connectionStatus,
    connectionError,
    sendMessage,
    editMessage,
    deleteMessage,
    onlineUsers,
    sendTypingIndicator
  };
};