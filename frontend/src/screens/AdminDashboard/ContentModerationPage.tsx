import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, EyeOff, Flag, Trash2, MessageSquare, User, Calendar, AlertTriangle, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// TypeScript interfaces for content moderation data
interface ContentItem {
  id: string;
  type: 'post' | 'comment' | 'message' | 'profile';
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportCount: number;
  createdAt: string;
  lastModerated?: string;
  moderatedBy?: string;
  reason?: string;
  category: 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'hate_speech' | 'misinformation' | 'other';
}

interface ModerationMetrics {
  totalContent: number;
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
  flaggedContent: number;
  averageResponseTime: string;
}

/**
 * ContentModerationPage component for admin dashboard
 * Provides real-time content monitoring and moderation tools
 */
const ContentModerationPage: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [metrics, setMetrics] = useState<ModerationMetrics>({
    totalContent: 0,
    pendingReview: 0,
    approvedToday: 0,
    rejectedToday: 0,
    flaggedContent: 0,
    averageResponseTime: '0m'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | null>(null);
  const [moderationReason, setModerationReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data for content items
  useEffect(() => {
    const mockContentItems: ContentItem[] = [
      {
        id: 'content-001',
        type: 'post',
        content: 'Looking for networking opportunities in tech industry. Anyone interested in collaboration?',
        author: {
          id: 'user-001',
          name: 'John Smith',
          avatar: '/profile-image.png',
          email: 'john.smith@email.com'
        },
        status: 'pending',
        priority: 'medium',
        reportCount: 2,
        createdAt: '2024-01-15T10:30:00Z',
        category: 'other'
      },
      {
        id: 'content-002',
        type: 'comment',
        content: 'This is completely inappropriate and offensive content that violates community guidelines.',
        author: {
          id: 'user-002',
          name: 'Sarah Johnson',
          avatar: '/profile-image-1.png',
          email: 'sarah.j@email.com'
        },
        status: 'flagged',
        priority: 'high',
        reportCount: 8,
        createdAt: '2024-01-15T09:15:00Z',
        category: 'inappropriate'
      },
      {
        id: 'content-003',
        type: 'message',
        content: 'Great opportunity to connect! Let me know if you are interested in discussing further.',
        author: {
          id: 'user-003',
          name: 'Mike Davis',
          avatar: '/profile-image-2.png',
          email: 'mike.davis@email.com'
        },
        status: 'approved',
        priority: 'low',
        reportCount: 0,
        createdAt: '2024-01-15T08:45:00Z',
        lastModerated: '2024-01-15T09:00:00Z',
        moderatedBy: 'admin-001',
        category: 'other'
      },
      {
        id: 'content-004',
        type: 'post',
        content: 'SPAM: Buy our amazing products now! Click here for incredible deals!!!',
        author: {
          id: 'user-004',
          name: 'Spam Account',
          avatar: '/ellipse-10.png',
          email: 'spam@fake.com'
        },
        status: 'rejected',
        priority: 'critical',
        reportCount: 15,
        createdAt: '2024-01-15T07:20:00Z',
        lastModerated: '2024-01-15T07:25:00Z',
        moderatedBy: 'admin-002',
        reason: 'Spam content violating community guidelines',
        category: 'spam'
      },
      {
        id: 'content-005',
        type: 'profile',
        content: 'Profile description contains hate speech and discriminatory language.',
        author: {
          id: 'user-005',
          name: 'Problem User',
          avatar: '/ellipse-10-1.png',
          email: 'problem@user.com'
        },
        status: 'pending',
        priority: 'critical',
        reportCount: 12,
        createdAt: '2024-01-15T06:10:00Z',
        category: 'hate_speech'
      }
    ];

    setContentItems(mockContentItems);
    setFilteredItems(mockContentItems);

    // Mock metrics
    setMetrics({
      totalContent: 1247,
      pendingReview: 23,
      approvedToday: 156,
      rejectedToday: 12,
      flaggedContent: 8,
      averageResponseTime: '4.2m'
    });
  }, []);

  // Filter content items based on search and filters
  useEffect(() => {
    let filtered = contentItems;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [contentItems, searchTerm, statusFilter, typeFilter, priorityFilter]);

  /**
   * Handle content moderation action (approve/reject)
   */
  const handleModerationAction = (action: 'approve' | 'reject', reason?: string) => {
    if (!selectedItem) return;

    const updatedItems = contentItems.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: action === 'approve' ? 'approved' as const : 'rejected' as const,
          lastModerated: new Date().toISOString(),
          moderatedBy: 'current-admin',
          reason: reason || undefined
        };
      }
      return item;
    });

    setContentItems(updatedItems);
    setSelectedItem(null);
    setModerationAction(null);
    setModerationReason('');
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: ContentItem['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      flagged: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return styles[status];
  };

  /**
   * Get priority badge styling
   */
  const getPriorityBadge = (priority: ContentItem['priority']) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[priority];
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

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600">Monitor and moderate user-generated content</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalContent.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.pendingReview}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">{metrics.approvedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold text-red-600">{metrics.rejectedToday}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged Content</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.flaggedContent}</p>
              </div>
              <Flag className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.averageResponseTime}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search content, authors, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="profile">Profiles</SelectItem>
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
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">{item.content}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img className="h-8 w-8 rounded-full" src={item.author.avatar} alt={item.author.name} />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{item.author.name}</p>
                          <p className="text-xs text-gray-500">{item.author.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusBadge(item.status)} capitalize`}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getPriorityBadge(item.priority)} capitalize`}>
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{item.reportCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{formatDate(item.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedItem(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {item.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedItem(item);
                                  setModerationAction('approve');
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedItem(item);
                                  setModerationAction('reject');
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Flag className="mr-2 h-4 w-4" />
                            Flag Content
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Details Dialog */}
      {selectedItem && !moderationAction && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Content Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Content</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedItem.content}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Author</h4>
                  <div className="flex items-center mt-1">
                    <img className="h-8 w-8 rounded-full" src={selectedItem.author.avatar} alt={selectedItem.author.name} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{selectedItem.author.name}</p>
                      <p className="text-xs text-gray-500">{selectedItem.author.email}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <Badge className={`${getStatusBadge(selectedItem.status)} capitalize mt-1`}>
                    {selectedItem.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Type</h4>
                  <p className="text-sm text-gray-600 capitalize">{selectedItem.type}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Priority</h4>
                  <Badge className={`${getPriorityBadge(selectedItem.priority)} capitalize`}>
                    {selectedItem.priority}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Reports</h4>
                  <p className="text-sm text-gray-600">{selectedItem.reportCount}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Created</h4>
                <p className="text-sm text-gray-600">{formatDate(selectedItem.createdAt)}</p>
              </div>
              
              {selectedItem.lastModerated && (
                <div>
                  <h4 className="font-medium text-gray-900">Last Moderated</h4>
                  <p className="text-sm text-gray-600">{formatDate(selectedItem.lastModerated)} by {selectedItem.moderatedBy}</p>
                  {selectedItem.reason && (
                    <p className="text-sm text-gray-500 mt-1">Reason: {selectedItem.reason}</p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Moderation Action Dialog */}
      {selectedItem && moderationAction && (
        <Dialog open={!!moderationAction} onOpenChange={() => {
          setModerationAction(null);
          setModerationReason('');
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {moderationAction === 'approve' ? 'Approve Content' : 'Reject Content'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Content Preview</h4>
                <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded">{selectedItem.content}</p>
              </div>
              
              {moderationAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    value={moderationReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setModerationReason(e.target.value)}
                    placeholder="Provide a reason for rejecting this content..."
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setModerationAction(null);
                    setModerationReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleModerationAction(moderationAction, moderationReason)}
                  className={moderationAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {moderationAction === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentModerationPage;