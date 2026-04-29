const axios = require('axios');
const Project = require('../models/Project');
const { protect, checkUsageLimits, incrementUsage } = require('../middleware/auth');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();

// YouTube API service
class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  async getVideoDetails(videoId) {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: this.apiKey,
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      return response.data.items[0];
    } catch (error) {
      console.error('YouTube API error:', error);
      throw new Error('Failed to fetch video details');
    }
  }

  async getVideoComments(videoId, maxResults = 50) {
    try {
      const response = await axios.get(`${this.baseUrl}/commentThreads`, {
        params: {
          part: 'snippet',
          videoId: videoId,
          maxResults: maxResults,
          order: 'relevance',
          key: this.apiKey,
        },
      });

      return response.data.items || [];
    } catch (error) {
      console.error('YouTube Comments API error:', error);
      // Comments might be disabled, so return empty array
      return [];
    }
  }

  extractVideoId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

// SEO Content Generator
class SEOGenerator {
  generateTitles(topic, videoData = null) {
    const titles = [];
    
    if (videoData) {
      // Based on existing video
      const baseTitle = videoData.snippet.title;
      titles.push(
        { title: baseTitle, score: 85, reason: 'Original title' },
        { title: `${baseTitle} | [2024 Update]`, score: 90, reason: 'Timely relevance' },
        { title: `How to ${baseTitle.toLowerCase()}`, score: 82, reason: 'Tutorial format' },
        { title: `${baseTitle} - Complete Guide`, score: 88, reason: 'Comprehensive content' }
      );
    } else {
      // Based on topic
      titles.push(
        { title: `${topic} - Complete Guide [2024]`, score: 90, reason: 'Comprehensive and timely' },
        { title: `How to ${topic} for Beginners`, score: 85, reason: 'Beginner-friendly' },
        { title: `${topic}: Everything You Need to Know`, score: 88, reason: 'Authoritative tone' },
        { title: `Top 10 ${topic} Tips and Tricks`, score: 82, reason: 'List format' },
        { title: `${topic} Explained in 5 Minutes`, score: 79, reason: 'Quick consumption' }
      );
    }
    
    return titles.sort((a, b) => b.score - a.score);
  }

  generateTags(topic, videoData = null) {
    const tags = new Set();
    
    // Add topic-based tags
    const topicWords = topic.toLowerCase().split(' ');
    topicWords.forEach(word => {
      if (word.length > 2) {
        tags.add(word);
        tags.add(`${word} tutorial`);
        tags.add(`${word} guide`);
        tags.add(`how to ${word}`);
      }
    });

    // Add common YouTube tags
    const commonTags = [
      'tutorial', 'guide', 'how to', 'tips', 'tricks', '2024', 'complete guide',
      'step by step', 'for beginners', 'advanced', 'explained', 'overview'
    ];
    commonTags.forEach(tag => tags.add(tag));

    // Add video-specific tags if available
    if (videoData && videoData.snippet) {
      const videoTags = videoData.snippet.tags || [];
      videoTags.forEach(tag => tags.add(tag.toLowerCase()));
      
      // Add channel name
      if (videoData.snippet.channelTitle) {
        tags.add(videoData.snippet.channelTitle.toLowerCase());
      }
    }

    // Convert to array with relevance scores
    const tagArray = Array.from(tags).map(tag => ({
      tag: tag,
      relevance: Math.floor(Math.random() * 30) + 70, // Random relevance between 70-100
      category: this.categorizeTag(tag)
    }));

    return tagArray.sort((a, b) => b.relevance - a.relevance).slice(0, 15);
  }

  generateDescriptions(topic, videoData = null) {
    const descriptions = [];
    
    if (videoData) {
      const baseDesc = videoData.snippet.description || '';
      descriptions.push(
        {
          description: `${baseDesc}\n\n🔔 Subscribe for more content like this!\n👍 Like if you found this helpful!\n💬 Comment with your thoughts!`,
          score: 85,
          reason: 'Enhanced original description'
        },
        {
          description: `In this video, we explore ${videoData.snippet.title}. Learn everything you need to know about this topic.\n\nTimestamps:\n0:00 - Introduction\n1:00 - Main Content\n5:00 - Conclusion\n\n#YouTube #Tutorial #Learning`,
          score: 88,
          reason: 'Structured with timestamps'
        }
      );
    } else {
      descriptions.push(
        {
          description: `Discover everything you need to know about ${topic} in this comprehensive guide. We'll cover the essential concepts, best practices, and tips to help you succeed.\n\n📚 What you'll learn:\n• Fundamental concepts\n• Practical applications\n• Common mistakes to avoid\n• Advanced techniques\n\n🔔 Don't forget to subscribe for more educational content!\n\n#${topic.replace(/\s+/g, '')} #Tutorial #Guide`,
          score: 90,
          reason: 'Comprehensive and structured'
        },
        {
          description: `Looking to master ${topic}? This step-by-step tutorial breaks down complex concepts into easy-to-understand lessons. Perfect for beginners and experienced practitioners alike.\n\n⏰ Key Topics Covered:\n• Getting started basics\n• Core principles\n• Real-world examples\n• Expert tips and tricks\n\n💬 Have questions? Leave them in the comments below!\n\n#HowTo #Education #Skills`,
          score: 88,
          reason: 'Beginner-friendly approach'
        }
      );
    }
    
    return descriptions;
  }

  generateThumbnailText(topic, videoData = null) {
    const texts = [];
    
    if (videoData) {
      const title = videoData.snippet.title;
      texts.push(
        { text: title.substring(0, 50), impact: 85, style: 'Bold' },
        { text: `${title} - 2024`, impact: 82, style: 'Modern' },
        { text: `How to ${title.toLowerCase()}`, impact: 78, style: 'Tutorial' }
      );
    } else {
      texts.push(
        { text: `${topic} GUIDE`, impact: 88, style: 'Bold & Clean' },
        { text: `MASTER ${topic.toUpperCase()}`, impact: 85, style: 'Powerful' },
        { text: `${topic} 2024`, impact: 82, style: 'Modern' },
        { text: `How to ${topic}`, impact: 80, style: 'Tutorial Style' },
        { text: `${topic} Complete Guide`, impact: 83, style: 'Comprehensive' }
      );
    }
    
    return texts;
  }

  categorizeTag(tag) {
    const categories = {
      tutorial: ['tutorial', 'guide', 'how to', 'learn'],
      technical: ['code', 'programming', 'tech', 'software'],
      entertainment: ['funny', 'gaming', 'music', 'movie'],
      educational: ['education', 'learning', 'study', 'course'],
      business: ['business', 'marketing', 'entrepreneur', 'startup']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => tag.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  calculateSeoScore(seoContent) {
    if (!seoContent) return 0;
    
    let score = 0;
    let factors = 0;
    
    // Title quality (30% weight)
    if (seoContent.titles && seoContent.titles.length > 0) {
      const avgTitleScore = seoContent.titles.reduce((sum, title) => sum + title.score, 0) / seoContent.titles.length;
      score += avgTitleScore * 0.3;
      factors += 0.3;
    }
    
    // Description quality (20% weight)
    if (seoContent.descriptions && seoContent.descriptions.length > 0) {
      const avgDescScore = seoContent.descriptions.reduce((sum, desc) => sum + desc.score, 0) / seoContent.descriptions.length;
      score += avgDescScore * 0.2;
      factors += 0.2;
    }
    
    // Tag relevance (30% weight)
    if (seoContent.tags && seoContent.tags.length > 0) {
      const avgTagRelevance = seoContent.tags.reduce((sum, tag) => sum + tag.relevance, 0) / seoContent.tags.length;
      score += avgTagRelevance * 0.3;
      factors += 0.3;
    }
    
    // Thumbnail impact (20% weight)
    if (seoContent.thumbnailText && seoContent.thumbnailText.length > 0) {
      const avgThumbnailImpact = seoContent.thumbnailText.reduce((sum, thumb) => sum + thumb.impact, 0) / seoContent.thumbnailText.length;
      score += avgThumbnailImpact * 0.2;
      factors += 0.2;
    }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  }
}

// Comment Sentiment Analyzer
class CommentAnalyzer {
  analyzeComments(comments) {
    if (!comments || comments.length === 0) {
      return {
        totalComments: 0,
        analyzedComments: 0,
        sentiments: { positive: 0, negative: 0, neutral: 0 },
        topPositiveComments: [],
        topNegativeComments: [],
        keywords: []
      };
    }

    const sentiments = { positive: 0, negative: 0, neutral: 0 };
    const analyzedComments = [];
    const keywords = new Map();

    comments.forEach(commentThread => {
      const comment = commentThread.snippet.topLevelComment.snippet;
      const text = comment.textDisplay;
      
      // Analyze sentiment
      const sentimentResult = sentiment.analyze(text);
      const score = sentimentResult.score;
      
      let sentimentType = 'neutral';
      if (score > 0) {
        sentiments.positive++;
        sentimentType = 'positive';
      } else if (score < 0) {
        sentiments.negative++;
        sentimentType = 'negative';
      } else {
        sentiments.neutral++;
      }

      analyzedComments.push({
        text: text,
        sentiment: score,
        sentimentType: sentimentType,
        likes: comment.likeCount || 0
      });

      // Extract keywords
      const words = text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !this.isStopWord(word)) {
          keywords.set(word, (keywords.get(word) || 0) + 1);
        }
      });
    });

    // Sort comments by likes and sentiment
    const topPositive = analyzedComments
      .filter(c => c.sentimentType === 'positive')
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);

    const topNegative = analyzedComments
      .filter(c => c.sentimentType === 'negative')
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);

    // Sort keywords by frequency
    const topKeywords = Array.from(keywords.entries())
      .map(([word, frequency]) => ({
        word,
        frequency,
        sentiment: this.getKeywordSentiment(word, analyzedComments)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    const total = sentiments.positive + sentiments.negative + sentiments.neutral;
    
    return {
      totalComments: comments.length,
      analyzedComments: analyzedComments.length,
      sentiments: {
        positive: total > 0 ? Math.round((sentiments.positive / total) * 100) : 0,
        negative: total > 0 ? Math.round((sentiments.negative / total) * 100) : 0,
        neutral: total > 0 ? Math.round((sentiments.neutral / total) * 100) : 0
      },
      topPositiveComments: topPositive,
      topNegativeComments: topNegative,
      keywords: topKeywords
    };
  }

  isStopWord(word) {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were',
      'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'when',
      'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 'just', 'now', 'also', 'here', 'there', 'well', 'really'
    ]);
    return stopWords.has(word);
  }

  getKeywordSentiment(word, comments) {
    const relevantComments = comments.filter(c => 
      c.text.toLowerCase().includes(word.toLowerCase())
    );
    
    if (relevantComments.length === 0) return 'neutral';
    
    const avgSentiment = relevantComments.reduce((sum, c) => sum + c.sentiment, 0) / relevantComments.length;
    
    if (avgSentiment > 0.1) return 'positive';
    if (avgSentiment < -0.1) return 'negative';
    return 'neutral';
  }
}

// Initialize services
const youtubeService = new YouTubeService();
const seoGenerator = new SEOGenerator();
const commentAnalyzer = new CommentAnalyzer();

// Controllers
exports.generateSEO = async (req, res) => {
  try {
    const { type, input } = req.body;
    
    if (!type || !input) {
      return res.status(400).json({
        success: false,
        message: 'Type and input are required'
      });
    }

    let videoData = null;
    let seoContent = {};

    if (type === 'video_analysis' && input.videoUrl) {
      // Extract video ID and fetch details
      const videoId = youtubeService.extractVideoId(input.videoUrl);
      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL'
        });
      }

      videoData = await youtubeService.getVideoDetails(videoId);
    }

    // Generate SEO content
    const topic = input.topic || (videoData ? videoData.snippet.title : '');
    
    seoContent.titles = seoGenerator.generateTitles(topic, videoData);
    seoContent.descriptions = seoGenerator.generateDescriptions(topic, videoData);
    seoContent.tags = seoGenerator.generateTags(topic, videoData);
    seoContent.thumbnailText = seoGenerator.generateThumbnailText(topic, videoData);

    // Calculate SEO score
    const seoScore = seoGenerator.calculateSeoScore(seoContent);

    res.json({
      success: true,
      data: {
        title: `${type} - ${topic}`,
        type,
        input,
        seoContent,
        videoData: videoData ? {
          title: videoData.snippet.title,
          description: videoData.snippet.description,
          tags: videoData.snippet.tags || [],
          thumbnail: videoData.snippet.thumbnails.high?.url,
          publishedAt: videoData.snippet.publishedAt,
          duration: videoData.contentDetails?.duration,
          views: parseInt(videoData.statistics?.viewCount || 0),
          likes: parseInt(videoData.statistics?.likeCount || 0),
          comments: parseInt(videoData.statistics?.commentCount || 0),
          channel: {
            name: videoData.snippet.channelTitle,
            id: videoData.snippet.channelId
          }
        } : null,
        metrics: {
          seoScore,
          viralPotential: Math.min(95, seoScore + Math.floor(Math.random() * 10)),
          competitionLevel: seoScore > 80 ? 'high' : seoScore > 60 ? 'medium' : 'low'
        }
      }
    });
  } catch (error) {
    console.error('SEO generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate SEO content'
    });
  }
};

exports.analyzeVideo = async (req, res) => {
  try {
    const { type, input } = req.body;
    
    if (!type || !input || !input.videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Type and video URL are required'
      });
    }

    // Extract video ID and fetch details
    const videoId = youtubeService.extractVideoId(input.videoUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL'
      });
    }

    const videoData = await youtubeService.getVideoDetails(videoId);
    
    // Get comments for sentiment analysis
    const comments = await youtubeService.getVideoComments(videoId);
    const commentAnalysis = commentAnalyzer.analyzeComments(comments);

    // Generate SEO content
    const topic = videoData.snippet.title;
    const seoContent = {
      titles: seoGenerator.generateTitles(topic, videoData),
      descriptions: seoGenerator.generateDescriptions(topic, videoData),
      tags: seoGenerator.generateTags(topic, videoData),
      thumbnailText: seoGenerator.generateThumbnailText(topic, videoData)
    };

    // Calculate metrics
    const seoScore = seoGenerator.calculateSeoScore(seoContent);
    const engagement = videoData.statistics?.viewCount > 0 
      ? ((parseInt(videoData.statistics.likeCount || 0) + parseInt(videoData.statistics.commentCount || 0)) / parseInt(videoData.statistics.viewCount)) * 100
      : 0;

    res.json({
      success: true,
      data: {
        title: `Video Analysis - ${videoData.snippet.title}`,
        type,
        input,
        seoContent,
        videoData: {
          title: videoData.snippet.title,
          description: videoData.snippet.description,
          tags: videoData.snippet.tags || [],
          thumbnail: videoData.snippet.thumbnails.high?.url,
          publishedAt: videoData.snippet.publishedAt,
          duration: videoData.contentDetails?.duration,
          views: parseInt(videoData.statistics?.viewCount || 0),
          likes: parseInt(videoData.statistics?.likeCount || 0),
          comments: parseInt(videoData.statistics?.commentCount || 0),
          channel: {
            name: videoData.snippet.channelTitle,
            id: videoData.snippet.channelId
          }
        },
        commentAnalysis,
        metrics: {
          seoScore,
          viralPotential: Math.min(95, seoScore + Math.floor(Math.random() * 10)),
          competitionLevel: seoScore > 80 ? 'high' : seoScore > 60 ? 'medium' : 'low',
          engagement: Math.round(engagement * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Video analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze video'
    });
  }
};

exports.analyzeComments = async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    // Get comments
    const comments = await youtubeService.getVideoComments(videoId);
    const commentAnalysis = commentAnalyzer.analyzeComments(comments);

    res.json({
      success: true,
      data: commentAnalysis
    });
  } catch (error) {
    console.error('Comment analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze comments'
    });
  }
};

exports.getVideoDetails = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Video URL is required'
      });
    }

    const videoId = youtubeService.extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL'
      });
    }

    const videoData = await youtubeService.getVideoDetails(videoId);

    res.json({
      success: true,
      data: {
        title: videoData.snippet.title,
        description: videoData.snippet.description,
        tags: videoData.snippet.tags || [],
        thumbnail: videoData.snippet.thumbnails.high?.url,
        publishedAt: videoData.snippet.publishedAt,
        duration: videoData.contentDetails?.duration,
        views: parseInt(videoData.statistics?.viewCount || 0),
        likes: parseInt(videoData.statistics?.likeCount || 0),
        comments: parseInt(videoData.statistics?.commentCount || 0),
        channel: {
          name: videoData.snippet.channelTitle,
          id: videoData.snippet.channelId
        }
      }
    });
  } catch (error) {
    console.error('Get video details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch video details'
    });
  }
};
