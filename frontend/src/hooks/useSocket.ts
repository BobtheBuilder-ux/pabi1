import { useEffect, useState, useCallback } from 'react';
import { socketService, SocketEvent, TypingIndicator, OnlineStatus } from '../lib/services/socketService';

export interface UseSocketReturn {
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: TypingIndicator[];
  sendMessage: (receiverId: string, message: string) => void;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
  sendConnectionRequest: (receiverId: string, message: string) => void;
  isUserOnline: (userId: string) => boolean;
}

/**
 * Custom hook for managing Socket.IO real-time features
 * Provides messaging, typing indicators, online status, and connection requests
 */
export const useSocket = (userId?: string): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  // Connect to socket when component mounts
  useEffect(() => {
    if (!userId) return;

    const connect = async () => {
      try {
        await socketService.connect(userId);
        setIsConnected(true);
        setOnlineUsers(socketService.getOnlineUsers());
      } catch (error) {
        console.error('Failed to connect to socket:', error);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [userId]);

  // Handle socket events
  useEffect(() => {
    if (!isConnected) return;

    const handleConnection = (event: SocketEvent) => {
      console.log('Socket connected:', event.data);
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
      const { userId: eventUserId, isTyping } = event.data;
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== eventUserId);
        if (isTyping) {
          return [...filtered, {
            userId: eventUserId,
            userName: `User ${eventUserId}`,
            isTyping: true
          }];
        }
        return filtered;
      });
    };

    const handleMessageReceived = (event: SocketEvent) => {
      // This would typically update a messages store or trigger a callback
      console.log('Message received:', event.data);
      // You can emit a custom event or use a callback prop
      window.dispatchEvent(new CustomEvent('socket-message-received', {
        detail: event.data
      }));
    };

    const handleNotification = (event: SocketEvent) => {
      // This would typically show a toast notification
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
  }, [isConnected]);

  // Send message function
  const sendMessage = useCallback((receiverId: string, message: string) => {
    if (isConnected) {
      socketService.sendMessage(receiverId, message);
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

  // Check if user is online function
  const isUserOnline = useCallback((userId: string) => {
    return socketService.isUserOnline(userId);
  }, []);

  return {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    sendConnectionRequest,
    isUserOnline
  };
};