import React, { useState, useEffect } from 'react';
import { Ticket, MessageSquare, User, Clock, Search, Filter, Plus, Eye, MoreHorizontal, AlertTriangle, CheckCircle, XCircle, Calendar, Tag, Users, TrendingUp, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';


// TypeScript interfaces for ticket system data
interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: 'individual' | 'business';
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'feature_request' | 'bug_report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  attachments?: string[];
  responseTime?: number; // in hours
  resolutionTime?: number; // in hours
}

interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin';
  message: string;
  timestamp: string;
  attachments?: string[];
  isInternal: boolean;
}

interface TicketAgent {
  id: string;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
  assignedTickets: number;
  resolvedTickets: number;
  averageResponseTime: number; // in hours
}

interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
  ticketsToday: number;
}

/**
 * TicketSystemPage component for admin dashboard
 * Provides comprehensive support ticket management with categorization and assignment
 */
const TicketSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'agents' | 'analytics'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
    assignedTo: ''
  });
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [agents, setAgents] = useState<TicketAgent[]>([]);
  const [metrics, setMetrics] = useState<TicketMetrics>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    averageResponseTime: 0,
    averageResolutionTime: 0,
    customerSatisfaction: 0,
    ticketsToday: 0
  });

  const itemsPerPage = 15;

  // Mock data initialization
  useEffect(() => {
    // Mock support tickets data
    const mockTickets: SupportTicket[] = [
      {
        id: 'ticket-001',
        ticketNumber: 'PABUP-2024-001',
        userId: 'user-001',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@email.com',
        userType: 'business',
        subject: 'Unable to update profile information',
        description: 'I am experiencing issues when trying to update my business profile. The save button does not respond when clicked.',
        category: 'technical',
        priority: 'high',
        status: 'open',
        assignedTo: 'agent-001',
        assignedToName: 'John Smith',
        createdAt: '2024-01-17T14:30:00Z',
        updatedAt: '2024-01-17T14:30:00Z',
        tags: ['profile', 'ui-bug'],
        responseTime: 2
      },
      {
        id: 'ticket-002',
        ticketNumber: 'PABUP-2024-002',
        userId: 'user-002',
        userName: 'Michael Chen',
        userEmail: 'michael.c@email.com',
        userType: 'individual',
        subject: 'Billing inquiry about subscription charges',
        description: 'I was charged twice for my premium subscription this month. Please help me understand why this happened.',
        category: 'billing',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: 'agent-002',
        assignedToName: 'Emma Wilson',
        createdAt: '2024-01-17T12:15:00Z',
        updatedAt: '2024-01-17T13:45:00Z',
        tags: ['billing', 'subscription'],
        responseTime: 1.5,
        resolutionTime: 4
      },
      {
        id: 'ticket-003',
        ticketNumber: 'PABUP-2024-003',
        userId: 'user-003',
        userName: 'Emma Wilson',
        userEmail: 'emma.w@email.com',
        userType: 'business',
        subject: 'Feature request: Advanced search filters',
        description: 'It would be great to have more advanced search filters to find connections based on specific criteria like industry, location, and experience level.',
        category: 'feature_request',
        priority: 'low',
        status: 'pending',
        assignedTo: 'agent-003',
        assignedToName: 'David Brown',
        createdAt: '2024-01-17T10:30:00Z',
        updatedAt: '2024-01-17T11:00:00Z',
        tags: ['feature', 'search', 'enhancement'],
        responseTime: 0.5
      },
      {
        id: 'ticket-004',
        ticketNumber: 'PABUP-2024-004',
        userId: 'user-004',
        userName: 'David Brown',
        userEmail: 'david.b@email.com',
        userType: 'individual',
        subject: 'Account locked after multiple login attempts',
        description: 'My account has been locked after I tried to log in several times with the wrong password. How can I unlock it?',
        category: 'account',
        priority: 'urgent',
        status: 'resolved',
        assignedTo: 'agent-001',
        assignedToName: 'John Smith',
        createdAt: '2024-01-16T16:20:00Z',
        updatedAt: '2024-01-16T17:30:00Z',
        resolvedAt: '2024-01-16T17:30:00Z',
        tags: ['account', 'security', 'locked'],
        responseTime: 0.25,
        resolutionTime: 1.17
      },
      {
        id: 'ticket-005',
        ticketNumber: 'PABUP-2024-005',
        userId: 'user-005',
        userName: 'Lisa Anderson',
        userEmail: 'lisa.a@email.com',
        userType: 'business',
        subject: 'Bug report: Messages not sending',
        description: 'When I try to send messages to my connections, they appear to send but the recipients are not receiving them.',
        category: 'bug_report',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 'agent-002',
        assignedToName: 'Emma Wilson',
        createdAt: '2024-01-16T14:45:00Z',
        updatedAt: '2024-01-17T09:30:00Z',
        tags: ['messaging', 'bug', 'critical'],
        responseTime: 3,
        resolutionTime: 18
      },
      {
        id: 'ticket-006',
        ticketNumber: 'PABUP-2024-006',
        userId: 'user-006',
        userName: 'James Wilson',
        userEmail: 'james.w@email.com',
        userType: 'individual',
        subject: 'General inquiry about premium features',
        description: 'I would like to know more about the premium features available and how they can benefit my networking activities.',
        category: 'general',
        priority: 'low',
        status: 'closed',
        assignedTo: 'agent-003',
        assignedToName: 'David Brown',
        createdAt: '2024-01-15T11:20:00Z',
        updatedAt: '2024-01-15T15:45:00Z',
        resolvedAt: '2024-01-15T15:45:00Z',
        tags: ['premium', 'inquiry', 'features'],
        responseTime: 2,
        resolutionTime: 4.42
      }
    ];

    // Mock ticket agents data
    const mockAgents: TicketAgent[] = [
      {
        id: 'agent-001',
        name: 'John Smith',
        email: 'john.smith@pabup.com',
        department: 'Technical Support',
        isActive: true,
        assignedTickets: 8,
        resolvedTickets: 45,
        averageResponseTime: 1.2
      },
      {
        id: 'agent-002',
        name: 'Emma Wilson',
        email: 'emma.wilson@pabup.com',
        department: 'Billing Support',
        isActive: true,
        assignedTickets: 6,
        resolvedTickets: 38,
        averageResponseTime: 2.1
      },
      {
        id: 'agent-003',
        name: 'David Brown',
        email: 'david.brown@pabup.com',
        department: 'General Support',
        isActive: true,
        assignedTickets: 4,
        resolvedTickets: 52,
        averageResponseTime: 1.8
      },
      {
        id: 'agent-004',
        name: 'Maria Garcia',
        email: 'maria.garcia@pabup.com',
        department: 'Technical Support',
        isActive: false,
        assignedTickets: 0,
        resolvedTickets: 29,
        averageResponseTime: 2.5
      }
    ];

    // Mock ticket messages data
    const mockMessages: TicketMessage[] = [
      {
        id: 'msg-001',
        ticketId: 'ticket-001',
        senderId: 'user-001',
        senderName: 'Sarah Johnson',
        senderType: 'user',
        message: 'I am experiencing issues when trying to update my business profile. The save button does not respond when clicked.',
        timestamp: '2024-01-17T14:30:00Z',
        isInternal: false
      },
      {
        id: 'msg-002',
        ticketId: 'ticket-001',
        senderId: 'agent-001',
        senderName: 'John Smith',
        senderType: 'admin',
        message: 'Thank you for reporting this issue. I\'m looking into the profile update functionality and will get back to you shortly.',
        timestamp: '2024-01-17T16:30:00Z',
        isInternal: false
      }
    ];

    // Mock metrics
    const mockMetrics: TicketMetrics = {
      totalTickets: 156,
      openTickets: 23,
      inProgressTickets: 18,
      resolvedTickets: 98,
      averageResponseTime: 1.8,
      averageResolutionTime: 6.4,
      customerSatisfaction: 4.2,
      ticketsToday: 7
    };

    setTickets(mockTickets);
    setAgents(mockAgents);
    setTicketMessages(mockMessages);
    setMetrics(mockMetrics);
  }, []);

  /**
   * Filter tickets based on search term, status, category, priority, and assignee
   */
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || ticket.assignedTo === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesAssignee;
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
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get priority badge styling
   */
  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get category badge styling
   */
  const getCategoryBadge = (category: string) => {
    const styles = {
      technical: 'bg-blue-100 text-blue-800',
      billing: 'bg-green-100 text-green-800',
      account: 'bg-purple-100 text-purple-800',
      feature_request: 'bg-indigo-100 text-indigo-800',
      bug_report: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Handle ticket detail view
   */
  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  /**
   * Handle ticket assignment
   */
  const handleAssignTicket = (ticketId: string, agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, assignedTo: agentId, assignedToName: agent?.name }
        : ticket
    ));
  };

  /**
   * Handle ticket status update
   */
  const handleStatusUpdate = (ticketId: string, newStatus: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: newStatus as any, 
            updatedAt: new Date().toISOString(),
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : ticket.resolvedAt
          }
        : ticket
    ));
  };

  /**
   * Handle create new ticket
   */
  const handleCreateTicket = () => {
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: `PABUP-2024-${String(tickets.length + 1).padStart(3, '0')}`,
      userId: 'admin-created',
      userName: 'Admin Created',
      userEmail: 'admin@pabup.com',
      userType: 'business',
      subject: newTicketData.subject,
      description: newTicketData.description,
      category: newTicketData.category as any,
      priority: newTicketData.priority as any,
      status: 'open',
      assignedTo: newTicketData.assignedTo || undefined,
      assignedToName: agents.find(a => a.id === newTicketData.assignedTo)?.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };
    
    setTickets(prev => [newTicket, ...prev]);
    setNewTicketData({
      subject: '',
      description: '',
      category: 'general',
      priority: 'medium',
      assignedTo: ''
    });
    setIsCreateOpen(false);
  };

  /**
   * Handle send message
   */
  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;
    
    const message: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: selectedTicket.id,
      senderId: 'admin-current',
      senderName: 'Admin User',
      senderType: 'admin',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isInternal: false
    };
    
    setTicketMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Ticket System</h1>
          <p className="text-gray-600">Manage customer support tickets with categorization and assignment</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input
                    value={newTicketData.subject}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter ticket subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTicketData.description}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter detailed description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <Select value={newTicketData.category} onValueChange={(value) => setNewTicketData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="bug_report">Bug Report</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <Select value={newTicketData.priority} onValueChange={(value) => setNewTicketData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <Select value={newTicketData.assignedTo} onValueChange={(value) => setNewTicketData(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.filter(agent => agent.isActive).map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateTicket}>Create Ticket</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.openTickets}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.inProgressTickets}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.resolvedTickets}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageResponseTime}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageResolutionTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.customerSatisfaction}/5</p>
              </div>
              <CheckCircle className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.ticketsToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'tickets', label: 'Support Tickets', icon: Ticket },
            { id: 'agents', label: 'Agents', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {activeTab === 'tickets' && (
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'tickets' && (
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(filteredTickets).map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        <Badge className={getStatusBadge(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityBadge(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getCategoryBadge(ticket.category)}>
                          {ticket.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {ticket.userName}
                        </span>
                        <span className="flex items-center">
                          <Ticket className="h-3 w-3 mr-1" />
                          {ticket.ticketNumber}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        {ticket.assignedToName && (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            Assigned to {ticket.assignedToName}
                          </span>
                        )}
                        {ticket.responseTime && (
                          <span>Response: {ticket.responseTime}h</span>
                        )}
                      </div>
                      
                      {ticket.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          {ticket.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(ticket.id, 'resolved')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {getTotalPages(filteredTickets.length) > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
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
                    Page {currentPage} of {getTotalPages(filteredTickets.length)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(filteredTickets.length)))}
                    disabled={currentPage === getTotalPages(filteredTickets.length)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'agents' && (
        <Card>
          <CardHeader>
            <CardTitle>Support Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <Badge className={agent.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{agent.email}</p>
                      <p className="text-gray-600 text-sm mb-2">{agent.department}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Assigned: {agent.assignedTickets}</span>
                        <span>Resolved: {agent.resolvedTickets}</span>
                        <span>Avg Response: {agent.averageResponseTime}h</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Open Tickets</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(metrics.openTickets / metrics.totalTickets) * 100}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{metrics.openTickets}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: `${(metrics.inProgressTickets / metrics.totalTickets) * 100}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{metrics.inProgressTickets}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${(metrics.resolvedTickets / metrics.totalTickets) * 100}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{metrics.resolvedTickets}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Response Time</span>
                  <span className="text-lg font-semibold">{metrics.averageResponseTime} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Resolution Time</span>
                  <span className="text-lg font-semibold">{metrics.averageResolutionTime} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <span className="text-lg font-semibold">{metrics.customerSatisfaction}/5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tickets Created Today</span>
                  <span className="text-lg font-semibold">{metrics.ticketsToday}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details - {selectedTicket?.ticketNumber}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-sm text-gray-900">{selectedTicket.subject}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Badge className={getStatusBadge(selectedTicket.status)}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <Badge className={getPriorityBadge(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Badge className={getCategoryBadge(selectedTicket.category)}>
                    {selectedTicket.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <p className="text-sm text-gray-900">{selectedTicket.assignedToName || 'Unassigned'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedTicket.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-sm text-gray-900">{selectedTicket.userName}</p>
                  <p className="text-xs text-gray-500">{selectedTicket.userEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedTicket.createdAt)}</p>
                </div>
              </div>
              
              {/* Messages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Conversation</label>
                <div className="space-y-3 max-h-60 overflow-y-auto border rounded p-3">
                  {ticketMessages
                    .filter(msg => msg.ticketId === selectedTicket.id)
                    .map((message) => (
                    <div key={message.id} className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.senderType === 'admin' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {message.senderName} • {formatDate(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Send Message */}
                <div className="flex space-x-2 mt-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[80px]"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  <Select value={selectedTicket.assignedTo || ''} onValueChange={(value) => handleAssignTicket(selectedTicket.id, value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign to agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.filter(agent => agent.isActive).map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedTicket.status} onValueChange={(value) => handleStatusUpdate(selectedTicket.id, value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketSystemPage;