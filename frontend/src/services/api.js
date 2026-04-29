import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log slow requests in development
    if (process.env.NODE_ENV === 'development' && duration > 2000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Handle rate limiting
      if (status === 429) {
        console.warn('Rate limit exceeded:', data.message);
      }
      
      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Other error
      console.error('API error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
  refreshToken: () => api.post('/auth/refresh-token'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAnalytics: (params) => api.get('/users/analytics', { params }),
  getProjects: (params) => api.get('/users/projects', { params }),
  getUsage: () => api.get('/users/usage'),
  deleteAccount: () => api.delete('/users/account'),
  exportData: () => api.post('/users/export-data'),
  
  // Admin endpoints
  admin: {
    getAllUsers: (params) => api.get('/users/admin/all', { params }),
    getStats: () => api.get('/users/admin/stats'),
  },
};

export const videoAPI = {
  analyzeVideo: (data) => api.post('/videos/analyze', data),
  generateSEO: (data) => api.post('/videos/generate-seo', data),
  analyzeComments: (videoId) => api.post('/videos/analyze-comments', { videoId }),
  getVideoDetails: (videoUrl) => api.post('/videos/details', { videoUrl }),
  bulkAnalyze: (videoUrls) => api.post('/videos/bulk-analyze', { videoUrls }),
  competitorAnalysis: (videoUrl) => api.post('/videos/competitor-analysis', { videoUrl }),
};

export const projectAPI = {
  createProject: (projectData) => api.post('/projects', projectData),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  exportProject: (id, format) => api.post(`/projects/${id}/export`, { format }),
  shareProject: (id) => api.post(`/projects/${id}/share`),
  getSharedProject: (shareToken) => api.get(`/projects/shared/${shareToken}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getPerformance: (params) => api.get('/analytics/performance', { params }),
  getReports: (params) => api.get('/analytics/reports', { params }),
  generateReport: (reportData) => api.post('/analytics/generate-report', reportData),
};

export const paymentAPI = {
  getPlans: () => api.get('/payments/plans'),
  createSubscription: (planId) => api.post('/payments/subscribe', { planId }),
  cancelSubscription: () => api.post('/payments/cancel'),
  getSubscription: () => api.get('/payments/subscription'),
  updatePaymentMethod: (paymentData) => api.put('/payments/payment-method', paymentData),
  getPaymentHistory: () => api.get('/payments/history'),
  
  // Stripe specific
  createStripeSession: (planId) => api.post('/payments/stripe/create-session', { planId }),
  confirmStripePayment: (sessionId) => api.post('/payments/stripe/confirm', { sessionId }),
  
  // Razorpay specific
  createRazorpayOrder: (planId) => api.post('/payments/razorpay/create-order', { planId }),
  verifyRazorpayPayment: (paymentData) => api.post('/payments/razorpay/verify', paymentData),
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'Server error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      data: null,
    };
  }
};

// Request retry utility
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication errors or client errors
      if (error.response?.status === 401 || error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

export default api;
