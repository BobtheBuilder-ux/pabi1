import { type Socket as ClientSocket, connect } from 'socket.io-client';

export interface SocketEvent {
  type: 'message' | 'typing' | 'online_status' | 'notification' | 'connection_request';
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

export interface MessageData {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text';
  fileName?: string;
  createdAt: string;
  isRead: boolean;
  updatedAt: string;
  deletedAt?: string;
  parentMessageId?: string;
}

type EventCallback = (event: SocketEvent) => void;

/**
 * Real Socket.IO service for real-time messaging communication
 * Connects to https://chat.pabup.com and handles message events
 */
class SocketService {
  private listeners: Map<string, EventCallback[]> = new Map();
  private socket: ClientSocket | null = null;
  private isConnected = false;
  private currentUserId: string | null = null;
  private onlineUsers = new Set<string>();
  private typingUsers = new Map<string, number>();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly SOCKET_URL = 'https://chat.pabup.com';  // Use direct URL instead of proxy
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Connects to the Socket.IO server
   */
  async connect(userId: string): Promise<void> {
    if (this.isConnected && this.socket?.connected) return;

    this.currentUserId = userId;
    this.reconnectAttempts = 0;

    try {
      await this.createSocketConnection();
    } catch (error) {
      console.error('Initial socket connection failed:', error);
      this.handleReconnection();
      throw error; // Re-throw to let the hook handle the error state
    }
  }

  private async createSocketConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = connect(this.SOCKET_URL, {
        auth: { userId: this.currentUserId },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // We handle reconnection manually
      });

