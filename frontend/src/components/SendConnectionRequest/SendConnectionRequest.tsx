import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  isConnected: boolean;
  hasPendingRequest: boolean;
}

interface SendConnectionRequestProps {
  user: User;
  onRequestSent?: (userId: string, message: string) => void;
  className?: string;
}

/**
 * SendConnectionRequest component that provides a dialog for sending connection requests
 * with custom messages and handles different connection states
 */
export const SendConnectionRequest: React.FC<SendConnectionRequestProps> = ({ 
  user, 
  onRequestSent,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles sending the connection request
   */
  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast.error('Please add a message to your connection request.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onRequestSent?.(user.id, message);
      toast.success(`Connection request sent to ${user.name}!`);
      setIsOpen(false);
      setMessage('');
    } catch (error) {
      toast.error('Failed to send connection request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets the appropriate button text and variant based on connection status
   */
  const getButtonConfig = () => {
    if (user.isConnected) {
      return {
        text: 'Connected',
        variant: 'outline' as const,
        disabled: true
      };
    }
    
    if (user.hasPendingRequest) {
      return {
        text: 'Request Sent',
        variant: 'outline' as const,
        disabled: true
      };
    }
    
    return {
      text: 'Connect',
      variant: 'default' as const,
      disabled: false
    };
  };

  const buttonConfig = getButtonConfig();

  if (buttonConfig.disabled) {
    return (
      <Button 
        variant={buttonConfig.variant} 
        disabled 
        className={className}
      >
        {buttonConfig.text}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonConfig.variant}
          className={`${className} bg-purple-600 hover:bg-purple-700`}
        >
          {buttonConfig.text}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Connection Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-gray-900">{user.name}</h4>
              <p className="text-sm text-gray-600">{user.title} at {user.company}</p>
            </div>
          </div>
          
          {/* Message Input */}
          <div className="space-y-2">
            <label htmlFor="connection-message" className="text-sm font-medium text-gray-700">
              Add a personal message
            </label>
            <textarea
              id="connection-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi [Name], I'd love to connect with you because..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              maxLength={300}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Make it personal and explain why you'd like to connect</span>
              <span>{message.length}/300</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={isLoading || !message.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};