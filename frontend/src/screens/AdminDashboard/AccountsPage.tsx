import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

/**
 * Interface for user account data
 */
interface UserAccount {
  id: number;
  name: string;
  type: 'Company' | 'Individual';
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  lastLogin?: string;
}

/**
 * Accounts management page component
 * Displays user accounts in a table format with search, filter, and management capabilities
 */
export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAccounts] = useState(2000); // Mock total count

  // Mock data - in production this would come from an API
  useEffect(() => {
    const mockAccounts: UserAccount[] = [
      {
        id: 1,
        name: 'Fabrice Niyimpaye',
        type: 'Company',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        id: 2,
        name: 'Fabrice Niyimpaye',
        type: 'Individual',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-14',
        lastLogin: '2024-01-19'
      },
      {
        id: 3,
        name: 'Fabrice Niyimpaye',
        type: 'Company',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-13',
        lastLogin: '2024-01-18'
      },
      {
        id: 4,
        name: 'Fabrice Niyimpaye',
        type: 'Individual',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-12',
        lastLogin: '2024-01-17'
      },
      {
        id: 5,
        name: 'Fabrice Niyimpaye',
        type: 'Individual',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-11',
        lastLogin: '2024-01-16'
      },
      {
        id: 6,
        name: 'Fabrice Niyimpaye',
        type: 'Individual',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-10',
        lastLogin: '2024-01-15'
      },
      {
        id: 7,
        name: 'Fabrice Niyimpaye',
        type: 'Individual',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-09',
        lastLogin: '2024-01-14'
      },
      {
        id: 8,
        name: 'Fabrice Niyimpaye',
        type: 'Individual',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-08',
        lastLogin: '2024-01-13'
      },
      {
        id: 9,
        name: 'Fabrice Niyimpaye',
        type: 'Company',
        email: 'company@gmail.com',
        status: 'Active',
        createdAt: '2024-01-07',
        lastLogin: '2024-01-12'
      }
    ];
    setAccounts(mockAccounts);
  }, []);

  /**
   * Filter accounts based on search term and filters
   */
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || account.type === filterType;
    const matchesStatus = filterStatus === 'All' || account.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Handle account actions
   */
  const handleViewAccount = (accountId: number) => {
    console.log('View account:', accountId);
    // TODO: Navigate to account detail page
  };

  const handleEditAccount = (accountId: number) => {
    console.log('Edit account:', accountId);
    // TODO: Open edit modal or navigate to edit page
  };

  const handleDeleteAccount = (accountId: number) => {
    console.log('Delete account:', accountId);
    // TODO: Show confirmation dialog and delete account
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and profiles</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => navigate('/admin/accounts/create')}
        >
          <Plus size={16} className="mr-2" />
          NEW ACCOUNT
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Categories */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">CATEGORIES</span>
              <span className="text-sm text-gray-500">{totalAccounts.toLocaleString()}</span>
            </div>
            
            {/* Filter tabs */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterType('All')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filterType === 'All' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('Individual')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filterType === 'Individual' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setFilterType('Company')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filterType === 'Company' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Company
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* Filter button */}
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">NAME</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">TYPE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">EMAIL</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">STATUS</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-600">{account.id}</td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{account.name}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{account.type}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{account.email}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Badge className={`${getStatusColor(account.status)} border-0`}>
                        {account.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewAccount(account.id)}>
                          <Eye size={16} className="mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditAccount(account.id)}>
                          <Edit size={16} className="mr-2" />
                          Edit Account
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete Account
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
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {filteredAccounts.length} of {totalAccounts.toLocaleString()} accounts
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1}>
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;