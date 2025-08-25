import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Activity,
  Download,
  Filter,
  ArrowUpRight,
} from 'lucide-react';

/**
 * Interface for revenue data
 */
interface RevenueData {
  period: string;
  amount: number;
  change: number;
  trend: 'up' | 'down';
}

/**
 * Interface for metric card data
 */
interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
  color: string;
}

/**
 * Overview dashboard page component
 * Displays key metrics, revenue charts, and analytics data
 */
export const OverviewPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  // Mock data - in production this would come from an API
  useEffect(() => {
    const mockRevenueData: RevenueData[] = [
      { period: 'Jan', amount: 345450, change: 12.5, trend: 'up' },
      { period: 'Feb', amount: 298000, change: -8.2, trend: 'down' },
      { period: 'Mar', amount: 412000, change: 15.3, trend: 'up' },
      { period: 'Apr', amount: 387500, change: 5.8, trend: 'up' },
      { period: 'May', amount: 445200, change: 18.7, trend: 'up' },
      { period: 'Jun', amount: 398750, change: -2.1, trend: 'down' },
    ];
    setRevenueData(mockRevenueData);
  }, []);

  // Key metrics data
  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$345,450.12',
      change: '+3.70%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-green-600',
    },
    {
      title: 'Active Users',
      value: '23,456',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Avg. Transaction Value',
      value: '23.34',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Growth MoM',
      value: '3.70%',
      change: '+1.2%',
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600',
    },
  ];

  // Revenue breakdown data
  const revenueBreakdown = [
    { category: 'Rewards', amount: 113455, color: 'bg-purple-500' },
    { category: 'Refunds', amount: 113455, color: 'bg-green-500' },
    { category: 'Uganda', amount: 113455, color: 'bg-blue-500' },
    { category: 'Products', amount: 113455, color: 'bg-yellow-500' },
    { category: 'Services', amount: 113455, color: 'bg-red-500' },
    { category: 'Events', amount: 113455, color: 'bg-indigo-500' },
  ];

  /**
   * Format currency value
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Get trend icon and color
   */
  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <TrendingUp size={16} className="text-green-600" />
    ) : (
      <TrendingDown size={16} className="text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your platform's performance and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download size={16} className="mr-2" />
            DOWNLOAD
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
        {['All', 'Revenue', 'Accounts', 'Networking', 'Messaging', 'Product & Service Performance', 'Event Scheduling'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              tab === 'All' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm ml-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-opacity-10 ${metric.color.replace('text-', 'bg-')}`}>
                  <Icon size={24} className={metric.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Revenue Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Revenue Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
              <p className="text-sm text-gray-600">vs Prev Month: $235,454</p>
            </div>
            <div className="flex items-center space-x-4">
              {revenueBreakdown.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-600">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mock Chart Area */}
          <div className="h-64 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={48} className="text-purple-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue Chart Visualization</p>
              <p className="text-sm text-gray-400">Chart component would be integrated here</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Button variant="ghost" size="sm" className="text-purple-600">
              Report <ArrowUpRight size={16} className="ml-1" />
            </Button>
          </div>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
            <Button variant="ghost" size="sm" className="text-purple-600">
              Report <ArrowUpRight size={16} className="ml-1" />
            </Button>
          </div>
          
          {/* Mock Pie Chart */}
          <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold">85%</span>
              </div>
              <p className="text-sm text-gray-500">Products & Services</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {revenueBreakdown.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700">{item.category}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Revenue Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trends</h3>
            <Button variant="ghost" size="sm" className="text-purple-600">
              Report <ArrowUpRight size={16} className="ml-1" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4">Revenue on a quarterly basis</p>
          
          {/* Mock Line Chart */}
          <div className="h-32 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
            <TrendingUp size={32} className="text-green-500" />
          </div>
        </Card>

        {/* Revenue by Region */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Region</h3>
            <Button variant="ghost" size="sm" className="text-purple-600">
              Report <ArrowUpRight size={16} className="ml-1" />
            </Button>
          </div>
          
          {/* Mock Bar Chart */}
          <div className="h-32 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <Activity size={32} className="text-purple-500" />
          </div>
        </Card>

        {/* Additional Revenue Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Region</h3>
            <Button variant="ghost" size="sm" className="text-purple-600">
              Report <ArrowUpRight size={16} className="ml-1" />
            </Button>
          </div>
          
          {/* Mock Chart */}
          <div className="h-32 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg flex items-center justify-center">
            <CreditCard size={32} className="text-orange-500" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewPage;