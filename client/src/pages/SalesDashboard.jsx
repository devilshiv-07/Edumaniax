import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  Download,
  Plus,
  Filter,
  Mail,
  Phone,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Briefcase,
  Users,
  DollarSign,
  BarChart4,
  PieChart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  X
} from 'lucide-react';

const SalesDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, role } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [freeTrialRequests, setFreeTrialRequests] = useState([]);
  const [analytics, setAnalytics] = useState({
    inquiryStatusCounts: [],
    revenueByPlan: [],
    unreadNotificationsCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('inquiries'); // 'inquiries' or 'freeTrials'
  const [isEditingInquiry, setIsEditingInquiry] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [userStats, setUserStats] = useState([]);
const [roleFilter, setRoleFilter] = useState('ALL');
const [isEditingUserRole, setIsEditingUserRole] = useState(false);

  // Define fetch functions with useCallback first
  // Helper function to handle 401 errors
  const handleAuthError = (error, response) => {
    if (response?.status === 401 || error.message.includes('Invalid or expired token')) {
      console.log('Authentication error detected, clearing auth state and redirecting');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      logout();
      navigate('/sales');
    }
  };

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/inquiries?page=${currentPage}&limit=50&status=${statusFilter}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.status === 401) {
        handleAuthError('Unauthorized', response);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }

      const data = await response.json();
      setInquiries(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  const fetchFreeTrialRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/free-trial?page=${currentPage}&limit=50&status=${statusFilter}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.status === 401) {
        handleAuthError('Unauthorized', response);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch free trial requests');
      }

      const data = await response.json();
      setFreeTrialRequests(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching free trial requests:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError(new Error(data.message), response);
          return;
        }
        throw new Error(data.message || 'Failed to fetch analytics');
      } setAnalytics({
        inquiryStatusCounts: Array.isArray(data.data?.inquiryStatusCounts)
          ? data.data.inquiryStatusCounts
          : [],
        revenueByPlan: Array.isArray(data.data?.revenueByPlan)
          ? data.data.revenueByPlan
          : []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

 const fetchUsers = useCallback(async () => {
  try {
    setLoading(true);
    const response = await fetch(
      // Make sure this is 'users' not 'saleusers'
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/users?page=${currentPage}&limit=50&role=${roleFilter}&search=${searchTerm}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.status === 401) {
      handleAuthError('Unauthorized', response);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    setUsers(data.data || []);
    setUserStats(data.statistics || []);
    setTotalPages(data.pagination?.totalPages || 1);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setLoading(false);
  }
}, [currentPage, roleFilter, searchTerm]);

const updateUserRole = async (userId, newRole) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/users/${userId}/role`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update user role');
    }

    // Refresh users list
    fetchUsers();
    setIsEditingUserRole(false);
  } catch (error) {
    console.error('Error updating user role:', error);
    alert('Failed to update user role. Please try again.');
  }
};

  // Check permissions - only ADMIN and SALES roles can access this page
  useEffect(() => {
    if (user && !['ADMIN', 'SALES'].includes(role)) {
      navigate('/dashboard');
    }
  }, [user, role, navigate]);

  // Poll for new notifications
  useEffect(() => {
    // Poll for notifications
    const pollNotifications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/notifications?page=1&limit=10`, {

          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            handleAuthError(new Error(data.message), response);
            return;
          }
          throw new Error(data.message || 'Failed to fetch notifications');
        }

        // Process new notifications
        const newNotifications = Array.isArray(data.data) ? data.data : [];

        // Handle each notification type
        newNotifications.forEach(notification => {
          if (!notification.read) {
            // Process notification based on type
            switch (notification.type) {
              case 'NEW_INQUIRY':
                // Refresh inquiries list
                fetchInquiries();
                break;
              case 'INQUIRY_UPDATED':
                // Refresh inquiries list
                fetchInquiries();
                // Update selected inquiry if it matches
                if (selectedInquiry && selectedInquiry.id === notification.data?.id) {
                  setSelectedInquiry(notification.data);
                }
                break;
              case 'NEW_PAYMENT':
                // Refresh payments list (if implemented)
                break;
              default:
                console.log('Unknown notification type:', notification.type);
            }
          }
        });

        // Update notifications list
        // setNotifications(newNotifications); // This state was removed
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    };

    // Only poll if user is ADMIN or SALES
    if (user && ['ADMIN', 'SALES'].includes(role)) {
      // Initial poll
      pollNotifications();

      // Set up polling interval (every 30 seconds)
      const interval = setInterval(pollNotifications, 30000);
      // setPollingInterval(interval); // This state was removed

      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [user, role, fetchInquiries, selectedInquiry]);

  // Set up online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      // Handle online status
    };
    const handleOffline = () => {
      // Handle offline status
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (user && ['ADMIN', 'SALES'].includes(role)) {
      fetchInquiries();
      fetchFreeTrialRequests();
      fetchAnalytics();
    }
  }, [user, role, fetchInquiries, fetchFreeTrialRequests, fetchAnalytics]);


  useEffect(() => {
  if (user && ['ADMIN', 'SALES'].includes(role) && activeTab === 'users') {
    fetchUsers();
  }
}, [user, role, activeTab, fetchUsers]);


  // Refetch when page or filters change
  useEffect(() => {
    if (user && ['ADMIN', 'SALES'].includes(role)) {
      fetchInquiries();
    }
  }, [currentPage, statusFilter, searchTerm, fetchInquiries, user, role]);

  // Handle inquiry selection
  const handleInquiryClick = (inquiry) => {
    setSelectedInquiry(inquiry);
  };

  // Update inquiry status
  const updateInquiryStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/inquiries/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update inquiry status');
      }

      // Refresh the data
      if (activeTab === 'inquiries') {
        fetchInquiries();
      } else {
        fetchFreeTrialRequests();
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  // Update free trial status
  const updateFreeTrialStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/free-trial/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update free trial status');
      }

      // Refresh the data
      fetchFreeTrialRequests();
    } catch (error) {
      console.error('Error updating free trial status:', error);
    }
  };

  // Delete inquiry
  const deleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/inquiries/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete inquiry');
      }

      // Clear selected inquiry if it was the deleted one
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }

      // Refresh the data
      fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Failed to delete inquiry. Please try again.');
    }
  };

  // Delete free trial request
  const deleteFreeTrialRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this free trial request? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/free-trial/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete free trial request');
      }

      // Clear selected inquiry if it was the deleted one
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }

      // Refresh the data
      fetchFreeTrialRequests();
    } catch (error) {
      console.error('Error deleting free trial request:', error);
      alert('Failed to delete free trial request. Please try again.');
    }
  };

  // Handle tab change
 const handleTabChange = (tab) => {
  setActiveTab(tab);
  setCurrentPage(1);
  setSelectedInquiry(null); // Clear selection when switching tabs
  setSelectedUser(null); // Clear user selection
  if (tab === 'inquiries') {
    fetchInquiries();
  } else if (tab === 'freeTrials') {
    fetchFreeTrialRequests();
  } else if (tab === 'users') {
    fetchUsers();
  }
};

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-500 text-white';
    case 'SALES':
      return 'bg-blue-500 text-white';
    case 'MODERATOR':
      return 'bg-purple-500 text-white';
    case 'USER':
    default:
      return 'bg-gray-500 text-white';
  }
};


  // Calculate percentage for chart
  const calculatePercentage = (count, total) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500';
      case 'CONTACTED':
        return 'bg-yellow-500';
      case 'FOLLOW_UP':
        return 'bg-purple-500';
      case 'CONVERTED':
        return 'bg-green-500';
      case 'NOT_INTERESTED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'NEW':
        return 'New';
      case 'CONTACTED':
        return 'Contacted';
      case 'FOLLOW_UP':
        return 'Follow Up';
      case 'CONVERTED':
        return 'Converted';
      case 'NOT_INTERESTED':
        return 'Not Interested';
      default:
        return status;
    }
  };

  // Render the status badge
  const renderStatusBadge = (status) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(status)}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  // Render connection status indicator
  const renderConnectionStatus = () => (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full bg-green-500`}></div>
      <span className="text-sm text-gray-600">Connected</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
          <div className="flex justify-between items-center">
            {/* EduManiax Logo */}
            <div className="flex items-center gap-2">
              <div className="w-15 h-10 relative">
                <img className="h-12 w-full" src="/midLogo.png" alt="logo" />
              </div>
              <span className="text-[#09BE43] mt-1 font-bold text-2xl">
                Edumaniax
              </span>
            </div>

            {/* Centered Sales Dashboard Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-semibold text-gray-900">Sales Dashboard</h1>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {renderConnectionStatus()}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <button
                  onClick={() => logout(navigate)} // <-- Pass navigate to logout
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Sales Dashboard</h1>
                <p className="mt-1 text-blue-100 text-sm">
                  Welcome back, {user?.name || 'User'}! Manage inquiries, free trial requests, and track sales performance
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                  <div className="text-white text-xs font-medium">Total Inquiries</div>
                  <div className="text-white text-lg font-bold">
                    {Array.isArray(analytics.inquiryStatusCounts)
                      ? analytics.inquiryStatusCounts.reduce((sum, item) => sum + Number(item.count || 0), 0)
                      : 0}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                  <div className="text-white text-xs font-medium">Free Trials</div>
                  <div className="text-white text-lg font-bold">{freeTrialRequests.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Description */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Dashboard Purpose:</span>
                <span className="ml-2">Manage institutional inquiries and free trial requests efficiently. Track conversion rates and sales performance.</span>
              </div>
              <div className="text-xs text-gray-500">
                Role: {role || 'User'}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Tab Navigation */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-1">
              <button
                onClick={() => handleTabChange('inquiries')}
                className={`py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 ${activeTab === 'inquiries'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Institutional Inquiries</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('freeTrials')}
                className={`py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 ${activeTab === 'freeTrials'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Free Trial Requests</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('analytics')}
                className={`py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 ${activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart4 className="h-4 w-4" />
                  <span>Analytics Dashboard</span>
                </div>
              </button>
              <button
  onClick={() => handleTabChange('users')}
  className={`py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 ${
    activeTab === 'users'
      ? 'border-blue-500 text-blue-600 bg-blue-50'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
  }`}
>
  <div className="flex items-center space-x-2">
    <Users className="h-4 w-4" />
    <span>Users Management</span>
  </div>
</button>
            </nav>
          </div>
        </div>

        {/* Compact Search and Filter Section */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={`Search ${activeTab === 'inquiries' ? 'inquiries' : activeTab === 'freeTrials' ? 'free trial requests' : activeTab === 'users' ? 'users' : 'items'}...`}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="block w-full pl-9 pr-8 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg transition-all duration-200"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Dashboard Overview - Moved to right side */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Quick Stats:</span>
                <span className="ml-2 text-blue-600 font-medium">{freeTrialRequests.filter(t => t.status === 'NEW').length} new trials</span>
                <span className="mx-2">•</span>
                <span className="text-green-600 font-medium">{inquiries.filter(i => i.status === 'NEW').length} new inquiries</span>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats Cards */}
        <div className="bg-white shadow-sm border-b border-gray-200 mb-4">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Array.isArray(analytics.inquiryStatusCounts)
                    ? analytics.inquiryStatusCounts.reduce((sum, item) => sum + Number(item.count || 0), 0)
                    : 0}
                </div>
                <div className="text-xs text-gray-600">Total Inquiries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{freeTrialRequests.length}</div>
                <div className="text-xs text-gray-600">Free Trials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Array.isArray(analytics.inquiryStatusCounts)
                    ? analytics.inquiryStatusCounts.find(i => i.status === 'FOLLOW_UP')?.count || 0
                    : 0}
                </div>
                <div className="text-xs text-gray-600">Active Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(() => {
                    const totalInquiries = Array.isArray(analytics.inquiryStatusCounts)
                      ? analytics.inquiryStatusCounts.reduce((sum, item) => sum + Number(item.count || 0), 0)
                      : 0;
                    const converted = analytics.inquiryStatusCounts?.find(i => i.status === 'CONVERTED')?.count || 0;
                    return totalInquiries > 0 ? Math.round((converted / totalInquiries) * 100) : 0;
                  })()}%
                </div>
                <div className="text-xs text-gray-600">Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Inquiries List */}
            <div className="lg:col-span-1 bg-white shadow rounded-lg">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading inquiries...</div>
              ) : inquiries.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No inquiries found</div>
              ) : (
                <>
                  <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                    {inquiries.map((inquiry) => (
                      <li
                        key={inquiry.id}
                        onClick={() => handleInquiryClick(inquiry)}
                        className={`p-4 hover:bg-blue-50 cursor-pointer transition-all duration-200 rounded-lg border ${selectedInquiry?.id === inquiry.id
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-white border-gray-100 hover:border-blue-200'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900">{inquiry.organizationName}</h3>
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                              <Users className="h-4 w-4 mr-1 text-gray-400" />
                              {inquiry.contactName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{inquiry.organizationType} • {inquiry.studentCount} students</p>
                          </div>
                          <div className="ml-4">
                            {renderStatusBadge(inquiry.status)}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {formatDate(inquiry.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <Phone className="mr-1 h-4 w-4" />
                            {inquiry.contactPhone}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Pagination */}
                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                          </button>

                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Inquiry Details */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg">
              {selectedInquiry ? (
                <>
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Inquiry Details</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditingInquiry(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteInquiry(selectedInquiry.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {isEditingInquiry ? (
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Inquiry</h3>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select
                            value={editFormData.status || selectedInquiry.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="FOLLOW_UP">Follow Up</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="NOT_INTERESTED">Not Interested</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Notes</label>
                          <textarea
                            value={editFormData.notes || selectedInquiry.notes || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                            rows={4}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Follow Up Date</label>
                          <input
                            type="date"
                            value={editFormData.followUpDate || (selectedInquiry.followUpDate ? new Date(selectedInquiry.followUpDate).toISOString().split('T')[0] : '')}
                            onChange={(e) => setEditFormData({ ...editFormData, followUpDate: e.target.value })}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingInquiry(false);
                              setEditFormData({});
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/special/inquiries/${selectedInquiry.id}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                  },
                                  body: JSON.stringify(editFormData)
                                });

                                const data = await response.json();

                                if (!response.ok) {
                                  throw new Error(data.message || 'Failed to update inquiry');
                                }

                                // Update local state
                                setInquiries(prev =>
                                  prev.map(inquiry =>
                                    inquiry.id === selectedInquiry.id ? data.data : inquiry
                                  )
                                );

                                setSelectedInquiry(data.data);
                                setIsEditingInquiry(false);
                                setEditFormData({});

                                // Refresh analytics
                                fetchAnalytics();
                              } catch (error) {
                                console.error('Error updating inquiry:', error);
                              }
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {renderStatusBadge(selectedInquiry.status)}
                          <button
                            onClick={() => updateInquiryStatus(selectedInquiry.id, 'NEW')}
                            className={`px-3 py-1 text-xs font-medium rounded border ${selectedInquiry.status === 'NEW'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            New
                          </button>
                          <button
                            onClick={() => updateInquiryStatus(selectedInquiry.id, 'CONTACTED')}
                            className={`px-3 py-1 text-xs font-medium rounded border ${selectedInquiry.status === 'CONTACTED'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            Contacted
                          </button>
                          <button
                            onClick={() => updateInquiryStatus(selectedInquiry.id, 'FOLLOW_UP')}
                            className={`px-3 py-1 text-xs font-medium rounded border ${selectedInquiry.status === 'FOLLOW_UP'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            Follow Up
                          </button>
                          <button
                            onClick={() => updateInquiryStatus(selectedInquiry.id, 'CONVERTED')}
                            className={`px-3 py-1 text-xs font-medium rounded border ${selectedInquiry.status === 'CONVERTED'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            Converted
                          </button>
                          <button
                            onClick={() => updateInquiryStatus(selectedInquiry.id, 'NOT_INTERESTED')}
                            className={`px-3 py-1 text-xs font-medium rounded border ${selectedInquiry.status === 'NOT_INTERESTED'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            Not Interested
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Organization Name</h3>
                          <p className="mt-1 text-sm text-gray-900">{selectedInquiry.organizationName}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Organization Type</h3>
                          <p className="mt-1 text-sm text-gray-900">{selectedInquiry.organizationType || 'N/A'}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact Name</h3>
                          <p className="mt-1 text-sm text-gray-900">{selectedInquiry.contactName}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
                          <p className="mt-1 text-sm text-gray-900">{selectedInquiry.contactEmail}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
                          <p className="mt-1 text-sm text-gray-900">{selectedInquiry.contactPhone || 'N/A'}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Student Count</h3>
                          <p className="mt-1 text-sm text-gray-900">{selectedInquiry.studentCount || 'N/A'}</p>
                        </div>

                        <div className="sm:col-span-2">
                          <h3 className="text-sm font-medium text-gray-500">Message</h3>
                          <p className="mt-1 text-sm text-gray-900">{selectedInquiry.message || 'N/A'}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedInquiry.createdAt)}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Follow Up Date</h3>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedInquiry.followUpDate ? formatDate(selectedInquiry.followUpDate) : 'Not set'}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                          <p className="mt-1 text-sm text-gray-900">{selectedInquiry.notes || 'No notes'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6">
                  <div className="text-center mb-6">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Welcome to Sales Dashboard</h3>
                    <p className="mt-1 text-sm text-gray-500">Select an inquiry from the list to view details and manage your sales pipeline.</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{inquiries.length}</div>
                          <div className="text-xs text-gray-600">Total Inquiries</div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{freeTrialRequests.length}</div>
                          <div className="text-xs text-gray-600">Free Trials</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        {inquiries.length > 0 ? `Last inquiry: ${formatDate(inquiries[0]?.createdAt)}` : 'No inquiries yet'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {freeTrialRequests.length > 0 ? `Last free trial: ${formatDate(freeTrialRequests[0]?.createdAt)}` : 'No free trials yet'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Free Trial Requests Tab */}
        {activeTab === 'freeTrials' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Free Trial Requests List */}
            <div className="lg:col-span-1 bg-white shadow rounded-lg">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading free trial requests...</div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {freeTrialRequests.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No free trial requests found</div>
                  ) : (
                    freeTrialRequests.map((trial) => (
                      <div
                        key={trial.id}
                        className={`p-4 hover:bg-blue-50 cursor-pointer transition-all duration-200 rounded-lg border ${selectedInquiry?.id === trial.id
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-white border-gray-100 hover:border-blue-200'
                          }`}
                        onClick={() => setSelectedInquiry(trial)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900">{trial.fullName}</h3>
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                              <Mail className="h-4 w-4 mr-1 text-gray-400" />
                              {trial.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <Phone className="h-4 w-4 mr-1 text-gray-400" />
                              {trial.phoneNumber}
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Class {trial.class}
                              </span>
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {trial.state}, {trial.city}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {renderStatusBadge(trial.status)}
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatDate(trial.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Free Trial Request Details */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg">
              {selectedInquiry ? (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Free Trial Request Details</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => deleteFreeTrialRequest(selectedInquiry.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedInquiry(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInquiry.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInquiry.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInquiry.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Class</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInquiry.class}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInquiry.state}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInquiry.city}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {renderStatusBadge(selectedInquiry.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedInquiry.createdAt)}</p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Update Status</h3>
                    <div className="flex gap-2">
                      {['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'NOT_INTERESTED'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateFreeTrialStatus(selectedInquiry.id, status)}
                          className={`px-3 py-1 text-xs rounded-full ${selectedInquiry.status === status
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-center mb-6">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Free Trial Requests</h3>
                    <p className="mt-1 text-sm text-gray-500">Select a free trial request to view details and manage student trial applications.</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{freeTrialRequests.filter(t => t.status === 'NEW').length}</div>
                          <div className="text-xs text-gray-600">New Requests</div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{freeTrialRequests.filter(t => t.status === 'CONVERTED').length}</div>
                          <div className="text-xs text-gray-600">Converted</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        {freeTrialRequests.length > 0 ? `Last request: ${formatDate(freeTrialRequests[0]?.createdAt)}` : 'No free trial requests yet'}
                      </div>
                      <div className="text-xs text-gray-600">
                        Total requests: {freeTrialRequests.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Enhanced KPI Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Inquiries */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
                      <Briefcase className="h-7 w-7 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-semibold text-blue-800 truncate">Total Inquiries</dt>
                        <dd>
                          <div className="text-2xl font-bold text-blue-900">
                            {Array.isArray(analytics.inquiryStatusCounts)
                              ? analytics.inquiryStatusCounts.reduce((sum, item) => sum + Number(item.count || 0), 0)
                              : 0}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-semibold text-green-800 truncate">Total Revenue</dt>
                        <dd>
                          <div className="text-2xl font-bold text-green-900">
                            ₹{Array.isArray(analytics.revenueByPlan)
                              ? analytics.revenueByPlan.reduce((sum, item) => sum + Number(item.total || 0), 0)
                              : 0}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Leads */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-semibold text-yellow-800 truncate">Active Leads</dt>
                        <dd>
                          <div className="text-2xl font-bold text-yellow-900">
                            {Array.isArray(analytics.inquiryStatusCounts)
                              ? analytics.inquiryStatusCounts.find(i => i.status === 'FOLLOW_UP')?.count || 0
                              : 0}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-semibold text-purple-800 truncate">Conversion Rate</dt>
                        <dd>
                          <div className="text-2xl font-bold text-purple-900">
                            {(() => {
                              const totalInquiries = Array.isArray(analytics.inquiryStatusCounts)
                                ? analytics.inquiryStatusCounts.reduce((sum, item) => sum + Number(item.count || 0), 0)
                                : 0;
                              const converted = analytics.inquiryStatusCounts?.find(i => i.status === 'CONVERTED')?.count || 0;
                              return totalInquiries > 0 ? `${Math.round((converted / totalInquiries) * 100)}%` : '0%';
                            })()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Inquiry Status Distribution */}
            <div className="lg:col-span-2 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart4 className="h-5 w-5 mr-2 text-blue-600" />
                  Inquiry Status Distribution
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
                  {['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'NOT_INTERESTED'].map((status) => {
                    const count = Array.isArray(analytics.inquiryStatusCounts)
                      ? analytics.inquiryStatusCounts.find(i => i.status === status)?.count || 0
                      : 0;
                    const totalInquiries = Array.isArray(analytics.inquiryStatusCounts)
                      ? analytics.inquiryStatusCounts.reduce((sum, item) => sum + Number(item.count || 0), 0) || 1
                      : 1;
                    const percentage = calculatePercentage(count, totalInquiries);

                    return (
                      <div key={status} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        <div className="text-center">
                          <div className="flex justify-center items-center mb-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(status)} text-white shadow-sm`}>
                              {getStatusLabel(status)}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-2">{count}</div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className={`h-3 rounded-full ${getStatusColor(status)} shadow-sm`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm font-medium text-gray-600">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Enhanced Revenue by Plan */}
            <div className="lg:col-span-1 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-green-600" />
                  Revenue by Plan
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  {['STARTER', 'SOLO', 'PRO', 'INSTITUTIONAL'].map((planType) => {
                    // Map plan types to display names
                    const planDisplayNames = {
                      'STARTER': 'Starter Plan',
                      'SOLO': 'Solo Plan',
                      'PRO': 'Pro Plan',
                      'INSTITUTIONAL': 'Institutional Plan'
                    };

                    const revenue = Array.isArray(analytics.revenueByPlan)
                      ? analytics.revenueByPlan.find(i => i.planType === planType)?.total || 0
                      : 0;
                    const totalRevenue = Array.isArray(analytics.revenueByPlan)
                      ? analytics.revenueByPlan.reduce((sum, item) => sum + Number(item.total || 0), 0) || 1
                      : 1;
                    const percentage = calculatePercentage(revenue, totalRevenue);

                    return (
                      <div key={planType} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-800 mb-2">{planDisplayNames[planType] || planType}</div>
                          <div className="text-xl font-bold text-green-600 mb-3">₹{revenue}</div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-sm"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm font-medium text-gray-600">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    {/* Users List */}
    <div className="lg:col-span-1 bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Registered Users</h3>
        <p className="text-sm text-gray-500 mt-1">Total: {users.length} users</p>
      </div>
      
      {/* Role Filter */}
      <div className="p-4 border-b border-gray-200">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SALES">Sales</option>
          <option value="MODERATOR">Moderator</option>
        </select>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No users found</div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 hover:bg-blue-50 cursor-pointer transition-all duration-200 rounded-lg border ${
                  selectedUser?.id === user.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-gray-100 hover:border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      {user.email}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                      {user._count?.payments > 0 && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {user._count.payments} payments
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Joined {formatDate(user.createdAt)}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination - reuse your existing pagination component */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>

    {/* User Details */}
    <div className="lg:col-span-2 bg-white shadow rounded-lg">
      {selectedUser ? (
        <>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">User Details</h2>
            <div className="flex space-x-2">
              {role === 'ADMIN' && (
                <button
                  onClick={() => setIsEditingUserRole(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Role
                </button>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {isEditingUserRole ? (
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User Role</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Role</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Role</label>
                  <select
                    onChange={(e) => {
                      if (window.confirm(`Are you sure you want to change ${selectedUser.name}'s role to ${e.target.value}?`)) {
                        updateUserRole(selectedUser.id, e.target.value);
                      }
                    }}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Select new role...</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SALES">Sales</option>
                    
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditingUserRole(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.phonenumber}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Age</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.age}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">User Class</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.userClass}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <div className="mt-1">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                </div>
                
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser._count?.payments || 0}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser._count?.subscriptions || 0}</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-6">
          <div className="text-center mb-6">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">User Management</h3>
            <p className="mt-1 text-sm text-gray-500">Select a user from the list to view details and manage their account.</p>
          </div>
          
          {/* User Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">User Statistics</h4>
            <div className="grid grid-cols-2 gap-3">
              {userStats.map((stat) => (
                <div key={stat.role} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{stat._count.id}</div>
                    <div className="text-xs text-gray-600">{stat.role}S</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}


      </main>
    </div>
  );
};

export default SalesDashboard;
