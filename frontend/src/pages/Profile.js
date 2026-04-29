import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  EnvelopeIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CogIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI } from '../services/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    preferences: {
      darkMode: false,
      emailNotifications: true,
      language: 'en'
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        preferences: {
          darkMode: isDark,
          emailNotifications: user.preferences?.emailNotifications ?? true,
          language: user.preferences?.language || 'en'
        }
      });
    }
  }, [user, isDark]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateUser(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    
    try {
      const response = await userAPI.exportData();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tubegrow-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      return;
    }
    
    if (!confirm('This is your last chance. All your projects, analytics, and data will be permanently deleted. Are you absolutely sure?')) {
      return;
    }
    
    try {
      await userAPI.deleteAccount();
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
    { id: 'data', name: 'Data & Privacy', icon: DocumentTextIcon },
  ];

  return (
    <>
      <Helmet>
        <title>Profile - TubeGrow</title>
        <meta name="description" content="Manage your TubeGrow profile, security settings, and preferences." />
      </Helmet>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-16 h-16 text-gray-600" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Subscription Plan</label>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium capitalize">{user?.subscription || 'Free'}</span>
                      <button
                        type="button"
                        onClick={() => window.location.href = '/pricing'}
                        className="btn btn-outline btn-sm"
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="card p-6">
                  <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="form-input"
                        required
                        minLength="6"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                      >
                        {loading ? <LoadingSpinner size="sm" /> : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-semibold mb-6 text-red-600">Danger Zone</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="btn btn-error"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Toggle dark mode theme
                      </p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive email updates about your account
                      </p>
                    </div>
                    <button
                      onClick={() => setProfileData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          emailNotifications: !prev.preferences.emailNotifications
                        }
                      }))}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileData.preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div>
                    <label className="form-label">Language</label>
                    <select
                      value={profileData.preferences.language}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          language: e.target.value
                        }
                      }))}
                      className="form-input"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="pt">Português</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="card p-6">
                  <h2 className="text-xl font-semibold mb-6">Data Export</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Download all your data including projects, analytics, and account information.
                  </p>
                  
                  <button
                    onClick={handleExportData}
                    disabled={exporting}
                    className="btn btn-primary"
                  >
                    {exporting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Export All Data
                      </>
                    )}
                  </button>
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium">Profile Visibility</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Control who can see your profile
                        </p>
                      </div>
                      <select className="form-input w-32">
                        <option>Private</option>
                        <option>Public</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium">Data Collection</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow us to collect usage data for improvements
                        </p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium">Marketing Emails</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive promotional emails and updates
                        </p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-semibold mb-6">Account Activity</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Review your recent account activity and login history.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="badge badge-success">Active</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
