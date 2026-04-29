const express = require('express');
const { protect } = require('../middleware/auth');
const { validatePagination, validateDateRange } = require('../middleware/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', validatePagination, async (req, res, next) => {
  try {
    const Analytics = require('../models/Analytics');
    const Project = require('../models/Project');
    
    const analytics = await Analytics.findOne({ user: req.user.id });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }

    // Get recent projects for additional context
    const recentProjects = await Project.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title type status createdAt metrics.seoScore');

    // Calculate growth metrics
    const growth = analytics.getGrowthMetrics();

    res.json({
      success: true,
      data: {
        performance: analytics.performance,
        featureUsage: analytics.featureUsage,
        engagement: analytics.engagement,
        topProjects: analytics.topProjects,
        trendingTopics: analytics.trendingTopics,
        growth,
        recentProjects: recentProjects.map(project => ({
          id: project._id,
          title: project.title,
          type: project.type,
          status: project.status,
          createdAt: project.createdAt,
          seoScore: project.metrics?.seoScore || 0
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/trends
// @desc    Get analytics trends over time
// @access  Private
router.get('/trends', validatePagination, validateDateRange, async (req, res, next) => {
  try {
    const Analytics = require('../models/Analytics');
    const { startDate, endDate } = req.query;
    
    const analytics = await Analytics.findOne({ user: req.user.id });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }

    // Filter daily analytics by date range
    let dailyAnalytics = analytics.daily;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      dailyAnalytics = dailyAnalytics.filter(d => 
        d.date >= start && d.date <= end
      );
    }

    // Sort by date
    dailyAnalytics.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate trends
    const trends = {
      searches: dailyAnalytics.map(d => ({
        date: d.date,
        value: d.searches
      })),
      projects: dailyAnalytics.map(d => ({
        date: d.date,
        value: d.projectsCreated
      })),
      videos: dailyAnalytics.map(d => ({
        date: d.date,
        value: d.videosAnalyzed
      })),
      exports: dailyAnalytics.map(d => ({
        date: d.date,
        value: d.exportCount
      }))
    };

    res.json({
      success: true,
      data: {
        trends,
        summary: {
          totalSearches: dailyAnalytics.reduce((sum, d) => sum + d.searches, 0),
          totalProjects: dailyAnalytics.reduce((sum, d) => sum + d.projectsCreated, 0),
          totalVideos: dailyAnalytics.reduce((sum, d) => sum + d.videosAnalyzed, 0),
          totalExports: dailyAnalytics.reduce((sum, d) => sum + d.exportCount, 0),
          averageDaily: {
            searches: Math.round(dailyAnalytics.reduce((sum, d) => sum + d.searches, 0) / dailyAnalytics.length),
            projects: Math.round(dailyAnalytics.reduce((sum, d) => sum + d.projectsCreated, 0) / dailyAnalytics.length),
            videos: Math.round(dailyAnalytics.reduce((sum, d) => sum + d.videosAnalyzed, 0) / dailyAnalytics.length)
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/performance
// @desc    Get performance metrics
// @access  Private
router.get('/performance', async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const Analytics = require('../models/Analytics');
    
    // Get all user projects
    const projects = await Project.find({ user: req.user.id });
    
    if (projects.length === 0) {
      return res.json({
        success: true,
        data: {
          totalProjects: 0,
          successfulProjects: 0,
          failedProjects: 0,
          averageSeoScore: 0,
          averageProcessingTime: 0,
          completionRate: 0,
          projectsByType: {},
          projectsByStatus: {},
          seoScoreDistribution: {
            excellent: 0,
            good: 0,
            average: 0,
            poor: 0
          }
        }
      });
    }

    // Calculate performance metrics
    const successfulProjects = projects.filter(p => p.status === 'completed');
    const failedProjects = projects.filter(p => p.status === 'failed');
    const pendingProjects = projects.filter(p => p.status === 'pending');
    const processingProjects = projects.filter(p => p.status === 'processing');

    // Calculate average SEO score
    const projectsWithScore = projects.filter(p => p.metrics?.seoScore);
    const averageSeoScore = projectsWithScore.length > 0
      ? Math.round(projectsWithScore.reduce((sum, p) => sum + p.metrics.seoScore, 0) / projectsWithScore.length)
      : 0;

    // Group projects by type
    const projectsByType = projects.reduce((acc, project) => {
      acc[project.type] = (acc[project.type] || 0) + 1;
      return acc;
    }, {});

    // Group projects by status
    const projectsByStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    // SEO score distribution
    const seoScoreDistribution = projectsWithScore.reduce((acc, project) => {
      const score = project.metrics.seoScore;
      if (score >= 80) acc.excellent++;
      else if (score >= 60) acc.good++;
      else if (score >= 40) acc.average++;
      else acc.poor++;
      return acc;
    }, { excellent: 0, good: 0, average: 0, poor: 0 });

    // Get analytics for additional metrics
    const analytics = await Analytics.findOne({ user: req.user.id });

    res.json({
      success: true,
      data: {
        totalProjects: projects.length,
        successfulProjects: successfulProjects.length,
        failedProjects: failedProjects.length,
        pendingProjects: pendingProjects.length,
        processingProjects: processingProjects.length,
        averageSeoScore,
        averageProcessingTime: analytics?.performance.averageProcessingTime || 0,
        completionRate: projects.length > 0 ? Math.round((successfulProjects.length / projects.length) * 100) : 0,
        projectsByType,
        projectsByStatus,
        seoScoreDistribution,
        featureUsage: analytics?.featureUsage || {},
        topPerformingProjects: projects
          .filter(p => p.metrics?.seoScore)
          .sort((a, b) => b.metrics.seoScore - a.metrics.seoScore)
          .slice(0, 5)
          .map(p => ({
            id: p._id,
            title: p.title,
            type: p.type,
            seoScore: p.metrics.seoScore,
            createdAt: p.createdAt
          }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/reports
// @desc    Get available reports
// @access  Private
router.get('/reports', async (req, res, next) => {
  try {
    const Analytics = require('../models/Analytics');
    
    const analytics = await Analytics.findOne({ user: req.user.id });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found'
      });
    }

    // Generate report data
    const reports = [
      {
        id: 'monthly-summary',
        name: 'Monthly Summary',
        description: 'Overview of your monthly activity and performance',
        type: 'monthly',
        available: true,
        lastGenerated: analytics.monthly.length > 0 ? analytics.monthly[analytics.monthly.length - 1].month : null
      },
      {
        id: 'performance-report',
        name: 'Performance Report',
        description: 'Detailed analysis of your project performance',
        type: 'performance',
        available: analytics.performance.totalProjects > 0,
        lastGenerated: new Date().toISOString()
      },
      {
        id: 'usage-report',
        name: 'Usage Report',
        description: 'Breakdown of your feature usage and limits',
        type: 'usage',
        available: true,
        lastGenerated: new Date().toISOString()
      },
      {
        id: 'seo-analysis',
        name: 'SEO Analysis',
        description: 'Analysis of your SEO content effectiveness',
        type: 'seo',
        available: analytics.performance.averageSeoScore > 0,
        lastGenerated: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/analytics/generate-report
// @desc    Generate a specific report
// @access  Private
router.post('/generate-report', async (req, res, next) => {
  try {
    const { reportType, format, dateRange } = req.body;
    
    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    const Analytics = require('../models/Analytics');
    const Project = require('../models/Project');
    const User = require('../models/User');
    
    const analytics = await Analytics.findOne({ user: req.user.id });
    const projects = await Project.find({ user: req.user.id });
    const user = await User.findById(req.user.id);

    let reportData = {};

    switch (reportType) {
      case 'monthly-summary':
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyData = analytics.monthly.find(m => m.month === currentMonth);
        
        reportData = {
          title: 'Monthly Summary Report',
          period: currentMonth,
          user: {
            name: user.name,
            email: user.email,
            subscription: user.subscription
          },
          summary: monthlyData || {
            searches: 0,
            projectsCreated: 0,
            videosAnalyzed: 0,
            exportCount: 0,
            apiCalls: 0
          },
          performance: analytics.performance,
          growth: analytics.getGrowthMetrics()
        };
        break;

      case 'performance-report':
        const successfulProjects = projects.filter(p => p.status === 'completed');
        const averageSeoScore = successfulProjects.length > 0
          ? Math.round(successfulProjects.reduce((sum, p) => sum + (p.metrics?.seoScore || 0), 0) / successfulProjects.length)
          : 0;

        reportData = {
          title: 'Performance Report',
          period: dateRange || 'All time',
          summary: {
            totalProjects: projects.length,
            successfulProjects: successfulProjects.length,
            completionRate: projects.length > 0 ? Math.round((successfulProjects.length / projects.length) * 100) : 0,
            averageSeoScore
          },
          projects: projects.map(p => ({
            title: p.title,
            type: p.type,
            status: p.status,
            createdAt: p.createdAt,
            seoScore: p.metrics?.seoScore || 0
          })),
          featureUsage: analytics.featureUsage
        };
        break;

      case 'usage-report':
        reportData = {
          title: 'Usage Report',
          period: dateRange || 'Last 30 days',
          user: {
            name: user.name,
            subscription: user.subscription,
            usage: user.usage
          },
          featureUsage: analytics.featureUsage,
          dailyUsage: analytics.daily.slice(-30),
          limits: user.canSearch()
        };
        break;

      case 'seo-analysis':
        const projectsWithSeo = projects.filter(p => p.metrics?.seoScore);
        const seoScores = projectsWithSeo.map(p => p.metrics.seoScore);
        
        reportData = {
          title: 'SEO Analysis Report',
          period: dateRange || 'All time',
          summary: {
            totalAnalyzed: projectsWithSeo.length,
            averageScore: seoScores.length > 0 ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length) : 0,
            highestScore: seoScores.length > 0 ? Math.max(...seoScores) : 0,
            lowestScore: seoScores.length > 0 ? Math.min(...seoScores) : 0
          },
          projects: projectsWithSeo.map(p => ({
            title: p.title,
            seoScore: p.metrics.seoScore,
            viralPotential: p.metrics.viralPotential,
            competitionLevel: p.metrics.competitionLevel
          })),
          recommendations: generateSeoRecommendations(averageSeoScore)
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    // Add metadata
    reportData.generatedAt = new Date().toISOString();
    reportData.generatedBy = 'TubeGrow Analytics System';

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate SEO recommendations
function generateSeoRecommendations(averageScore) {
  const recommendations = [];

  if (averageScore < 60) {
    recommendations.push({
      category: 'Content Quality',
      priority: 'High',
      recommendation: 'Focus on creating more comprehensive and engaging content. Consider extending video length and adding more value for viewers.',
      impact: 'Significant improvement in SEO rankings and viewer retention'
    });
  }

  if (averageScore < 70) {
    recommendations.push({
      category: 'Title Optimization',
      priority: 'Medium',
      recommendation: 'Use more compelling titles with emotional triggers and numbers. Include relevant keywords naturally.',
      impact: 'Higher click-through rates and better search visibility'
    });
  }

  if (averageScore < 80) {
    recommendations.push({
      category: 'Tag Strategy',
      priority: 'Medium',
      recommendation: 'Research and use more specific long-tail keywords. Include trending topics in your niche.',
      impact: 'Better targeting and discoverability'
    });
  }

  recommendations.push({
    category: 'Consistency',
    priority: 'High',
    recommendation: 'Maintain a regular posting schedule and consistent content quality to build audience trust.',
    impact: 'Improved channel authority and algorithm favor'
  });

  return recommendations;
}

module.exports = router;
