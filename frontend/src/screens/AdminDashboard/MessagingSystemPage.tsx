import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Bell, Users, Calendar, Filter, Search, Plus, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// TypeScript interfaces for messaging system data
interface SystemMessage {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'maintenance' | 'promotion' | 'warning' | 'info';
  status: 'draft' | 'scheduled' | 'sent' | 'archived';
  targetAudience: 'all' | 'premium' | 'business' | 'individual' | 'inactive';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  recipients: number;
  openRate?: number;
  clickRate?: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'push' | 'in-app';
  category: 'welcome' | 'connection' | 'boost' | 'billing' | 'system';
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface MessagingMetrics {
  totalMessagesSent: number;
  activeTemplates: number;
  averageOpenRate: number;
  averageClickRate: number;
  scheduledMessages: number;
  draftMessages: number;
}

/**
 * MessagingSystemPage component for admin dashboard
 * Provides system messaging and notifications management interface
 */
const MessagingSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'analytics'>('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateMessageOpen, setIsCreateMessageOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SystemMessage | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [metrics, setMetrics] = useState<MessagingMetrics>({
    totalMessagesSent: 0,
    activeTemplates: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    scheduledMessages: 0,
    draftMessages: 0
  });

  const itemsPerPage = 10;

  // Mock data initialization
  useEffect(() => {
    // Mock system messages data
    const mockMessages: SystemMessage[] = [
      {
        id: 'msg-001',
        title: 'Welcome to PABUP 2.0',
        content: 'We are excited to announce the launch of PABUP 2.0 with enhanced networking features and improved user experience.',
        type: 'announcement',
        status: 'sent',
        targetAudience: 'all',
        sentAt: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-14T15:30:00Z',
        createdBy: 'Admin User',
        recipients: 15420,
        openRate: 78.5,
        clickRate: 12.3
      },
      {
        id: 'msg-002',
        title: 'Scheduled Maintenance Notice',
        content: 'We will be performing scheduled maintenance on January 20th from 2:00 AM to 4:00 AM EST. During this time, the platform may be temporarily unavailable.',
        type: 'maintenance',
        status: 'scheduled',
        targetAudience: 'all',
        scheduledAt: '2024-01-18T08:00:00Z',
        createdAt: '2024-01-16T09:15:00Z',
        createdBy: 'System Admin',
        recipients: 15420
      },
      {
        id: 'msg-003',
        title: 'Premium Features Now Available',
        content: 'Unlock advanced networking tools with our new Premium subscription. Get unlimited profile boosts, priority support, and exclusive networking events.',
        type: 'promotion',
        status: 'sent',
        targetAudience: 'individual',
        sentAt: '2024-01-12T14:00:00Z',
        createdAt: '2024-01-11T11:20:00Z',
        createdBy: 'Marketing Team',
        recipients: 8750,
        openRate: 65.2,
        clickRate: 18.7
      },
      {
        id: 'msg-004',
        title: 'Security Update Required',
        content: 'Please update your password to ensure your account remains secure. We have implemented new security measures to protect your data.',
        type: 'warning',
        status: 'draft',
        targetAudience: 'all',
        createdAt: '2024-01-17T16:45:00Z',
        createdBy: 'Security Team',
        recipients: 0
      },
      {
        id: 'msg-005',
        title: 'New Connection Features',
        content: 'Discover new ways to connect with professionals in your industry. Our enhanced matching algorithm helps you find the most relevant connections.',
        type: 'info',
        status: 'sent',
        targetAudience: 'business',
        sentAt: '2024-01-10T12:30:00Z',
        createdAt: '2024-01-09T14:10:00Z',
        createdBy: 'Product Team',
        recipients: 6670,
        openRate: 72.1,
        clickRate: 15.4
      }
    ];

    // Mock notification templates data
    const mockTemplates: NotificationTemplate[] = [
      {
        id: 'tpl-001',
        name: 'Welcome Email',
        subject: 'Welcome to PABUP - Start Networking Today!',
        content: 'Welcome {{firstName}}! Thank you for joining PABUP. Complete your profile to start connecting with professionals in your industry.',
        type: 'email',
        category: 'welcome',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        lastUsed: '2024-01-17T09:30:00Z',
        usageCount: 1250
      },
      {
        id: 'tpl-002',
        name: 'Connection Request Notification',
        subject: 'New Connection Request from {{senderName}}',
        content: '{{senderName}} wants to connect with you on PABUP. View their profile and respond to their request.',
        type: 'push',
        category: 'connection',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        lastUsed: '2024-01-17T16:20:00Z',
        usageCount: 3420
      },
      {
        id: 'tpl-003',
        name: 'Profile Boost Confirmation',
        subject: 'Your Profile Boost is Now Active',
        content: 'Your profile boost has been activated and will run for {{duration}}. Your profile visibility has been increased significantly.',
        type: 'email',
        category: 'boost',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        lastUsed: '2024-01-16T14:15:00Z',
        usageCount: 890
      },
      {
        id: 'tpl-004',
        name: 'Payment Reminder',
        subject: 'Payment Due - {{planName}} Subscription',
        content: 'Your {{planName}} subscription payment of {{amount}} is due on {{dueDate}}. Please update your payment method to continue enjoying premium features.',
        type: 'email',
        category: 'billing',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        lastUsed: '2024-01-15T11:00:00Z',
        usageCount: 567
      },
      {
        id: 'tpl-005',
        name: 'System Maintenance Alert',
        subject: 'Scheduled Maintenance Notification',
        content: 'PABUP will undergo scheduled maintenance on {{maintenanceDate}} from {{startTime}} to {{endTime}}. The platform may be temporarily unavailable.',
        type: 'in-app',
        category: 'system',
        isActive: false,
        createdAt: '2024-01-01T10:00:00Z',
        lastUsed: '2024-01-10T08:00:00Z',
        usageCount: 45
      }
    ];

    // Mock messaging metrics
    const mockMetrics: MessagingMetrics = {
      totalMessagesSent: 45680,
      activeTemplates: 12,
      averageOpenRate: 71.2,
      averageClickRate: 15.8,
      scheduledMessages: 3,
      draftMessages: 7
    };

    setMessages(mockMessages);
    setTemplates(mockTemplates);
    setMetrics(mockMetrics);
  }, []);

  /**
   * Filter messages based on search term, status, and type
   */
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesType = typeFilter === 'all' || message.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  /**
   * Filter templates based on search term
   */
  const filteredTemplates = templates.filter(template => {
    return template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.subject.toLowerCase().includes(searchTerm.toLowerCase());
  });

  /**
   * Get paginated data
   */
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  /**
   * Get total pages for pagination
   */
  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get type badge styling
   */
  const getTypeBadge = (type: string) => {
    const styles = {
      announcement: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      promotion: 'bg-purple-100 text-purple-800',
      warning: 'bg-red-100 text-red-800',
      info: 'bg-green-100 text-green-800'
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Handle message action (edit, delete, duplicate)
   */
  const handleMessageAction = (action: string, messageId: string) => {
    console.log(`${action} message:`, messageId);
    // TODO: Implement actual message actions
  };

  /**
   * Handle template action (edit, delete, duplicate)
   */
  const handleTemplateAction = (action: string, templateId: string) => {
    console.log(`${action} template:`, templateId);
    // TODO: Implement actual template actions
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messaging System</h1>
          <p className="text-gray-600">Manage system messages and notification templates</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setIsCreateMessageOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsCreateTemplateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalMessagesSent.toLocaleString()}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeTemplates}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageOpenRate}%</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageClickRate}%</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.scheduledMessages}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.draftMessages}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'messages', label: 'System Messages', icon: MessageSquare },
            { id: 'templates', label: 'Templates', icon: Bell },
            { id: 'analytics', label: 'Analytics', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={activeTab === 'messages' ? 'Search messages...' : 'Search templates...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {activeTab === 'messages' && (
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'messages' && (
        <Card>
          <CardHeader>
            <CardTitle>System Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(filteredMessages).map((message) => (
                <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{message.title}</h3>
                        <Badge className={getStatusBadge(message.status)}>
                          {message.status}
                        </Badge>
                        <Badge className={getTypeBadge(message.type)}>
                          {message.type}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{message.content}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Target: {message.targetAudience}</span>
                        <span>Recipients: {message.recipients.toLocaleString()}</span>
                        <span>Created: {formatDate(message.createdAt)}</span>
                        {message.sentAt && <span>Sent: {formatDate(message.sentAt)}</span>}
                        {message.openRate && <span>Open Rate: {message.openRate}%</span>}
                        {message.clickRate && <span>Click Rate: {message.clickRate}%</span>}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleMessageAction('view', message.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMessageAction('edit', message.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMessageAction('duplicate', message.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleMessageAction('delete', message.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {getTotalPages(filteredMessages.length) > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMessages.length)} of {filteredMessages.length} messages
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {getTotalPages(filteredMessages.length)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(filteredMessages.length)))}
                    disabled={currentPage === getTotalPages(filteredMessages.length)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(filteredTemplates).map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {template.type}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {template.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-900 text-sm font-medium mb-1">{template.subject}</p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.content}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Created: {formatDate(template.createdAt)}</span>
                        {template.lastUsed && <span>Last Used: {formatDate(template.lastUsed)}</span>}
                        <span>Usage Count: {template.usageCount}</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTemplateAction('edit', template.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTemplateAction('duplicate', template.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleTemplateAction('toggle', template.id)}
                          className={template.isActive ? 'text-orange-600' : 'text-green-600'}
                        >
                          {template.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleTemplateAction('delete', template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {getTotalPages(filteredTemplates.length) > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTemplates.length)} of {filteredTemplates.length} templates
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {getTotalPages(filteredTemplates.length)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(filteredTemplates.length)))}
                    disabled={currentPage === getTotalPages(filteredTemplates.length)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">Total Messages Sent</span>
                  <span className="text-2xl font-bold text-blue-600">{metrics.totalMessagesSent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-900">Average Open Rate</span>
                  <span className="text-2xl font-bold text-green-600">{metrics.averageOpenRate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-900">Average Click Rate</span>
                  <span className="text-2xl font-bold text-purple-600">{metrics.averageClickRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Template Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-900">Active Templates</span>
                  <span className="text-2xl font-bold text-orange-600">{metrics.activeTemplates}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium text-yellow-900">Total Templates</span>
                  <span className="text-2xl font-bold text-yellow-600">{templates.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-900">Inactive Templates</span>
                  <span className="text-2xl font-bold text-red-600">{templates.filter(t => !t.isActive).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Message Dialog */}
      <Dialog open={isCreateMessageOpen} onOpenChange={setIsCreateMessageOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New System Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input placeholder="Enter message title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-md resize-none" 
                rows={4}
                placeholder="Enter message content"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                    <SelectItem value="business">Business Users</SelectItem>
                    <SelectItem value="individual">Individual Users</SelectItem>
                    <SelectItem value="inactive">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateMessageOpen(false)}>Cancel</Button>
              <Button>Save as Draft</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Send Now</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <Input placeholder="Enter template name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <Input placeholder="Enter email subject" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-md resize-none" 
                rows={4}
                placeholder="Enter template content (use {{variable}} for dynamic content)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="in-app">In-App Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="connection">Connection</SelectItem>
                    <SelectItem value="boost">Boost</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>Cancel</Button>
              <Button>Create Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagingSystemPage;