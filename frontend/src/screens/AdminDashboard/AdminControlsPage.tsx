import React, { useState, useEffect } from 'react';
import { Shield, Users, Key, Activity, Search, Plus, Edit, Trash2, Eye, MoreHorizontal, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// TypeScript interfaces for admin controls data
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  department: string;
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'warning';
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'user_management' | 'content_moderation' | 'billing' | 'analytics' | 'system';
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
}

interface AdminControlsMetrics {
  totalAdminUsers: number;
  activeAdminUsers: number;
  totalRoles: number;
  totalPermissions: number;
  auditLogsToday: number;
  criticalEvents: number;
}

/**
 * AdminControlsPage component for admin dashboard
 * Provides role-based access control and audit trail logging
 */
const AdminControlsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'audit'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  // const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  // const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [metrics, setMetrics] = useState<AdminControlsMetrics>({
    totalAdminUsers: 0,
    activeAdminUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    auditLogsToday: 0,
    criticalEvents: 0
  });

  const itemsPerPage = 10;

  // Mock data initialization
  useEffect(() => {
    // Mock admin users data
    const mockAdminUsers: AdminUser[] = [
      {
        id: 'admin-001',
        name: 'John Smith',
        email: 'john.smith@pabup.com',
        role: 'super_admin',
        status: 'active',
        lastLogin: '2024-01-17T14:30:00Z',
        createdAt: '2023-01-01T10:00:00Z',
        permissions: ['all'],
        department: 'Engineering'
      },
      {
        id: 'admin-002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@pabup.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-17T12:15:00Z',
        createdAt: '2023-02-15T09:30:00Z',
        permissions: ['user_management', 'content_moderation', 'billing'],
        department: 'Operations'
      },
      {
        id: 'admin-003',
        name: 'Michael Chen',
        email: 'michael.chen@pabup.com',
        role: 'moderator',
        status: 'active',
        lastLogin: '2024-01-17T16:45:00Z',
        createdAt: '2023-03-10T11:20:00Z',
        permissions: ['content_moderation', 'user_management'],
        department: 'Content'
      },
      {
        id: 'admin-004',
        name: 'Emma Wilson',
        email: 'emma.wilson@pabup.com',
        role: 'support',
        status: 'inactive',
        lastLogin: '2024-01-15T09:20:00Z',
        createdAt: '2023-04-05T14:10:00Z',
        permissions: ['user_management'],
        department: 'Support'
      },
      {
        id: 'admin-005',
        name: 'David Brown',
        email: 'david.brown@pabup.com',
        role: 'admin',
        status: 'suspended',
        lastLogin: '2024-01-10T11:30:00Z',
        createdAt: '2023-05-20T16:45:00Z',
        permissions: ['analytics', 'billing'],
        department: 'Finance'
      }
    ];

    // Mock audit logs data
    const mockAuditLogs: AuditLogEntry[] = [
      {
        id: 'audit-001',
        userId: 'admin-001',
        userName: 'John Smith',
        action: 'User Created',
        resource: 'User',
        resourceId: 'user-12345',
        details: 'Created new user account for sarah.new@email.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: '2024-01-17T14:30:00Z',
        severity: 'medium',
        status: 'success'
      },
      {
        id: 'audit-002',
        userId: 'admin-002',
        userName: 'Sarah Johnson',
        action: 'Content Moderated',
        resource: 'Content',
        resourceId: 'content-67890',
        details: 'Approved user profile content after review',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-01-17T13:45:00Z',
        severity: 'low',
        status: 'success'
      },
      {
        id: 'audit-003',
        userId: 'admin-003',
        userName: 'Michael Chen',
        action: 'Login Failed',
        resource: 'Authentication',
        details: 'Failed login attempt - invalid password',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        timestamp: '2024-01-17T12:20:00Z',
        severity: 'high',
        status: 'failed'
      },
      {
        id: 'audit-004',
        userId: 'admin-001',
        userName: 'John Smith',
        action: 'Role Updated',
        resource: 'Role',
        resourceId: 'role-moderator',
        details: 'Updated moderator role permissions',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: '2024-01-17T11:15:00Z',
        severity: 'medium',
        status: 'success'
      },
      {
        id: 'audit-005',
        userId: 'system',
        userName: 'System',
        action: 'Database Backup',
        resource: 'System',
        details: 'Automated daily database backup completed',
        ipAddress: '127.0.0.1',
        userAgent: 'System/1.0',
        timestamp: '2024-01-17T02:00:00Z',
        severity: 'low',
        status: 'success'
      }
    ];

    // Mock permissions data
    const mockPermissions: Permission[] = [
      {
        id: 'perm-001',
        name: 'user_management',
        description: 'Create, read, update, and delete user accounts',
        category: 'user_management',
        isActive: true
      },
      {
        id: 'perm-002',
        name: 'content_moderation',
        description: 'Review and moderate user-generated content',
        category: 'content_moderation',
        isActive: true
      },
      {
        id: 'perm-003',
        name: 'billing_management',
        description: 'Access billing information and manage subscriptions',
        category: 'billing',
        isActive: true
      },
      {
        id: 'perm-004',
        name: 'analytics_access',
        description: 'View analytics dashboards and reports',
        category: 'analytics',
        isActive: true
      },
      {
        id: 'perm-005',
        name: 'system_configuration',
        description: 'Modify system settings and configurations',
        category: 'system',
        isActive: true
      }
    ];

    // Mock roles data
    const mockRoles: Role[] = [
      {
        id: 'role-001',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: ['all'],
        userCount: 1,
        isSystem: true,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'role-002',
        name: 'Admin',
        description: 'Administrative access with most permissions',
        permissions: ['user_management', 'content_moderation', 'billing_management', 'analytics_access'],
        userCount: 2,
        isSystem: true,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'role-003',
        name: 'Moderator',
        description: 'Content moderation and user management access',
        permissions: ['content_moderation', 'user_management'],
        userCount: 1,
        isSystem: true,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: 'role-004',
        name: 'Support',
        description: 'Limited access for customer support tasks',
        permissions: ['user_management'],
        userCount: 1,
        isSystem: true,
        createdAt: '2023-01-01T00:00:00Z'
      }
    ];

    // Mock metrics
    const mockMetrics: AdminControlsMetrics = {
      totalAdminUsers: 5,
      activeAdminUsers: 3,
      totalRoles: 4,
      totalPermissions: 5,
      auditLogsToday: 12,
      criticalEvents: 1
    };

    setAdminUsers(mockAdminUsers);
    setAuditLogs(mockAuditLogs);
    setPermissions(mockPermissions);
    setRoles(mockRoles);
    setMetrics(mockMetrics);
  }, []);

  /**
   * Filter admin users based on search term, status, and role
   */
  const filteredAdminUsers = adminUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  /**
   * Filter audit logs based on search term and severity
   */
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
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
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get role badge styling
   */
  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      moderator: 'bg-orange-100 text-orange-800',
      support: 'bg-green-100 text-green-800'
    };
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get severity badge styling
   */
  const getSeverityBadge = (severity: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return styles[severity as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get audit status badge styling
   */
  const getAuditStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Handle user action (edit, suspend, delete)
   */
  const handleUserAction = (action: string, userId: string) => {
    console.log(`${action} user:`, userId);
    // TODO: Implement actual user actions
  };

  /**
   * Handle role action (edit, delete)
   */
  const handleRoleAction = (action: string, roleId: string) => {
    console.log(`${action} role:`, roleId);
    // TODO: Implement actual role actions
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Controls</h1>
          <p className="text-gray-600">Manage admin users, roles, permissions, and audit trail</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setIsCreateUserOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Admin User
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsCreateRoleOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Role
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalAdminUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Admins</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeAdminUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalRoles}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Permissions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalPermissions}</p>
              </div>
              <Key className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Logs Today</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.auditLogsToday}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'Admin Users', icon: Users },
            { id: 'roles', label: 'Roles', icon: Shield },
            { id: 'permissions', label: 'Permissions', icon: Key },
            { id: 'audit', label: 'Audit Trail', icon: Activity }
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
        
        {activeTab === 'users' && (
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        
        {activeTab === 'audit' && (
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(filteredAdminUsers).map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <Badge className={getStatusBadge(user.status)}>
                          {user.status}
                        </Badge>
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                      <p className="text-gray-500 text-sm mb-3">Department: {user.department}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Last Login: {formatDate(user.lastLogin)}</span>
                        <span>Created: {formatDate(user.createdAt)}</span>
                        <span>Permissions: {user.permissions.join(', ')}</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUserAction('view', user.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('edit', user.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUserAction('suspend', user.id)}
                          className="text-orange-600"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUserAction('delete', user.id)}
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
            {getTotalPages(filteredAdminUsers.length) > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAdminUsers.length)} of {filteredAdminUsers.length} users
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
                    Page {currentPage} of {getTotalPages(filteredAdminUsers.length)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(filteredAdminUsers.length)))}
                    disabled={currentPage === getTotalPages(filteredAdminUsers.length)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'roles' && (
        <Card>
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        {role.isSystem && (
                          <Badge className="bg-blue-100 text-blue-800">
                            System Role
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{role.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <span>Users: {role.userCount}</span>
                        <span>Created: {formatDate(role.createdAt)}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {!role.isSystem && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRoleAction('edit', role.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleAction('delete', role.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'permissions' && (
        <Card>
          <CardHeader>
            <CardTitle>System Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{permission.name.replace('_', ' ')}</h3>
                    <Badge className={permission.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {permission.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{permission.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {permission.category.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPaginatedData(filteredAuditLogs).map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{log.action}</h3>
                        <Badge className={getSeverityBadge(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge className={getAuditStatusBadge(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{log.details}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>User: {log.userName}</span>
                        <span>Resource: {log.resource}</span>
                        {log.resourceId && <span>ID: {log.resourceId}</span>}
                        <span>IP: {log.ipAddress}</span>
                        <span>Time: {formatDate(log.timestamp)}</span>
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
            {getTotalPages(filteredAuditLogs.length) > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAuditLogs.length)} of {filteredAuditLogs.length} logs
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
                    Page {currentPage} of {getTotalPages(filteredAuditLogs.length)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages(filteredAuditLogs.length)))}
                    disabled={currentPage === getTotalPages(filteredAuditLogs.length)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Admin User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input placeholder="Enter email address" type="email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Input placeholder="Enter department" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
              <Input placeholder="Enter temporary password" type="password" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>Cancel</Button>
              <Button>Create Admin User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <Input placeholder="Enter role name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-md resize-none" 
                rows={3}
                placeholder="Enter role description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{permission.name.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
              <Button>Create Role</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminControlsPage;