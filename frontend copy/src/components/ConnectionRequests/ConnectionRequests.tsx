import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';

// Mock data types
interface ConnectionRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderTitle: string;
  senderCompany: string;
  message?: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
  type: 'incoming' | 'outgoing';
}

interface ConnectionRequestsProps {
  className?: string;
}

/**
 * ConnectionRequests component that displays incoming and outgoing connection requests
 * with accept/reject functionality and custom messages
 */
export const ConnectionRequests: React.FC<ConnectionRequestsProps> = ({ className }) => {
  const [requests, setRequests] = useState<ConnectionRequest[]>([
    {
      id: '1',
      senderId: 'user-1',
      senderName: 'Sarah Johnson',
      senderAvatar: '/profile-image-1.png',
      senderTitle: 'Product Manager',
      senderCompany: 'Tech Corp',
      message: 'Hi! I\'d love to connect and discuss potential collaboration opportunities.',
      timestamp: new Date('2024-01-15T10:30:00'),
      status: 'pending',
      type: 'incoming'
    },
    {
      id: '2',
      senderId: 'user-2',
      senderName: 'Michael Chen',
      senderAvatar: '/profile-image-2.png',
      senderTitle: 'Software Engineer',
      senderCompany: 'StartupXYZ',
      message: 'Hello! I saw your profile and would like to connect. We have similar interests in AI.',
      timestamp: new Date('2024-01-15T09:15:00'),
      status: 'pending',
      type: 'incoming'
    },
    {
      id: '3',
      senderId: 'user-3',
      senderName: 'Emily Rodriguez',
      senderAvatar: '/profile-image.png',
      senderTitle: 'Marketing Director',
      senderCompany: 'Creative Agency',
      timestamp: new Date('2024-01-14T16:45:00'),
      status: 'pending',
      type: 'outgoing'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  /**
   * Handles accepting a connection request
   */
  const handleAcceptRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'accepted' as const }
        : req
    ));
    
    const request = requests.find(req => req.id === requestId);
    toast.success(`Connection request from ${request?.senderName} accepted!`);
  };

  /**
   * Handles rejecting a connection request
   */
  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'rejected' as const }
        : req
    ));
    
    const request = requests.find(req => req.id === requestId);
    toast.success(`Connection request from ${request?.senderName} rejected.`);
  };

  /**
   * Handles withdrawing an outgoing connection request
   */
  const handleWithdrawRequest = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Connection request withdrawn.');
  };

  /**
   * Filters requests based on active tab and status
   */
  const getFilteredRequests = () => {
    return requests.filter(req => 
      req.type === activeTab && req.status === 'pending'
    );
  };

  /**
   * Gets the count of pending requests for each tab
   */
  const getRequestCount = (type: 'incoming' | 'outgoing') => {
    return requests.filter(req => req.type === type && req.status === 'pending').length;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Connection Requests</span>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'incoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('incoming')}
              className="relative"
            >
              Incoming
              {getRequestCount('incoming') > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-red-500 text-white text-xs min-w-[20px] h-5"
                >
                  {getRequestCount('incoming')}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'outgoing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('outgoing')}
              className="relative"
            >
              Outgoing
              {getRequestCount('outgoing') > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-blue-500 text-white text-xs min-w-[20px] h-5"
                >
                  {getRequestCount('outgoing')}
                </Badge>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          {getFilteredRequests().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No {activeTab} connection requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredRequests().map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.senderAvatar} alt={request.senderName} />
                      <AvatarFallback>{request.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {request.senderName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {request.senderTitle} at {request.senderCompany}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {request.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      
                      {request.message && (
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 flex space-x-2">
                        {activeTab === 'incoming' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWithdrawRequest(request.id)}
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};