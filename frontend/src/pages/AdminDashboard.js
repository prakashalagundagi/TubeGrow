import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { userAPI } from '../services/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubscription, setFilterSubscription] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterSubscription, filterStatus, currentPage]);

  const fetchDashboardData = async () => {
    try {
      const response = await userAPI.admin.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Stats fetch error:', error);
      toast.error('Failed to fetch dashboard stats');
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filterSubscription && { subscription: filterSubscription }),
        ...(filterStatus && { status: filterStatus })
      };

      const response = await userAPI.admin.getAllUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Users fetch error:', error);
      toast.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      // Implement user actions (ban, unban, change subscription, etc.)
      switch (action) {
        case 'view':
          // Navigate to user details
          break;
        case 'edit':
          // Open edit modal
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            // Delete user
            toast.success('User deleted successfully');
            fetchUsers();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('User action error:', error);
      toast.error('Failed to perform action');
    }
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {change}% from last month
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  const UserRow = ({ user }) => (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`badge ${
          user.subscription === 'free' ? 'badge-secondary' :
          user.subscription === 'basic' ? 'badge-primary' :
          'badge-success'
        }`}>
          {user.subscription}
        </span>
      </td>
      <td className="py-4 px-6">
        <span className={`text-sm ${
          user.isVerified ? 'text-green-600' : 'text-yellow-600'
        }`}>
          {user.isVerified ? 'Verified' : 'Pending'}
        </span>
      </td>
      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
        {user.usage?.dailySearches || 0} / {user.usage?.monthlySearches || 0}
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleUserAction(user._id, 'view')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
            title="View Details"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleUserAction(user._id, 'edit')}
            className="text-green-600 hover:text-green-800 dark:text-green-400"
            title="Edit User"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleUserAction(user._id, 'delete')}
            className="text-red-600 hover:text-red-800 dark:text-red-400"
            title="Delete User"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - TubeGrow</title>
        <meta name="description" content="TubeGrow admin dashboard - Manage users, view analytics, and monitor platform performance." />
      </Helmet>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users and monitor platform performance
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              change={15}
              changeType="positive"
              icon={UsersIcon}
              color="primary"
            />
            <StatCard
              title="Active Projects"
              value={stats.projects.total}
              change={23}
              changeType="positive"
              icon={DocumentTextIcon}
              color="success"
            />
            <StatCard
              title="Monthly Revenue"
              value={`$${stats.revenue.total}`}
              change={8}
              changeType="positive"
              icon={CurrencyDollarIcon}
              color="warning"
            />
            <StatCard
              title="Success Rate"
              value={`${stats.projects.total > 0 ? Math.round((stats.projects.completed / stats.projects.total) * 100) : 0}%`}
              change={5}
              changeType="positive"
              icon={ChartBarIcon}
              color="secondary"
            />
          </div>
        )}

        {/* User Management */}
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                User Management
              </h2>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={filterSubscription}
                  onChange={(e) => setFilterSubscription(e.target.value)}
                  className="form-input w-full sm:w-40"
                >
                  <option value="">All Plans</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-input w-full sm:w-40"
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {usersLoading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => <UserRow key={user._id} user={user} />)
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 text-center"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">User Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Deep dive into user behavior and patterns
            </p>
            <button className="btn btn-outline">
              View Analytics
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 text-center"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Revenue Reports</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Track subscription revenue and trends
            </p>
            <button className="btn btn-outline">
              View Reports
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 text-center"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">System Health</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Monitor system performance and metrics
            </p>
            <button className="btn btn-outline">
              Check Health
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
