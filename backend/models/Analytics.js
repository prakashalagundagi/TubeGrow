const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Daily analytics
  daily: [{
    date: {
      type: Date,
      required: true
    },
    searches: {
      type: Number,
      default: 0
    },
    projectsCreated: {
      type: Number,
      default: 0
    },
    videosAnalyzed: {
      type: Number,
      default: 0
    },
    exportCount: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    }
  }],
  
  // Monthly analytics
  monthly: [{
    month: {
      type: String, // Format: "2024-01"
      required: true
    },
    searches: {
      type: Number,
      default: 0
    },
    projectsCreated: {
      type: Number,
      default: 0
    },
    videosAnalyzed: {
      type: Number,
      default: 0
    },
    exportCount: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    },
    subscription: {
      type: String,
      enum: ['free', 'basic', 'pro'],
      default: 'free'
    }
  }],
  
  // Feature usage
  featureUsage: {
    titleGenerator: {
      type: Number,
      default: 0
    },
    descriptionGenerator: {
      type: Number,
      default: 0
    },
    tagGenerator: {
      type: Number,
      default: 0
    },
    thumbnailText: {
      type: Number,
      default: 0
    },
    videoAnalysis: {
      type: Number,
      default: 0
    },
    commentAnalysis: {
      type: Number,
      default: 0
    },
    competitorAnalysis: {
      type: Number,
      default: 0
    },
    bulkAnalysis: {
      type: Number,
      default: 0
    }
  },
  
  // Performance metrics
  performance: {
    averageSeoScore: {
      type: Number,
      default: 0
    },
    totalProjects: {
      type: Number,
      default: 0
    },
    successfulProjects: {
      type: Number,
      default: 0
    },
    failedProjects: {
      type: Number,
      default: 0
    },
    averageProcessingTime: {
      type: Number,
      default: 0 // in seconds
    }
  },
  
  // Subscription analytics
  subscription: {
    currentPlan: {
      type: String,
      enum: ['free', 'basic', 'pro'],
      default: 'free'
    },
    planHistory: [{
      plan: String,
      startDate: Date,
      endDate: Date,
      price: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }],
    totalSpent: {
      type: Number,
      default: 0
    },
    savingsWithPro: {
      type: Number,
      default: 0
    }
  },
  
  // Engagement metrics
  engagement: {
    loginCount: {
      type: Number,
      default: 0
    },
    lastLogin: Date,
    averageSessionDuration: {
      type: Number,
      default: 0 // in minutes
    },
    mostActiveDay: {
      type: String,
      default: ''
    },
    mostActiveHour: {
      type: Number,
      default: 0
    }
  },
  
  // Top performing projects
  topProjects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    seoScore: Number,
    views: Number,
    engagement: Number
  }],
  
  // Trending topics analyzed
  trendingTopics: [{
    topic: String,
    frequency: Number,
    averageSeoScore: Number,
    lastAnalyzed: Date
  }]
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ user: 1 });
analyticsSchema.index({ 'daily.date': 1 });
analyticsSchema.index({ 'monthly.month': 1 });

// Update daily analytics
analyticsSchema.methods.updateDailyStats = function(action, data = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let dailyRecord = this.daily.find(d => 
    d.date.toDateString() === today.toDateString()
  );
  
  if (!dailyRecord) {
    dailyRecord = {
      date: today,
      searches: 0,
      projectsCreated: 0,
      videosAnalyzed: 0,
      exportCount: 0,
      apiCalls: 0
    };
    this.daily.push(dailyRecord);
  }
  
  switch (action) {
    case 'search':
      dailyRecord.searches += 1;
      break;
    case 'project':
      dailyRecord.projectsCreated += 1;
      break;
    case 'video':
      dailyRecord.videosAnalyzed += 1;
      break;
    case 'export':
      dailyRecord.exportCount += 1;
      break;
    case 'api':
      dailyRecord.apiCalls += 1;
      break;
  }
  
  return this.save();
};

// Update monthly analytics
analyticsSchema.methods.updateMonthlyStats = function(action, data = {}) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let monthlyRecord = this.monthly.find(m => m.month === monthKey);
  
  if (!monthlyRecord) {
    monthlyRecord = {
      month: monthKey,
      searches: 0,
      projectsCreated: 0,
      videosAnalyzed: 0,
      exportCount: 0,
      apiCalls: 0,
      subscription: this.subscription.currentPlan
    };
    this.monthly.push(monthlyRecord);
  }
  
  switch (action) {
    case 'search':
      monthlyRecord.searches += 1;
      break;
    case 'project':
      monthlyRecord.projectsCreated += 1;
      break;
    case 'video':
      monthlyRecord.videosAnalyzed += 1;
      break;
    case 'export':
      monthlyRecord.exportCount += 1;
      break;
    case 'api':
      monthlyRecord.apiCalls += 1;
      break;
  }
  
  return this.save();
};

// Update feature usage
analyticsSchema.methods.updateFeatureUsage = function(feature) {
  if (this.featureUsage[feature] !== undefined) {
    this.featureUsage[feature] += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Calculate performance metrics
analyticsSchema.methods.calculatePerformance = function(projects) {
  if (!projects || projects.length === 0) return this;
  
  const successfulProjects = projects.filter(p => p.status === 'completed');
  const failedProjects = projects.filter(p => p.status === 'failed');
  
  this.performance.totalProjects = projects.length;
  this.performance.successfulProjects = successfulProjects.length;
  this.performance.failedProjects = failedProjects.length;
  
  if (successfulProjects.length > 0) {
    const totalSeoScore = successfulProjects.reduce((sum, p) => sum + (p.metrics?.seoScore || 0), 0);
    this.performance.averageSeoScore = Math.round(totalSeoScore / successfulProjects.length);
  }
  
  return this.save();
};

// Get growth metrics
analyticsSchema.methods.getGrowthMetrics = function() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const lastMonthData = this.monthly.find(m => new Date(m.month) >= lastMonth && new Date(m.month) < thisMonth);
  const thisMonthData = this.monthly.find(m => new Date(m.month) >= thisMonth);
  
  const growth = {
    searches: 0,
    projects: 0,
    videos: 0
  };
  
  if (lastMonthData && thisMonthData) {
    growth.searches = thisMonthData.searches - lastMonthData.searches;
    growth.projects = thisMonthData.projectsCreated - lastMonthData.projectsCreated;
    growth.videos = thisMonthData.videosAnalyzed - lastMonthData.videosAnalyzed;
  }
  
  return growth;
};

module.exports = mongoose.model('Analytics', analyticsSchema);