      const connectionTimeout = setTimeout(() => {
        if (this.socket) {
          this.socket.disconnect();
        }
        reject(new Error('Connection timeout'));
      }, 10000);

      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.setupSocketListeners();
        console.log(`Socket connected for user: ${this.currentUserId}`);
        this.emit('connection', { userId: this.currentUserId });
        resolve();
      });

      this.socket.on('connect_error', (error: Error) => {
        clearTimeout(connectionTimeout);
        this.isConnected = false;
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason: string) => {
        this.isConnected = false;
        console.log('Socket disconnected:', reason);
        
        if (reason !== 'io client disconnect') {
          this.handleReconnection();
        }
      });
    });
  }

  private handleReconnection(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      this.emit('connection_failed', { error: 'Max reconnection attempts reached' });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(async () => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
      try {
        await this.createSocketConnection();
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
      }
    }, delay);
  }

  /**
   * Sets up Socket.IO event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Listen for incoming messages
    this.socket.on('message', (data: MessageData) => {
      this.emit('message_received', data);
    });

    // Listen for typing indicators
    this.socket.on('typing', (data: TypingIndicator) => {
      this.emit('typing', data);
    });

    // Listen for online status updates
    this.socket.on('online_status', (data: OnlineStatus) => {
      this.emit('online_status', data);
    });

    // Listen for notifications
    this.socket.on('notification', (data: any) => {
      this.emit('notification', data);
    });
    
    // Listen for conversation history
    this.socket.on('conversation_history', (data: MessageData[]) => {
      this.emit('conversation_history', data);
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    // Handle reconnection
    this.socket.on('reconnect', () => {
      console.log('Socket reconnected');
      this.isConnected = true;
    });
  }

  /**
   * Disconnects from the socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.onlineUsers.clear();
    this.typingUsers.forEach(timeout => clearTimeout(timeout));
    this.typingUsers.clear();
    console.log('Socket disconnected');
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
  sendMessage(conversationId: string, content: string, messageId?: string): void {
    if (!this.isConnected || !this.socket || !this.currentUserId) {
      console.error('Socket not connected or user not authenticated');
      return;
    }

    const messageData = {
      messageId: messageId || this.generateMessageId(),
      conversationId,
      senderId: this.currentUserId,
      content,
      type: 'text' as const,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Emit sendMessage event to server
    this.socket.emit('sendMessage', messageData);
    
    console.log('Message sent:', messageData);
  }

  /**
   * Edits a message through the socket
   */
  editMessage(messageId: string, content: string): void {
    if (!this.isConnected || !this.socket || !this.currentUserId) {
      console.error('Socket not connected or user not authenticated');
      return;
    }

    const editData = {
      messageId,
      senderId: this.currentUserId,
      content,
      updatedAt: new Date().toISOString()
    };

    // Emit editMessage event to server
    this.socket.emit('editMessage', editData);
    
    console.log('Message edited:', editData);
  }

  /**
   * Deletes a message through the socket
   */
  deleteMessage(messageId: string): void {
    if (!this.isConnected || !this.socket || !this.currentUserId) {
      console.error('Socket not connected or user not authenticated');
      return;
    }

    const deleteData = {
      messageId,
      senderId: this.currentUserId,
      deletedAt: new Date().toISOString()
    };

    // Emit deleteMessage event to server
    this.socket.emit('deleteMessage', deleteData);
    
    console.log('Message deleted:', deleteData);
  }

  /**
   * Generates a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sends typing indicator
   */
  sendTypingIndicator(receiverId: string, isTyping: boolean): void {
    if (!this.isConnected) return;

    this.emit('typing', {
      userId: this.currentUserId,
      receiverId,
      isTyping,
      timestamp: new Date()
    });

    // Clear existing timeout
    const existingTimeout = this.typingUsers.get(receiverId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      const timeout = setTimeout(() => {
        this.sendTypingIndicator(receiverId, false);
      }, 3000);
      this.typingUsers.set(receiverId, timeout);
    }
  }

  /**
   * Updates online status
   */
  updateOnlineStatus(isOnline: boolean): void {
    if (!this.isConnected) return;

    this.emit('online_status', {
      userId: this.currentUserId,
      isOnline,
      timestamp: new Date()
    });
  }

  /**
   * Sends a connection request
   */
  sendConnectionRequest(receiverId: string, message: string): void {
    if (!this.isConnected) return;

    setTimeout(() => {
      this.emit('connection_request_sent', {
        id: Date.now().toString(),
        senderId: this.currentUserId,
        receiverId,
        message,
        timestamp: new Date()
      });
    }, 500);
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
   * Starts generating mock real-time events
   */
  private startMockEvents(): void {
    // Simulate random online status changes
    setInterval(() => {
      if (!this.isConnected) return;

      const users = ['pacific-user', 'sarah-johnson', 'michael-chen', 'emily-rodriguez'];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const isOnline = Math.random() > 0.5;

      if (isOnline) {
        this.onlineUsers.add(randomUser);
      } else {
        this.onlineUsers.delete(randomUser);
      }

      this.emit('online_status', {
        userId: randomUser,
        isOnline,
        timestamp: new Date()
      });
    }, 15000);

    // Simulate random typing indicators
    setInterval(() => {
      if (!this.isConnected) return;

      if (Math.random() > 0.8) {
        const users = ['pacific-user', 'sarah-johnson'];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        this.emit('typing', {
          userId: randomUser,
          receiverId: this.currentUserId,
          isTyping: true,
          timestamp: new Date()
        });

        // Stop typing after 2-4 seconds
        setTimeout(() => {
          this.emit('typing', {
            userId: randomUser,
            receiverId: this.currentUserId,
            isTyping: false,
            timestamp: new Date()
          });
        }, 2000 + Math.random() * 2000);
      }
    }, 10000);

    // Simulate random notifications
    setInterval(() => {
      if (!this.isConnected) return;

      if (Math.random() > 0.9) {
        const notificationTypes = ['message', 'connection_request', 'profile_view'];
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        this.emit('notification', {
          type: randomType,
          title: `New ${randomType.replace('_', ' ')}`,
          message: 'You have a new activity',
          timestamp: new Date()
        });
      }
    }, 20000);
  }

  /**
   * Generates a mock response to a message
   */
  private generateMockResponse(originalMessage: string): string {
    const responses = [
      'Thanks for your message!',
      'That sounds great!',
      'I agree with you.',
      'Let me think about that.',
      'Absolutely!',
      'That\'s interesting.',
      'I\'ll get back to you on that.',
      'Good point!',
      'Thanks for sharing.',
      'I appreciate your input.'
    ];

    // Simple keyword-based responses
    const lowerMessage = originalMessage.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! How can I help you?';
    }
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome!';
    }
    if (lowerMessage.includes('?')) {
      return 'That\'s a good question. Let me think about it.';
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Export singleton instance and mock functions for testing
export const socketService = new SocketService();
export const startMockEvents = socketService['startMockEvents'].bind(socketService);
export const generateMockResponse = socketService['generateMockResponse'].bind(socketService);