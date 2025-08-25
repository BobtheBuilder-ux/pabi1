import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
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
  RefreshCw,
  CreditCard,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

/**
 * Interface for subscription data structure
 */
interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  planType: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  nextBillingDate?: string;
  paymentMethod: string;
  gateway: 'stripe' | 'paystack' | 'flutterwave';
  autoRenew: boolean;
  trialEnd?: string;
}

/**
 * Interface for payment transaction data
 */
interface PaymentTransaction {
  id: string;
  subscriptionId: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  gateway: 'stripe' | 'paystack' | 'flutterwave';
  transactionId: string;
  paymentMethod: string;
  processedAt: string;
  description: string;
}

/**
 * Interface for billing metrics
 */
interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  conversionRate: number;
}

/**
 * Subscription and billing oversight dashboard component
 * Handles payment history, plan management, and billing analytics
 */
export const BillingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterGateway, setFilterGateway] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'transactions'>('subscriptions');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'refund' | 'modify' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /**
   * Mock data for billing metrics
   */
  useEffect(() => {
    const mockMetrics: BillingMetrics = {
      totalRevenue: 125430.50,
      monthlyRecurringRevenue: 18750.00,
      activeSubscriptions: 1247,
      churnRate: 3.2,
      averageRevenuePerUser: 89.50,
      conversionRate: 12.8
    };
    setMetrics(mockMetrics);
  }, []);

  /**
   * Mock data for subscriptions
   */
  useEffect(() => {
    const mockSubscriptions: Subscription[] = [
      {
        id: 'SUB001',
        userId: 'U001',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@email.com',
        planName: 'Premium Plan',
        planType: 'premium',
        status: 'active',
        amount: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        nextBillingDate: '2024-02-01T00:00:00Z',
        paymentMethod: 'Visa ****1234',
        gateway: 'stripe',
        autoRenew: true
      },
      {
        id: 'SUB002',
        userId: 'U002',
        userName: 'Michael Chen',
        userEmail: 'michael.c@email.com',
        planName: 'Enterprise Plan',
        planType: 'enterprise',
        status: 'active',
        amount: 99.99,
        currency: 'USD',
        billingCycle: 'yearly',
        startDate: '2023-12-15T00:00:00Z',
        endDate: '2024-12-15T23:59:59Z',
        nextBillingDate: '2024-12-15T00:00:00Z',
        paymentMethod: 'Mastercard ****5678',
        gateway: 'paystack',
        autoRenew: true
      },
      {
        id: 'SUB003',
        userId: 'U003',
        userName: 'Emma Wilson',
        userEmail: 'emma.w@email.com',
        planName: 'Basic Plan',
        planType: 'basic',
        status: 'cancelled',
        amount: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        startDate: '2023-11-01T00:00:00Z',
        endDate: '2024-01-01T23:59:59Z',
        paymentMethod: 'PayPal',
        gateway: 'flutterwave',
        autoRenew: false
      },
    ];
    setSubscriptions(mockSubscriptions);
  }, []);

  /**
   * Mock data for payment transactions
   */
  useEffect(() => {
    const mockTransactions: PaymentTransaction[] = [
      {
        id: 'TXN001',
        subscriptionId: 'SUB001',
        userId: 'U001',
        userName: 'Sarah Johnson',
        amount: 29.99,
        currency: 'USD',
        status: 'completed',
        gateway: 'stripe',
        transactionId: 'pi_1234567890',
        paymentMethod: 'Visa ****1234',
        processedAt: '2024-01-15T10:30:00Z',
        description: 'Premium Plan - Monthly Subscription'
      },
      {
        id: 'TXN002',
        subscriptionId: 'SUB002',
        userId: 'U002',
        userName: 'Michael Chen',
        amount: 99.99,
        currency: 'USD',
        status: 'completed',
        gateway: 'paystack',
        transactionId: 'trx_abcdef123456',
        paymentMethod: 'Mastercard ****5678',
        processedAt: '2024-01-14T15:45:00Z',
        description: 'Enterprise Plan - Yearly Subscription'
      },
      {
        id: 'TXN003',
        subscriptionId: 'SUB004',
        userId: 'U004',
        userName: 'David Brown',
        amount: 19.99,
        currency: 'USD',
        status: 'failed',
        gateway: 'stripe',
        transactionId: 'pi_failed123',
        paymentMethod: 'Visa ****9999',
        processedAt: '2024-01-13T09:15:00Z',
        description: 'Premium Plan - Monthly Subscription (Failed)'
      },
    ];
    setTransactions(mockTransactions);
  }, []);

  /**
   * Filter subscriptions based on search and filters
   */
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || subscription.status === filterStatus.toLowerCase();
    const matchesGateway = filterGateway === 'All' || subscription.gateway === filterGateway.toLowerCase();
    return matchesSearch && matchesStatus && matchesGateway;
  });

  /**
   * Filter transactions based on search and filters
   */
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || transaction.status === filterStatus.toLowerCase();
    const matchesGateway = filterGateway === 'All' || transaction.gateway === filterGateway.toLowerCase();
    return matchesSearch && matchesStatus && matchesGateway;
  });

  /**
   * Handle subscription actions (cancel, refund, modify)
   */
  const handleSubscriptionAction = (subscription: Subscription, action: 'cancel' | 'refund' | 'modify') => {
    setSelectedSubscription(subscription);
    setActionType(action);
    setIsActionDialogOpen(true);
  };

  /**
   * Execute subscription action
   */
  const executeAction = () => {
    if (!selectedSubscription || !actionType) return;

    // In real app, make API call here
    console.log(`Executing ${actionType} for subscription ${selectedSubscription.id}`);
    
    setIsActionDialogOpen(false);
    setSelectedSubscription(null);
    setActionType(null);
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-orange-100 text-orange-800 border-orange-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  /**
   * Get gateway badge styling
   */
  const getGatewayBadge = (gateway: string) => {
    const styles = {
      stripe: 'bg-purple-100 text-purple-800 border-purple-200',
      paystack: 'bg-blue-100 text-blue-800 border-blue-200',
      flutterwave: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return styles[gateway as keyof typeof styles] || styles.stripe;
  };

  /**
   * Format currency amount
   */
  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
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
          <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
          <p className="text-gray-600 mt-1">Monitor subscriptions, payments, and billing analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw size={16} className="mr-2" />
            Sync Gateways
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(metrics.totalRevenue)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign size={16} className="text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MRR</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(metrics.monthlyRecurringRevenue)}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp size={16} className="text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subs</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeSubscriptions.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users size={16} className="text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.churnRate}%</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ARPU</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(metrics.averageRevenuePerUser)}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <CreditCard size={16} className="text-orange-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <TrendingUp size={16} className="text-indigo-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === 'subscriptions' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === 'transactions' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder={`Search ${activeTab}...`}
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
            {activeTab === 'subscriptions' ? (
              <>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
        <Select value={filterGateway} onValueChange={setFilterGateway}>
          <SelectTrigger className="w-[180px]">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filter by gateway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Gateways</SelectItem>
            <SelectItem value="Stripe">Stripe</SelectItem>
            <SelectItem value="Paystack">Paystack</SelectItem>
            <SelectItem value="Flutterwave">Flutterwave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'subscriptions' ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subscription.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscription.userName}</div>
                        <div className="text-sm text-gray-500">{subscription.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscription.planName}</div>
                        <div className="text-sm text-gray-500 capitalize">{subscription.billingCycle}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(subscription.amount, subscription.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadge(subscription.status)}>
                        {subscription.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getGatewayBadge(subscription.gateway)}>
                        {subscription.gateway.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscription.nextBillingDate ? (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{formatDate(subscription.nextBillingDate)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
                          {subscription.status === 'active' && (
                            <>
                              <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription, 'modify')}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Modify Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSubscriptionAction(subscription, 'cancel')}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleSubscriptionAction(subscription, 'refund')}
                            className="text-orange-600"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Process Refund
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                        <div className="text-sm text-gray-500">{transaction.transactionId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadge(transaction.status)}>
                        {transaction.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getGatewayBadge(transaction.gateway)}>
                        {transaction.gateway.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{formatDate(transaction.processedAt)}</span>
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
                          {transaction.status === 'completed' && (
                            <DropdownMenuItem className="text-orange-600">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Process Refund
                            </DropdownMenuItem>
                          )}
                          {transaction.status === 'failed' && (
                            <DropdownMenuItem className="text-blue-600">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, activeTab === 'subscriptions' ? filteredSubscriptions.length : filteredTransactions.length)} of {activeTab === 'subscriptions' ? filteredSubscriptions.length : filteredTransactions.length} {activeTab}
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
            Page {currentPage} of {Math.ceil((activeTab === 'subscriptions' ? filteredSubscriptions.length : filteredTransactions.length) / itemsPerPage)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil((activeTab === 'subscriptions' ? filteredSubscriptions.length : filteredTransactions.length) / itemsPerPage)))}
            disabled={currentPage >= Math.ceil((activeTab === 'subscriptions' ? filteredSubscriptions.length : filteredTransactions.length) / itemsPerPage)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'cancel' && 'Cancel Subscription'}
              {actionType === 'refund' && 'Process Refund'}
              {actionType === 'modify' && 'Modify Subscription'}
            </DialogTitle>
            <DialogDescription>
              {selectedSubscription && (
                <div className="space-y-2">
                  <p>Subscription ID: <span className="font-medium">{selectedSubscription.id}</span></p>
                  <p>User: <span className="font-medium">{selectedSubscription.userName}</span></p>
                  <p>Plan: <span className="font-medium">{selectedSubscription.planName}</span></p>
                  <p>Amount: <span className="font-medium">{formatAmount(selectedSubscription.amount, selectedSubscription.currency)}</span></p>
                  {actionType === 'cancel' && (
                    <p className="text-red-600 text-sm mt-2">This action will cancel the subscription immediately. The user will lose access at the end of the current billing period.</p>
                  )}
                  {actionType === 'refund' && (
                    <p className="text-orange-600 text-sm mt-2">This will process a refund for the last payment. The subscription may be cancelled depending on your refund policy.</p>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              className={
                actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' :
                actionType === 'refund' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {actionType === 'cancel' && 'Cancel Subscription'}
              {actionType === 'refund' && 'Process Refund'}
              {actionType === 'modify' && 'Modify Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};