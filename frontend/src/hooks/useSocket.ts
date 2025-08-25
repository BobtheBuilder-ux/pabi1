import { useEffect, useState, useCallback } from 'react';
import { socketService, SocketEvent, TypingIndicator } from '../lib/services/socketService';
import { getTokens } from '../lib/utils/tokenHelpers';

export interface UseSocketReturn {
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: TypingIndicator[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
  sendMessage: (receiverId: string, message: string) => void;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
  sendConnectionRequest: (receiverId: string, message: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  isUserOnline: (userId: string) => boolean;
  reconnect: () => void;
}

/**
 * Custom hook for managing Socket.IO real-time features
 * Provides messaging, typing indicators, online status, and connection requests
 */
export const useSocket = (userId?: string): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected');

  // Connect to socket when component mounts
  useEffect(() => {
    if (!userId) return;

    const connect = async () => {
      try {
        setConnectionStatus('connecting');
        const tokens = getTokens();
        await socketService.connect(userId, tokens?.accessToken);
        setIsConnected(true);
        setConnectionStatus('connected');
        setOnlineUsers(socketService.getOnlineUsers());
      } catch (error) {
        console.error('Failed to connect to socket:', error);
        setIsConnected(false);
        setConnectionStatus('error');
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [userId]);

  // Handle socket events
  useEffect(() => {
    if (!userId) return;

    const handleConnection = (event: SocketEvent) => {
      const { connected, reconnecting, reconnected, reconnectFailed, maxReconnectAttemptsReached } = event.data;
      
      if (connected) {
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('Socket connected successfully');
      } else if (reconnecting) {
        setConnectionStatus('reconnecting');
        console.log(`Reconnecting... attempt ${event.data.attempt}`);
      } else if (reconnected) {
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('Socket reconnected successfully');
      } else if (reconnectFailed || maxReconnectAttemptsReached) {
        setIsConnected(false);
        setConnectionStatus('error');
        console.error('Socket reconnection failed');
      } else {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        console.log('Socket disconnected');
      }
    };

    const handleOnlineStatus = (event: SocketEvent) => {
      const { userId: eventUserId, isOnline } = event.data;
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (isOnline) {
          updated.add(eventUserId);
        } else {
          updated.delete(eventUserId);
        }
        return Array.from(updated);
      });
    };

    const handleTyping = (event: SocketEvent) => {
      const { userId: eventUserId, isTyping, userName } = event.data;
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== eventUserId);
        if (isTyping) {
          return [...filtered, {
            userId: eventUserId,
            userName: userName || `User ${eventUserId}`,
            isTyping: true
          }];
        }
        return filtered;
      });
    };

    const handleMessageReceived = (event: SocketEvent) => {
      console.log('Message received:', event.data);
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('socket-message-received', {
        detail: event.data
      }));
    };

    const handleNotification = (event: SocketEvent) => {
      console.log('Notification received:', event.data);
      window.dispatchEvent(new CustomEvent('socket-notification', {
        detail: event.data
      }));
    };

    const handleConnectionRequest = (event: SocketEvent) => {
      console.log('Connection request:', event.data);
      window.dispatchEvent(new CustomEvent('socket-connection-request', {
        detail: event.data
      }));
    };

    // Subscribe to events
    socketService.on('connection', handleConnection);
    socketService.on('online_status', handleOnlineStatus);
    socketService.on('typing', handleTyping);
    socketService.on('message_received', handleMessageReceived);
    socketService.on('notification', handleNotification);
    socketService.on('connection_request_sent', handleConnectionRequest);

    // Cleanup event listeners
    return () => {
      socketService.off('connection', handleConnection);
      socketService.off('online_status', handleOnlineStatus);
      socketService.off('typing', handleTyping);
      socketService.off('message_received', handleMessageReceived);
      socketService.off('notification', handleNotification);
      socketService.off('connection_request_sent', handleConnectionRequest);
    };
  }, [userId]);

  // Send message function
  const sendMessage = useCallback((receiverId: string, message: string) => {
    if (isConnected) {
      socketService.sendMessage(receiverId, message);
    } else {
      console.warn('Cannot send message: not connected to chat server');
    }
  }, [isConnected]);

  // Send typing indicator function
  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean) => {
    if (isConnected) {
      socketService.sendTypingIndicator(receiverId, isTyping);
    }
  }, [isConnected]);

  // Send connection request function
  const sendConnectionRequest = useCallback((receiverId: string, message: string) => {
    if (isConnected) {
      socketService.sendConnectionRequest(receiverId, message);
    }
  }, [isConnected]);

  // Join conversation function
  const joinConversation = useCallback((conversationId: string) => {
    if (isConnected) {
      socketService.joinConversation(conversationId);
    }
  }, [isConnected]);

  // Leave conversation function
  const leaveConversation = useCallback((conversationId: string) => {
    if (isConnected) {
      socketService.leaveConversation(conversationId);
    }
  }, [isConnected]);

  // Check if user is online function
  const isUserOnline = useCallback((userId: string) => {
    return socketService.isUserOnline(userId);
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    socketService.reconnect();
  }, []);

  return {
    isConnected,
    onlineUsers,
    typingUsers,
    connectionStatus,
    sendMessage,
    sendTypingIndicator,
    sendConnectionRequest,
    joinConversation,
    leaveConversation,
    isUserOnline,
    reconnect
  };
};

export { useSocket };