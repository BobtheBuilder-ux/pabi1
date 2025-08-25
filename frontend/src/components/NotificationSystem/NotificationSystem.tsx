import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, Users, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';

// Mock data types
interface Notification {
  id: string;
  type: 'message' | 'connection_request' | 'connection_accepted' | 'activity';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  userId?: string;
  actionUrl?: string;
}

interface NotificationSystemProps {
  className?: string;
}

/**
 * NotificationSystem component that displays real-time notifications
 * with different types (messages, connection requests, activities)
 */
export const NotificationSystem: React.FC<NotificationSystemProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New message from Pacific',
      message: 'Awesome thanks! I wanted to discuss...',
      timestamp: new Date('2024-01-15T10:35:00'),
      read: false,
      avatar: '/profile-image.png',
      userId: 'pacific-user',
      actionUrl: '/messages'
    },
    {
      id: '2',
      type: 'connection_request',
      title: 'New connection request',
      message: 'Sarah Johnson wants to connect with you',
      timestamp: new Date('2024-01-15T09:20:00'),
      read: false,
      avatar: '/profile-image-1.png',
      userId: 'sarah-johnson',
      actionUrl: '/my-connections'
    },
    {
      id: '3',
      type: 'connection_accepted',
      title: 'Connection accepted',
      message: 'Michael Chen accepted your connection request',
      timestamp: new Date('2024-01-15T08:45:00'),
      read: true,
      avatar: '/profile-image-2.png',
      userId: 'michael-chen'
    },
    {
      id: '4',
      type: 'activity',
      title: 'Profile view',
      message: 'Your profile was viewed 5 times today',
      timestamp: new Date('2024-01-15T07:30:00'),
      read: true
    }
  ]);

  /**
   * Gets the count of unread notifications
   */
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  /**
   * Gets the appropriate icon for notification type
   */
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'connection_request':
      case 'connection_accepted':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'activity':
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * Handles marking a notification as read
   */
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  /**
   * Handles marking all notifications as read
   */
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  /**
   * Handles deleting a notification
   */
  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  /**
   * Handles clicking on a notification
   */
  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    
    if (notification.actionUrl) {
      // In a real app, you would use router navigation here
      window.location.href = notification.actionUrl;
    }
  };

  /**
   * Simulates receiving new notifications
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random new notifications
      if (Math.random() > 0.8) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'message' : 'connection_request',
          title: 'New notification',
          message: 'You have a new activity',
          timestamp: new Date(),
          read: false,
          avatar: '/profile-image.png'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        toast.info('New notification received!');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {getUnreadCount() > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full p-0"
          >
            {getUnreadCount()}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-80 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {getUnreadCount() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {notification.avatar ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={notification.avatar} alt="User" />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timestamp.toLocaleString()}
                            </p>
                          </div>
                          
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};