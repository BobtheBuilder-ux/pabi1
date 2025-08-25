// Mock Socket.IO service for real-time features
// In a real application, this would connect to an actual Socket.IO server

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

type EventCallback = (event: SocketEvent) => void;

/**
 * Mock Socket.IO service that simulates real-time communication
 * Provides typing indicators, online status, and live notifications
 */
class MockSocketService {
  private listeners: Map<string, EventCallback[]> = new Map();
  private isConnected = false;
  private currentUserId = 'current-user';
  private onlineUsers = new Set<string>(['pacific-user', 'sarah-johnson']);
  private typingUsers = new Map<string, number>();

  /**
   * Connects to the mock socket server
   */
  connect(userId: string): Promise<void> {
    return new Promise((resolve) => {
      this.currentUserId = userId;
      this.isConnected = true;
      
      // Simulate connection delay
      setTimeout(() => {
        this.emit('connection', { connected: true, userId });
        this.startMockEvents();
        resolve();
      }, 1000);
    });
  }

  /**
   * Disconnects from the mock socket server
   */
  disconnect(): void {
    this.isConnected = false;
    this.listeners.clear();
    this.typingUsers.clear();
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
  sendMessage(receiverId: string, message: string): void {
    if (!this.isConnected) return;

    // Simulate message sending
    setTimeout(() => {
      this.emit('message_sent', {
        id: Date.now().toString(),
        senderId: this.currentUserId,
        receiverId,
        content: message,
        timestamp: new Date()
      });
    }, 100);

    // Simulate receiving a response (mock)
    if (Math.random() > 0.3) {
      setTimeout(() => {
        this.emit('message_received', {
          id: (Date.now() + 1).toString(),
          senderId: receiverId,
          receiverId: this.currentUserId,
          content: this.generateMockResponse(message),
          timestamp: new Date()
        });
      }, 2000 + Math.random() * 3000);
    }
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

// Export singleton instance
export const socketService = new MockSocketService();