const express = require('express');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const Project = require('../models/Project');
const { protect, admin } = require('../middleware/auth');
const { validateProfileUpdate, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user analytics
    const analytics = await Analytics.findOne({ user: req.user.id });
    
    // Get recent projects
    const recentProjects = await Project.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type status createdAt metrics.seoScore');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar,
        preferences: user.preferences,
        usage: user.usage,
        subscriptionEnds: user.subscriptionEnds,
        isVerified: user.isVerified
      },
      analytics: analytics ? {
        totalProjects: analytics.performance.totalProjects,
        successfulProjects: analytics.performance.successfulProjects,
        averageSeoScore: analytics.performance.averageSeoScore,
        loginCount: analytics.engagement.loginCount,
        lastLogin: analytics.engagement.lastLogin
      } : null,
      recentProjects
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, async (req, res, next) => {
  try {
    const { name, email, preferences } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/analytics
// @desc    Get user analytics
// @access  Private
router.get('/analytics', protect, validatePagination, async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const { startDate, endDate } = req.query;

    const analytics = await Analytics.findOne({ user: req.user.id });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }

    // Filter daily analytics by date range if provided
    let dailyAnalytics = analytics.daily;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      dailyAnalytics = dailyAnalytics.filter(d => 
        d.date >= start && d.date <= end
      );
    }

    // Sort and paginate
    dailyAnalytics.sort((a, b) => b.date - a.date);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedDaily = dailyAnalytics.slice(startIndex, endIndex);

    res.json({
      success: true,
      analytics: {
        performance: analytics.performance,
        featureUsage: analytics.featureUsage,
        subscription: analytics.subscription,
        engagement: analytics.engagement,
        topProjects: analytics.topProjects,
        trendingTopics: analytics.trendingTopics,
        growth: analytics.getGrowthMetrics()
      },
      dailyAnalytics: paginatedDaily,
      monthlyAnalytics: analytics.monthly.sort((a, b) => b.month.localeCompare(a.month)),
      pagination: {
        page,
        limit,
        total: dailyAnalytics.length,
        pages: Math.ceil(dailyAnalytics.length / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/projects
// @desc    Get user projects
// @access  Private
router.get('/projects', protect, validatePagination, async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const { status, type, search } = req.query;

    // Build query
    const query = { user: req.user.id };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'input.topic': { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title type status createdAt metrics.seoScore input.videoData views');

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/usage
// @desc    Get user usage statistics
// @access  Private
router.get('/usage', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const usageInfo = user.canSearch();

    // Get today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analytics = await Analytics.findOne({ user: req.user.id });
    const todayStats = analytics?.daily.find(d => 
      d.date.toDateString() === today.toDateString()
    );

    res.json({
      success: true,
      usage: {
        current: user.usage,
        limits: usageInfo,
        today: todayStats || {
          searches: 0,
          projectsCreated: 0,
          videosAnalyzed: 0,
          exportCount: 0,
          apiCalls: 0
        },
        subscription: user.subscription,
        subscriptionEnds: user.subscriptionEnds
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Project.deleteMany({ user: userId }),
      Analytics.deleteMany({ user: userId })
    ]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/export-data
// @desc    Export user data (GDPR compliance)
// @access  Private
router.post('/export-data', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all user data
    const [user, projects, analytics] = await Promise.all([
      User.findById(userId).select('-password'),
      Project.find({ user: userId }),
      Analytics.findOne({ user: userId })
    ]);

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        preferences: user.preferences,
        createdAt: user.createdAt
      },
      projects: projects.map(p => ({
        title: p.title,
        type: p.type,
        status: p.status,
        createdAt: p.createdAt,
        metrics: p.metrics,
        seoContent: p.seoContent
      })),
      analytics: analytics ? {
        performance: analytics.performance,
        featureUsage: analytics.featureUsage,
        daily: analytics.daily.slice(-30), // Last 30 days
        monthly: analytics.monthly
      } : null,
      exportedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes

// @route   GET /api/users/admin/all
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/admin/all', protect, admin, validatePagination, async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const { search, subscription, status } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (subscription) query.subscription = subscription;
    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/admin/stats
// @desc    Get platform statistics (admin only)
// @access  Private/Admin
router.get('/admin/stats', protect, admin, async (req, res, next) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      freeUsers,
      basicUsers,
      proUsers,
      totalProjects,
      completedProjects,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ subscription: 'free' }),
      User.countDocuments({ subscription: 'basic' }),
      User.countDocuments({ subscription: 'pro' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'completed' }),
      // TODO: Calculate actual revenue from payments
      0
    ]);

    // Get monthly growth
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    const newProjects = await Project.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          unverified: totalUsers - verifiedUsers,
          newThisMonth: newUsers,
          subscriptions: {
            free: freeUsers,
            basic: basicUsers,
            pro: proUsers
          }
        },
        projects: {
          total: totalProjects,
          completed: completedProjects,
          pending: totalProjects - completedProjects,
          newThisMonth: newProjects
        },
        revenue: {
          total: totalRevenue,
          // TODO: Add monthly revenue calculation
          monthly: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
