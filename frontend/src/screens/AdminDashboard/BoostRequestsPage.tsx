import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  TrendingUp,
  User,
  Calendar,
} from 'lucide-react';

/**
 * Interface for boost request data structure
 */
interface BoostRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  profileImage?: string;
  requestType: 'profile' | 'post' | 'event';
  boostDuration: '24h' | '7d' | '30d';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reason?: string;
  priority: 'high' | 'medium' | 'low';
  contentPreview?: string;
}

/**
 * Profile boost approval/denial system component
 * Handles boost request queue and moderation tools
 */
export const BoostRequestsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [requests, setRequests] = useState<BoostRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BoostRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRequests] = useState(156); // Mock total count
  const itemsPerPage = 10;

  /**
   * Mock data for boost requests
   */
  useEffect(() => {
    const mockRequests: BoostRequest[] = [
      {
        id: 'BR001',
        userId: 'U001',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@email.com',
        requestType: 'profile',
        boostDuration: '7d',
        amount: 29.99,
        status: 'pending',
        submittedAt: '2024-01-15T10:30:00Z',
        priority: 'high',
        contentPreview: 'Professional photographer looking to expand network...'
      },
      {
        id: 'BR002',
        userId: 'U002',
        userName: 'Michael Chen',
        userEmail: 'michael.c@email.com',
        requestType: 'post',
        boostDuration: '24h',
        amount: 9.99,
        status: 'approved',
        submittedAt: '2024-01-14T15:45:00Z',
        reviewedAt: '2024-01-14T16:30:00Z',
        reviewedBy: 'Admin User',
        priority: 'medium',
        contentPreview: 'Exciting startup opportunity in fintech...'
      },
      {
        id: 'BR003',
        userId: 'U003',
        userName: 'Emma Wilson',
        userEmail: 'emma.w@email.com',
        requestType: 'event',
        boostDuration: '30d',
        amount: 49.99,
        status: 'rejected',
        submittedAt: '2024-01-13T09:15:00Z',
        reviewedAt: '2024-01-13T11:20:00Z',
        reviewedBy: 'Admin User',
        reason: 'Content violates community guidelines',
        priority: 'low',
        contentPreview: 'Networking event for tech professionals...'
      },
    ];
    setRequests(mockRequests);
  }, []);

  /**
   * Filter requests based on search term and filters
   */
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || request.status === filterStatus.toLowerCase();
    const matchesType = filterType === 'All' || request.requestType === filterType.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  /**
   * Handle boost request review (approve/reject)
   */
  const handleReviewRequest = (request: BoostRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };

  /**
   * Submit review decision
   */
  const submitReview = () => {
    if (!selectedRequest || !reviewAction) return;

    const updatedRequests = requests.map(request => {
      if (request.id === selectedRequest.id) {
        return {
            ...request,
            status: (reviewAction === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Current Admin', // In real app, get from auth context
            reason: reviewAction === 'reject' ? reviewReason : undefined
          } as BoostRequest;
      }
      return request;
    });

    setRequests(updatedRequests);
    setIsReviewDialogOpen(false);
    setSelectedRequest(null);
    setReviewAction(null);
    setReviewReason('');
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  /**
   * Get priority badge styling
   */
  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return styles[priority as keyof typeof styles] || styles.medium;
  };

  /**
   * Format currency amount
   */
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Boost Requests</h1>
          <p className="text-gray-600 mt-1">Review and moderate boost requests</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>Pending: {requests.filter(r => r.status === 'pending').length}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrendingUp size={16} />
            <span>Total Revenue: {formatAmount(requests.reduce((sum, r) => sum + (r.status === 'approved' ? r.amount : 0), 0))}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search by user name, email, or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Profile">Profile</SelectItem>
            <SelectItem value="Post">Post</SelectItem>
            <SelectItem value="Event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="capitalize">
                      {request.requestType}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.boostDuration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatAmount(request.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getPriorityBadge(request.priority)}>
                      {request.priority.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusBadge(request.status)}>
                      {request.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>{formatDate(request.submittedAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {/* View details */}}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {request.status === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleReviewRequest(request, 'approve')}
                              className="text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleReviewRequest(request, 'reject')}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
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
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(filteredRequests.length / itemsPerPage)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage)))}
            disabled={currentPage >= Math.ceil(filteredRequests.length / itemsPerPage)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Boost Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="space-y-2">
                  <p>Request ID: <span className="font-medium">{selectedRequest.id}</span></p>
                  <p>User: <span className="font-medium">{selectedRequest.userName}</span></p>
                  <p>Type: <span className="font-medium capitalize">{selectedRequest.requestType}</span></p>
                  <p>Amount: <span className="font-medium">{formatAmount(selectedRequest.amount)}</span></p>
                  {selectedRequest.contentPreview && (
                    <p>Preview: <span className="font-medium">{selectedRequest.contentPreview}</span></p>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {reviewAction === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for rejection:</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Please provide a reason for rejecting this request..."
                value={reviewReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={reviewAction === 'reject' && !reviewReason.trim()}
            >
              {reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};