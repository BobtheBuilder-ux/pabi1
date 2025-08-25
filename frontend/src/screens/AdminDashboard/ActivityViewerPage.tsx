import React, { useState, useEffect } from 'react';
import { Activity, Users, Clock, MapPin, Search, Eye, MoreHorizontal, Calendar, Smartphone, Monitor, Globe, TrendingUp, UserCheck, Heart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// TypeScript interfaces for activity data
interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: 'individual' | 'business';
  activityType: 'login' | 'logout' | 'profile_view' | 'connection_request' | 'message_sent' | 'search' | 'boost_purchase' | 'profile_update';
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  sessionId: string;
  duration?: number; // in minutes
}

interface LoginSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  loginTime: string;
  logoutTime?: string;
  duration?: number; // in minutes
  ipAddress: string;
  location?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userAgent: string;
  isActive: boolean;
}

interface ConnectionActivity {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  activityType: 'request_sent' | 'request_accepted' | 'request_declined' | 'connection_removed';
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'removed';
}

interface ActivityMetrics {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  totalConnections: number;
  newConnectionsToday: number;
  averageSessionTime: number;
  topActivity: string;
}

/**
 * ActivityViewerPage component for admin dashboard
 * Provides comprehensive user activity tracking and monitoring
 */
const ActivityViewerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'activities' | 'sessions' | 'connections'>('activities');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [connections, setConnections] = useState<ConnectionActivity[]>([]);
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalConnections: 0,
    newConnectionsToday: 0,
    averageSessionTime: 0,
    topActivity: ''
  });

  const itemsPerPage = 15;

  // Mock data initialization
  useEffect(() => {
    // Mock user activities data
    const mockActivities: UserActivity[] = [
      {
        id: 'act-001',
        userId: 'user-001',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@email.com',
        userType: 'business',
        activityType: 'login',
        description: 'User logged in successfully',
        timestamp: '2024-01-17T14:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'New York, NY',
        deviceType: 'desktop',
        sessionId: 'sess-001'
      },
      {
        id: 'act-002',
        userId: 'user-002',
        userName: 'Michael Chen',
        userEmail: 'michael.c@email.com',
        userType: 'individual',
        activityType: 'connection_request',
        description: 'Sent connection request to Emma Wilson',
        timestamp: '2024-01-17T13:45:00Z',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        location: 'Los Angeles, CA',
        deviceType: 'mobile',
        sessionId: 'sess-002'
      },
      {
        id: 'act-003',
        userId: 'user-003',
        userName: 'Emma Wilson',
        userEmail: 'emma.w@email.com',
        userType: 'business',
        activityType: 'profile_view',
        description: 'Viewed profile of David Brown',
        timestamp: '2024-01-17T12:20:00Z',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Chicago, IL',
        deviceType: 'desktop',
        sessionId: 'sess-003'
      },
      {
        id: 'act-004',
        userId: 'user-004',
        userName: 'David Brown',
        userEmail: 'david.b@email.com',
        userType: 'individual',
        activityType: 'search',
        description: 'Searched for "marketing professionals"',
        timestamp: '2024-01-17T11:15:00Z',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
        location: 'Miami, FL',
        deviceType: 'tablet',
        sessionId: 'sess-004'
      },
      {
        id: 'act-005',
        userId: 'user-005',
        userName: 'Lisa Anderson',
        userEmail: 'lisa.a@email.com',
        userType: 'business',
        activityType: 'boost_purchase',
        description: 'Purchased profile boost package',
        timestamp: '2024-01-17T10:30:00Z',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        location: 'Seattle, WA',
        deviceType: 'desktop',
        sessionId: 'sess-005'
      },
      {
        id: 'act-006',
        userId: 'user-006',
        userName: 'James Wilson',
        userEmail: 'james.w@email.com',
        userType: 'individual',
        activityType: 'message_sent',
        description: 'Sent message to Sarah Johnson',
        timestamp: '2024-01-17T09:45:00Z',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Android 14; Mobile)',
        location: 'Austin, TX',
        deviceType: 'mobile',
        sessionId: 'sess-006'
      },
      {
        id: 'act-007',
        userId: 'user-007',
        userName: 'Maria Garcia',
        userEmail: 'maria.g@email.com',
        userType: 'business',
        activityType: 'profile_update',
        description: 'Updated profile information and photos',
        timestamp: '2024-01-17T08:20:00Z',
        ipAddress: '192.168.1.106',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Phoenix, AZ',
        deviceType: 'desktop',
        sessionId: 'sess-007'
      },
      {
        id: 'act-008',
        userId: 'user-001',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@email.com',
        userType: 'business',
        activityType: 'logout',
        description: 'User logged out',
        timestamp: '2024-01-16T18:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        location: 'New York, NY',
        deviceType: 'desktop',
        sessionId: 'sess-001',
        duration: 240
      }
    ];

    // Mock login sessions data
    const mockSessions: LoginSession[] = [
      {
        id: 'sess-001',
        userId: 'user-001',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@email.com',
        loginTime: '2024-01-17T14:30:00Z',
        ipAddress: '192.168.1.100',
        location: 'New York, NY',
        deviceType: 'desktop',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        isActive: true
      },
      {
        id: 'sess-002',
        userId: 'user-002',
        userName: 'Michael Chen',
        userEmail: 'michael.c@email.com',
        loginTime: '2024-01-17T13:00:00Z',
        ipAddress: '192.168.1.101',
        location: 'Los Angeles, CA',
        deviceType: 'mobile',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        isActive: true
      },
      {
        id: 'sess-003',
        userId: 'user-003',
        userName: 'Emma Wilson',
        userEmail: 'emma.w@email.com',
        loginTime: '2024-01-17T11:45:00Z',
        logoutTime: '2024-01-17T13:30:00Z',
        duration: 105,
        ipAddress: '192.168.1.102',
        location: 'Chicago, IL',
        deviceType: 'desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        isActive: false
      },
      {
        id: 'sess-004',
        userId: 'user-004',
        userName: 'David Brown',
        userEmail: 'david.b@email.com',
        loginTime: '2024-01-17T10:20:00Z',
        ipAddress: '192.168.1.103',
        location: 'Miami, FL',
        deviceType: 'tablet',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0)',
        isActive: true
      },
      {
        id: 'sess-005',
        userId: 'user-005',
        userName: 'Lisa Anderson',
        userEmail: 'lisa.a@email.com',
        loginTime: '2024-01-17T09:15:00Z',
        logoutTime: '2024-01-17T12:45:00Z',
        duration: 210,
        ipAddress: '192.168.1.104',
        location: 'Seattle, WA',
        deviceType: 'desktop',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        isActive: false
      }
    ];

    // Mock connection activities data
    const mockConnections: ConnectionActivity[] = [
      {
        id: 'conn-001',
        fromUserId: 'user-002',
        fromUserName: 'Michael Chen',
        toUserId: 'user-003',
        toUserName: 'Emma Wilson',
        activityType: 'request_sent',
        timestamp: '2024-01-17T13:45:00Z',
        status: 'pending'
      },
      {
        id: 'conn-002',
        fromUserId: 'user-001',
        fromUserName: 'Sarah Johnson',
        toUserId: 'user-004',
        toUserName: 'David Brown',
        activityType: 'request_accepted',
        timestamp: '2024-01-17T12:30:00Z',
        status: 'accepted'
      },
      {
        id: 'conn-003',
        fromUserId: 'user-005',
        fromUserName: 'Lisa Anderson',
        toUserId: 'user-006',
        toUserName: 'James Wilson',
        activityType: 'request_sent',
        timestamp: '2024-01-17T11:20:00Z',
        status: 'pending'
      },
      {
        id: 'conn-004',
        fromUserId: 'user-007',
        fromUserName: 'Maria Garcia',
        toUserId: 'user-001',
        toUserName: 'Sarah Johnson',
        activityType: 'request_declined',
        timestamp: '2024-01-17T10:15:00Z',
        status: 'declined'
      },
      {
        id: 'conn-005',
        fromUserId: 'user-003',
        fromUserName: 'Emma Wilson',
        toUserId: 'user-005',
        toUserName: 'Lisa Anderson',
        activityType: 'request_accepted',
        timestamp: '2024-01-17T09:30:00Z',
        status: 'accepted'
      }
    ];

    // Mock metrics
    const mockMetrics: ActivityMetrics = {
      totalUsers: 1547,
      activeUsers: 342,
      totalSessions: 2156,
      activeSessions: 89,
      totalConnections: 4523,
      newConnectionsToday: 47,
      averageSessionTime: 45,
      topActivity: 'profile_view'
    };

    setActivities(mockActivities);
    setSessions(mockSessions);
    setConnections(mockConnections);
    setMetrics(mockMetrics);
  }, []);

  /**
   * Filter activities based on search term, activity type, device, and time
   */
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = activityFilter === 'all' || activity.activityType === activityFilter;
    const matchesDevice = deviceFilter === 'all' || activity.deviceType === deviceFilter;
    
    // Time filter logic (simplified)
    const now = new Date();
    const activityDate = new Date(activity.timestamp);
    let matchesTime = true;
    
    if (timeFilter === 'today') {
      matchesTime = activityDate.toDateString() === now.toDateString();
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesTime = activityDate >= weekAgo;
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesTime = activityDate >= monthAgo;
    }
    
    return matchesSearch && matchesActivity && matchesDevice && matchesTime;
  });

  /**
   * Filter sessions based on search term
   */
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  /**
   * Filter connections based on search term
   */
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.fromUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.toUserName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
   * Get activity type badge styling
   */
  const getActivityBadge = (activityType: string) => {
    const styles = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      profile_view: 'bg-blue-100 text-blue-800',
      connection_request: 'bg-purple-100 text-purple-800',
      message_sent: 'bg-orange-100 text-orange-800',
      search: 'bg-yellow-100 text-yellow-800',
      boost_purchase: 'bg-pink-100 text-pink-800',
      profile_update: 'bg-indigo-100 text-indigo-800'
    };
    return styles[activityType as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get device icon
   */
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Monitor; // Using Monitor as placeholder
      default:
        return Globe;
    }
  };

  /**
   * Get connection status badge styling
   */
  const getConnectionStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      removed: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Handle activity detail view
   */
  const handleViewDetails = (activity: UserActivity) => {
    setSelectedActivity(activity);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Activity Viewer</h1>
          <p className="text-gray-600">Monitor user activities, login sessions, and connection tracking</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalSessions.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeSessions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalConnections.toLocaleString()}</p>
              </div>
              <UserCheck className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Today</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.newConnectionsToday}</p>
              </div>
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageSessionTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Activity</p>
                <p className="text-lg font-bold text-gray-900">{metrics.topActivity.replace('_', ' ')}</p>
              </div>
              <Eye className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'activities', label: 'User Activities', icon: Activity },
            { id: 'sessions', label: 'Login Sessions', icon: Clock },
            { id: 'connections', label: 'Connection Activity', icon: UserCheck }
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
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {activeTab === 'activities' && (
          <>
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="profile_view">Profile View</SelectItem>
                <SelectItem value="connection_request">Connection Request</SelectItem>
                <SelectItem value="message_sent">Message Sent</SelectItem>
                <SelectItem value="search">Search</SelectItem>
                <SelectItem value="boost_purchase">Boost Purchase</SelectItem>
                <SelectItem value="profile_update">Profile Update</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'activities' && (
        <Card>
          <CardHeader>
            <CardTitle>User Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(filteredActivities).map((activity) => {
                const DeviceIcon = getDeviceIcon(activity.deviceType);
                return (
                  <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{activity.userName}</h3>
                          <Badge className={getActivityBadge(activity.activityType)}>
                            {activity.activityType.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {activity.userType}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <DeviceIcon className="h-3 w-3 mr-1" />
                            {activity.deviceType}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {activity.location || 'Unknown'}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(activity.timestamp)}
                          </span>
                          <span>IP: {activity.ipAddress}</span>
                          {activity.duration && <span>Duration: {activity.duration}m</span>}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(activity)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {getTotalPages(filteredActivities.length) > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
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
                    Page {currentPage} of {getTotalPages(filteredActivities.length)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(filteredActivities.length)))}
                    disabled={currentPage === getTotalPages(filteredActivities.length)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle>Login Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(filteredSessions).map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType);
                return (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{session.userName}</h3>
                          <Badge className={session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {session.isActive ? 'Active' : 'Ended'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{session.userEmail}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <DeviceIcon className="h-3 w-3 mr-1" />
                            {session.deviceType}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {session.location || 'Unknown'}
                          </span>
                          <span>Login: {formatDate(session.loginTime)}</span>
                          {session.logoutTime && <span>Logout: {formatDate(session.logoutTime)}</span>}
                          {session.duration && <span>Duration: {session.duration}m</span>}
                          <span>IP: {session.ipAddress}</span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {getTotalPages(filteredSessions.length) > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSessions.length)} of {filteredSessions.length} sessions
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
                    Page {currentPage} of {getTotalPages(filteredSessions.length)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(filteredSessions.length)))}
                    disabled={currentPage === getTotalPages(filteredSessions.length)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'connections' && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(filteredConnections).map((connection) => (
                <div key={connection.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {connection.fromUserName} → {connection.toUserName}
                        </h3>
                        <Badge className={getConnectionStatusBadge(connection.status)}>
                          {connection.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        {connection.activityType.replace('_', ' ')}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(connection.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {getTotalPages(filteredConnections.length) > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredConnections.length)} of {filteredConnections.length} connections
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
                    Page {currentPage} of {getTotalPages(filteredConnections.length)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(filteredConnections.length)))}
                    disabled={currentPage === getTotalPages(filteredConnections.length)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <p className="text-sm text-gray-900">{selectedActivity.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{selectedActivity.userEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <Badge className={getActivityBadge(selectedActivity.activityType)}>
                    {selectedActivity.activityType.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <Badge variant="outline">{selectedActivity.userType}</Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{selectedActivity.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedActivity.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                  <p className="text-sm text-gray-900">{selectedActivity.deviceType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <p className="text-sm text-gray-900">{selectedActivity.ipAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-sm text-gray-900">{selectedActivity.location || 'Unknown'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                <p className="text-sm text-gray-900 break-all">{selectedActivity.userAgent}</p>
              </div>
              {selectedActivity.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p className="text-sm text-gray-900">{selectedActivity.duration} minutes</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityViewerPage;