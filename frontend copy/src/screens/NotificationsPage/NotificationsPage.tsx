import { Bell, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

// Define notification types
interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'connection' | 'message' | 'system' | 'update';
}

// Props interface for the NotificationsPage component
interface NotificationsPageProps {
    notifications?: Notification[];
    onMarkAsRead?: (notificationId: string) => void;
    onMarkAllAsRead?: () => void;
    onDeleteNotification?: (notificationId: string) => void;
}

export const NotificationsPage = ({
    notifications: propNotifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification
}: NotificationsPageProps): JSX.Element => {
    const navigate = useNavigate();
    
    // Mock notifications data - TODO: Replace with actual data from props or API
    const [notifications, setNotifications] = useState<Notification[]>(propNotifications || [
        {
            id: '1',
            title: 'New Connection Request',
            message: 'Sarah Johnson wants to connect with you',
            timestamp: '2 hours ago',
            read: false,
            type: 'connection'
        },
        {
            id: '2',
            title: 'Message Received',
            message: 'You have a new message from Alex Chen',
            timestamp: '4 hours ago',
            read: false,
            type: 'message'
        },
        {
            id: '3',
            title: 'Profile Update',
            message: 'Your profile has been successfully updated',
            timestamp: '1 day ago',
            read: true,
            type: 'system'
        },
        {
            id: '4',
            title: 'New Feature Available',
            message: 'Check out our new messaging features!',
            timestamp: '2 days ago',
            read: true,
            type: 'update'
        },
        {
            id: '5',
            title: 'Connection Accepted',
            message: 'Michael Brown accepted your connection request',
            timestamp: '3 days ago',
            read: true,
            type: 'connection'
        }
    ]);

    // Function to handle marking a notification as read
    const handleMarkAsRead = (notificationId: string) => {
        if (onMarkAsRead) {
            onMarkAsRead(notificationId);
        } else {
            // Local state management fallback
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, read: true }
                        : notification
                )
            );
        }
    };

    // Function to handle marking all notifications as read
    const handleMarkAllAsRead = () => {
        if (onMarkAllAsRead) {
            onMarkAllAsRead();
        } else {
            // Local state management fallback
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, read: true }))
            );
        }
    };

    // Function to handle deleting a notification
    const handleDeleteNotification = (notificationId: string) => {
        if (onDeleteNotification) {
            onDeleteNotification(notificationId);
        } else {
            // Local state management fallback
            setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
            );
        }
    };

    // Function to get notification type icon
    const getNotificationTypeIcon = (type: string) => {
        switch (type) {
            case 'connection':
                return '👥';
            case 'message':
                return '💬';
            case 'system':
                return '⚙️';
            case 'update':
                return '🆕';
            default:
                return '📢';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(-1)}
                                className="p-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <Bell className="w-6 h-6 text-[#8a358a]" />
                                <div>
                                    <h1 className="text-2xl font-bold text-[#141b34]">Notifications</h1>
                                    {unreadCount > 0 && (
                                        <p className="text-sm text-gray-600">
                                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleMarkAllAsRead}
                                className="text-[#8a358a] border-[#8a358a] hover:bg-[#8a358a] hover:text-white"
                            >
                                Mark All as Read
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                        <p className="text-gray-500">You're all caught up! Check back later for new notifications.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
                                    notification.read
                                        ? 'border-gray-200'
                                        : 'border-blue-200 bg-blue-50'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="text-2xl">
                                            {getNotificationTypeIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-[#141b34]">
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {notification.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-4">
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="text-[#8a358a] hover:bg-[#8a358a] hover:text-white"
                                            >
                                                Mark as Read
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};