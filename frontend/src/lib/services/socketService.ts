import { io, Socket } from 'socket.io-client';

export interface SocketEvent {
  type: 'message' | 'typing' | 'online_status' | 'notification' | 'connection_request' | 'connection';
  data: any;
  userId?: string;
  timestamp: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

type EventCallback = (event: SocketEvent) => void;

/**
 * Real Socket.IO service for chat functionality
 * Connects to the chat server and handles real-time communication
 */
class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private isConnected = false;
  private currentUserId = '';
  private onlineUsers = new Set<string>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Connects to the Socket.IO server
   */
  connect(userId: string, token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.currentUserId = userId;
        
        // Initialize socket connection
        this.socket = io('https://chat.pabup.com', {
          auth: {
            userId: userId,
            token: token
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 5000,
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('Connected to chat server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connection', { connected: true, userId });
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.isConnected = false;
          
          if (this.reconnectAttempts === 0) {
            reject(new Error(`Failed to connect to chat server: ${error.message}`));
          }
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from chat server:', reason);
          this.isConnected = false;
          this.emit('connection', { connected: false, reason });
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.handleReconnection();
          }
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attemptNumber) => {
          this.reconnectAttempts = attemptNumber;
          console.log(`Reconnection attempt ${attemptNumber}`);
          this.emit('connection', { reconnecting: true, attempt: attemptNumber });
        });

        // Reconnection successful
        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`Reconnected after ${attemptNumber} attempts`);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connection', { reconnected: true, attempts: attemptNumber });
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect to chat server');
          this.isConnected = false;
          this.emit('connection', { reconnectFailed: true });
        });

        // Listen for incoming messages
        this.socket.on('message_received', (data) => {
          this.emit('message_received', data);
        });

        // Listen for typing indicators
        this.socket.on('typing', (data) => {
          this.emit('typing', data);
        });

        // Listen for online status updates
        this.socket.on('user_online', (data) => {
          this.onlineUsers.add(data.userId);
          this.emit('online_status', { userId: data.userId, isOnline: true });
        });

        this.socket.on('user_offline', (data) => {
          this.onlineUsers.delete(data.userId);
          this.emit('online_status', { userId: data.userId, isOnline: false });
        });

        // Listen for notifications
        this.socket.on('notification', (data) => {
          this.emit('notification', data);
        });

        // Listen for connection requests
        this.socket.on('connection_request', (data) => {
          this.emit('connection_request_sent', data);
        });

        // Get initial online users
        this.socket.on('online_users', (users) => {
          this.onlineUsers = new Set(users);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnects from the Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.onlineUsers.clear();
  }

  /**
   * Subscribes to socket events
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribes from socket events
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emits an event to all listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const socketEvent: SocketEvent = {
        type: event as any,
        data,
        timestamp: new Date()
      };
      callbacks.forEach(callback => callback(socketEvent));
    }
  }

  /**
   * Sends a message through the socket
   */
  sendMessage(receiverId: string, content: string): void {
    if (!this.isConnected || !this.socket) {
      console.warn('Cannot send message: not connected to chat server');
      return;
    }

    const messageData = {
      receiverId,
      content,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('send_message', messageData);
  }

  /**
   * Sends typing indicator
   */
  sendTypingIndicator(receiverId: string, isTyping: boolean): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('typing', {
      receiverId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Sends a connection request
   */
  sendConnectionRequest(receiverId: string, message: string): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('connection_request', {
      receiverId,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Joins a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('join_conversation', { conversationId });
  }

  /**
   * Leaves a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('leave_conversation', { conversationId });
  }

  /**
   * Gets the list of online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers);
  }

  /**
   * Checks if a user is online
   */
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Gets connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Handles reconnection logic
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('connection', { maxReconnectAttemptsReached: true });
      return;
    }

    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        console.log('Attempting to reconnect...');
        this.socket.connect();
      }
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  /**
   * Manually trigger reconnection
   */
  reconnect(): void {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();