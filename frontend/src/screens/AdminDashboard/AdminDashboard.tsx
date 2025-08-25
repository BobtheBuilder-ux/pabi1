import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Users,
  TrendingUp,
  CreditCard,
  Shield,
  BarChart3,
  MessageSquare,
  Settings,
  Activity,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  Zap,
} from 'lucide-react';

/**
 * Navigation item interface for sidebar menu
 */
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

/**
 * Main admin dashboard layout component with sidebar navigation
 * Provides the overall structure for all admin dashboard pages
 */
export const AdminDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items for the sidebar
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      path: '/admin',
    },
    {
      id: 'accounts',
      label: 'Accounts',
      icon: Users,
      path: '/admin/accounts',
    },
    {
      id: 'boost-requests',
      label: 'Boost Requests',
      icon: Zap,
      path: '/admin/boost-requests',
      badge: 5,
    },
    {
      id: 'networking',
      label: 'Networking',
      icon: Activity,
      path: '/admin/networking',
    },
    {
      id: 'messaging',
      label: 'Messaging',
      icon: MessageSquare,
      path: '/admin/messaging',
    },
    {
      id: 'products',
      label: 'Products & Service Performance',
      icon: TrendingUp,
      path: '/admin/products',
    },
    {
      id: 'events',
      label: 'Event Scheduling',
      icon: Shield,
      path: '/admin/events',
    },
    {
      id: 'billing',
      label: 'Subscription & Billing',
      icon: CreditCard,
      path: '/admin/billing',
    },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: Ticket,
      path: '/admin/support',
      badge: 12,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  /**
   * Handle navigation item click
   */
  const handleNavClick = (path: string) => {
    navigate(path);
  };

  /**
   * Check if current path matches nav item
   */
  const isActiveNav = (path: string) => {
    return location.pathname === path || 
           (path === '/admin' && location.pathname === '/admin');
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PA</span>
              </div>
              <span className="font-semibold text-gray-800">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveNav(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                  isActive ? 'bg-purple-100 border-r-2 border-purple-600 text-purple-700' : 'text-gray-600'
                }`}
              >
                <Icon size={20} className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-800">
                Admin Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/profile-image.png" alt="Admin" />
                      <AvatarFallback>FN</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">Fabrice Niyimpaye</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;