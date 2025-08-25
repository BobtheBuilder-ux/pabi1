import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Eye, MessageSquare, Calendar, Download, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// TypeScript interfaces for analytics data
interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
}

interface ChartData {
  date: string;
  revenue: number;
  users: number;
  engagement: number;
}

interface UserMetrics {
  dau: number;
  wau: number;
  mau: number;
  retention: number;
  churn: number;
}

interface EngagementMetrics {
  totalConnections: number;
  messagesExchanged: number;
  profileViews: number;
  searchQueries: number;
  averageSessionTime: string;
}

interface RevenueMetrics {
  totalRevenue: number;
  subscriptionRevenue: number;
  boostRevenue: number;
  averageRevenuePerUser: number;
  monthlyRecurringRevenue: number;
}

/**
 * AnalyticsPage component for admin dashboard
 * Provides comprehensive analytics with charts and metrics
 */
const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    dau: 0,
    wau: 0,
    mau: 0,
    retention: 0,
    churn: 0
  });
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics>({
    totalConnections: 0,
    messagesExchanged: 0,
    profileViews: 0,
    searchQueries: 0,
    averageSessionTime: '0m'
  });
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    subscriptionRevenue: 0,
    boostRevenue: 0,
    averageRevenuePerUser: 0,
    monthlyRecurringRevenue: 0
  });

  // Mock data initialization
  useEffect(() => {
    // Mock metric cards data
    const mockMetricCards: MetricCard[] = [
      {
        title: 'Total Revenue',
        value: '$124,580',
        change: 12.5,
        changeType: 'increase',
        icon: DollarSign,
        color: 'text-green-600'
      },
      {
        title: 'Active Users',
        value: '8,429',
        change: 8.2,
        changeType: 'increase',
        icon: Users,
        color: 'text-blue-600'
      },
      {
        title: 'Engagement Rate',
        value: '73.4%',
        change: -2.1,
        changeType: 'decrease',
        icon: Activity,
        color: 'text-purple-600'
      },
      {
        title: 'Profile Views',
        value: '45,231',
        change: 15.8,
        changeType: 'increase',
        icon: Eye,
        color: 'text-orange-600'
      }
    ];

    // Mock chart data for the last 30 days
    const mockChartData: ChartData[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 2000,
        users: Math.floor(Math.random() * 500) + 200,
        engagement: Math.floor(Math.random() * 100) + 50
      };
    });

    // Mock user metrics
    const mockUserMetrics: UserMetrics = {
      dau: 2847,
      wau: 12456,
      mau: 34821,
      retention: 78.5,
      churn: 4.2
    };

    // Mock engagement metrics
    const mockEngagementMetrics: EngagementMetrics = {
      totalConnections: 15678,
      messagesExchanged: 89234,
      profileViews: 234567,
      searchQueries: 45123,
      averageSessionTime: '12m 34s'
    };

    // Mock revenue metrics
    const mockRevenueMetrics: RevenueMetrics = {
      totalRevenue: 124580,
      subscriptionRevenue: 89400,
      boostRevenue: 35180,
      averageRevenuePerUser: 3.58,
      monthlyRecurringRevenue: 89400
    };

    setMetricCards(mockMetricCards);
    setChartData(mockChartData);
    setUserMetrics(mockUserMetrics);
    setEngagementMetrics(mockEngagementMetrics);
    setRevenueMetrics(mockRevenueMetrics);
  }, [timeRange]);

  /**
   * Format currency values
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  /**
   * Format percentage values
   */
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  /**
   * Format number with commas
   */
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  /**
   * Simple line chart component using SVG
   */
  const SimpleLineChart: React.FC<{ data: ChartData[]; dataKey: keyof ChartData; color: string; title: string }> = ({ data, dataKey, color, title }) => {
    const maxValue = Math.max(...data.map(d => Number(d[dataKey])));
    const minValue = Math.min(...data.map(d => Number(d[dataKey])));
    const range = maxValue - minValue || 1;
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 300;
      const y = 100 - ((Number(item[dataKey]) - minValue) / range) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <div className="h-24 w-full">
          <svg width="100%" height="100%" viewBox="0 0 300 100" className="overflow-visible">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 300;
              const y = 100 - ((Number(item[dataKey]) - minValue) / range) * 80;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  className="hover:r-4 transition-all"
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance metrics and user engagement</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {metric.changeType === 'increase' ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={chartData} 
              dataKey="revenue" 
              color="#10b981" 
              title="Daily Revenue ($)"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={chartData} 
              dataKey="users" 
              color="#3b82f6" 
              title="Daily Active Users"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={chartData} 
              dataKey="engagement" 
              color="#8b5cf6" 
              title="Daily Engagement (%)"
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              User Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Daily Active Users (DAU)</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(userMetrics.dau)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Weekly Active Users (WAU)</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(userMetrics.wau)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Monthly Active Users (MAU)</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(userMetrics.mau)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Retention Rate</span>
                <span className="text-lg font-bold text-green-600">{formatPercentage(userMetrics.retention)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-gray-600">Churn Rate</span>
                <span className="text-lg font-bold text-red-600">{formatPercentage(userMetrics.churn)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Connections</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(engagementMetrics.totalConnections)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Messages Exchanged</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(engagementMetrics.messagesExchanged)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Profile Views</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(engagementMetrics.profileViews)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Search Queries</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(engagementMetrics.searchQueries)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Avg Session Time</span>
                <span className="text-lg font-bold text-blue-600">{engagementMetrics.averageSessionTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Revenue Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Revenue</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(revenueMetrics.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Subscription Revenue</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(revenueMetrics.subscriptionRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Boost Revenue</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(revenueMetrics.boostRevenue)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">ARPU</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(revenueMetrics.averageRevenuePerUser)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-gray-600">MRR</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(revenueMetrics.monthlyRecurringRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(userMetrics.mau)}</div>
              <div className="text-sm text-gray-600">Monthly Active Users</div>
              <div className="text-xs text-green-600 mt-1">↗ +8.2% from last month</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(revenueMetrics.totalRevenue)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-green-600 mt-1">↗ +12.5% from last month</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">73.4%</div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
              <div className="text-xs text-red-600 mt-1">↘ -2.1% from last month</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatPercentage(userMetrics.retention)}</div>
              <div className="text-sm text-gray-600">User Retention</div>
              <div className="text-xs text-green-600 mt-1">↗ +3.8% from last month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;