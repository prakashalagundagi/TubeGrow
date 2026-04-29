const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['topic_analysis', 'video_analysis', 'competitor_analysis'],
    required: true
  },
  
  // Input data
  input: {
    topic: {
      type: String,
      trim: true
    },
    videoUrl: {
      type: String,
      trim: true
    },
    videoId: {
      type: String,
      trim: true
    }
  },
  
  // Generated SEO content
  seoContent: {
    titles: [{
      title: String,
      score: Number,
      reason: String
    }],
    descriptions: [{
      description: String,
      score: Number,
      reason: String
    }],
    tags: [{
      tag: String,
      relevance: Number,
      category: String
    }],
    thumbnailText: [{
      text: String,
      impact: Number,
      style: String
    }]
  },
  
  // Video analysis data (if video URL provided)
  videoData: {
    title: String,
    description: String,
    tags: [String],
    thumbnail: String,
    publishedAt: Date,
    duration: String,
    views: Number,
    likes: Number,
    dislikes: Number,
    comments: Number,
    channel: {
      name: String,
      id: String,
      subscribers: Number
    }
  },
  
  // Comment sentiment analysis
  commentAnalysis: {
    totalComments: Number,
    analyzedComments: Number,
    sentiments: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 }
    },
    topPositiveComments: [{
      text: String,
      sentiment: Number,
      likes: Number
    }],
    topNegativeComments: [{
      text: String,
      sentiment: Number,
      likes: Number
    }],
    keywords: [{
      word: String,
      frequency: Number,
      sentiment: String
    }]
  },
  
  // Competitor analysis (if applicable)
  competitorAnalysis: {
    competitors: [{
      videoId: String,
      title: String,
      views: Number,
      engagement: Number,
      commonTags: [String]
    }],
    marketInsights: {
      averageViews: Number,
      averageEngagement: Number,
      trendingTags: [String],
      bestPublishingTimes: [String]
    }
  },
  
  // Performance metrics
  metrics: {
    seoScore: {
      type: Number,
      min: 0,
      max: 100
    },
    viralPotential: {
      type: Number,
      min: 0,
      max: 100
    },
    competitionLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  error: {
    type: String,
    default: null
  },
  
  // Export settings
  exports: {
    pdf: {
      type: Boolean,
      default: false
    },
    csv: {
      type: Boolean,
      default: false
    },
    json: {
      type: Boolean,
      default: false
    }
  },
  
  // Sharing settings
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'input.videoId': 1 });
projectSchema.index({ shareToken: 1 });

// Generate share token
projectSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareToken) {
    this.shareToken = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

// Calculate SEO score
projectSchema.methods.calculateSeoScore = function() {
  if (!this.seoContent) return 0;
  
  let score = 0;
  let factors = 0;
  
  // Title quality
  if (this.seoContent.titles && this.seoContent.titles.length > 0) {
    const avgTitleScore = this.seoContent.titles.reduce((sum, title) => sum + title.score, 0) / this.seoContent.titles.length;
    score += avgTitleScore * 0.3;
    factors += 0.3;
  }
  
  // Description quality
  if (this.seoContent.descriptions && this.seoContent.descriptions.length > 0) {
    const avgDescScore = this.seoContent.descriptions.reduce((sum, desc) => sum + desc.score, 0) / this.seoContent.descriptions.length;
    score += avgDescScore * 0.2;
    factors += 0.2;
  }
  
  // Tag relevance
  if (this.seoContent.tags && this.seoContent.tags.length > 0) {
    const avgTagRelevance = this.seoContent.tags.reduce((sum, tag) => sum + tag.relevance, 0) / this.seoContent.tags.length;
    score += avgTagRelevance * 0.3;
    factors += 0.3;
  }
  
  // Thumbnail impact
  if (this.seoContent.thumbnailText && this.seoContent.thumbnailText.length > 0) {
    const avgThumbnailImpact = this.seoContent.thumbnailText.reduce((sum, thumb) => sum + thumb.impact, 0) / this.seoContent.thumbnailText.length;
    score += avgThumbnailImpact * 0.2;
    factors += 0.2;
  }
  
  this.metrics.seoScore = factors > 0 ? Math.round(score / factors) : 0;
  return this.metrics.seoScore;
};

module.exports = mongoose.model('Project', projectSchema);
