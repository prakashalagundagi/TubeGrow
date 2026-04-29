import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlayIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  TagIcon,
  PhotoIcon,
  UserGroupIcon,
  PlusIcon,
  ExternalLinkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { videoAPI, projectAPI } from '../services/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const Dashboard = () => {
  const { user, usageInfo, updateUsage } = useAuth();
  const [activeTab, setActiveTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Form states
  const [topic, setTopic] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, analyticsRes] = await Promise.all([
        projectAPI.getProjects({ limit: 5 }),
        userAPI.getAnalytics()
      ]);
      
      setRecentProjects(projectsRes.data.projects);
      setAnalytics(analyticsRes.data.analytics);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    }
  };

  const handleTopicAnalysis = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    if (!usageInfo?.canSearch) {
      toast.error('You\'ve reached your search limit. Upgrade to Pro for unlimited searches.');
      return;
    }

    setGenerating(true);
    setLoading(true);

    try {
      const response = await videoAPI.generateSEO({
        type: 'topic_analysis',
        input: { topic: topic.trim() }
      });

      setResults(response.data);
      await updateUsage();
      toast.success('SEO content generated successfully!');
    } catch (error) {
      console.error('Topic analysis error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate SEO content');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleVideoAnalysis = async () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (!usageInfo?.canSearch) {
      toast.error('You\'ve reached your search limit. Upgrade to Pro for unlimited searches.');
      return;
    }

    setGenerating(true);
    setLoading(true);

    try {
      const response = await videoAPI.analyzeVideo({
        type: 'video_analysis',
        input: { videoUrl: videoUrl.trim() }
      });

      setResults(response.data);
      await updateUsage();
      toast.success('Video analysis completed successfully!');
    } catch (error) {
      console.error('Video analysis error:', error);
      toast.error(error.response?.data?.message || 'Failed to analyze video');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const saveProject = async () => {
    if (!results) return;

    try {
      const projectData = {
        title: results.title || `${activeTab} - ${new Date().toLocaleDateString()}`,
        type: activeTab === 'topic' ? 'topic_analysis' : 'video_analysis',
        input: activeTab === 'topic' ? { topic } : { videoUrl },
        seoContent: results.seoContent,
        videoData: results.videoData,
        commentAnalysis: results.commentAnalysis,
        metrics: results.metrics
      };

      const response = await projectAPI.createProject(projectData);
      setRecentProjects(prev => [response.data, ...prev.slice(0, 4)]);
      toast.success('Project saved successfully!');
    } catch (error) {
      console.error('Save project error:', error);
      toast.error('Failed to save project');
    }
  };

  const tabs = [
    { id: 'analyze', name: 'Analyze', icon: MagnifyingGlassIcon },
    { id: 'recent', name: 'Recent Projects', icon: ClockIcon },
    { id: 'stats', name: 'Statistics', icon: ChartBarIcon },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - TubeGrow</title>
        <meta name="description" content="TubeGrow dashboard - Analyze YouTube videos, generate SEO content, and track your channel growth." />
      </Helmet>

      <div className="container py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-primary-100 text-lg">
                  Ready to grow your YouTube channel today?
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {usageInfo?.remaining || 'N/A'}
                  </div>
                  <div className="text-sm text-primary-200">
                    Searches left today
                  </div>
                </div>
                {user?.subscription === 'free' && (
                  <Link
                    to="/pricing"
                    className="btn bg-white text-primary-700 hover:bg-primary-50"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'analyze' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">Start Analysis</h2>
                
                <div className="space-y-6">
                  {/* Topic Analysis */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <SparklesIcon className="w-5 h-5 mr-2 text-primary-600" />
                      Topic Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">Enter your video topic</label>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g., How to cook pasta, JavaScript tutorial, Product review"
                          className="form-input"
                        />
                      </div>
                      <button
                        onClick={handleTopicAnalysis}
                        disabled={!topic.trim() || generating}
                        className="btn btn-primary w-full"
                      >
                        {generating ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Generate SEO Content
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Video Analysis */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <PlayIcon className="w-5 h-5 mr-2 text-primary-600" />
                      Video Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">YouTube Video URL</label>
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="form-input"
                        />
                      </div>
                      <button
                        onClick={handleVideoAnalysis}
                        disabled={!videoUrl.trim() || generating}
                        className="btn btn-primary w-full"
                      >
                        {generating ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <ChartBarIcon className="w-5 h-5 mr-2" />
                            Analyze Video
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {loading ? (
                <div className="card p-12">
                  <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {generating ? 'Generating amazing content...' : 'Loading...'}
                    </p>
                  </div>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Analysis Results</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={saveProject}
                        className="btn btn-secondary btn-sm"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Save Project
                      </button>
                    </div>
                  </div>

                  {/* Video Data */}
                  {results.videoData && (
                    <div className="card p-6">
                      <h4 className="font-medium mb-4 flex items-center">
                        <PlayIcon className="w-5 h-5 mr-2 text-primary-600" />
                        Video Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <img
                            src={results.videoData.thumbnail}
                            alt="Video thumbnail"
                            className="w-20 h-14 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium">{results.videoData.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {results.videoData.channel?.name} • {results.videoData.views?.toLocaleString()} views
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO Content */}
                  {results.seoContent && (
                    <div className="space-y-4">
                      {/* Titles */}
                      {results.seoContent.titles && (
                        <div className="card p-6">
                          <h4 className="font-medium mb-4 flex items-center">
                            <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-600" />
                            Optimized Titles
                          </h4>
                          <div className="space-y-2">
                            {results.seoContent.titles.map((title, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <span className="text-sm">{title.title}</span>
                                <button
                                  onClick={() => copyToClipboard(title.title)}
                                  className="btn btn-outline btn-sm"
                                >
                                  Copy
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {results.seoContent.tags && (
                        <div className="card p-6">
                          <h4 className="font-medium mb-4 flex items-center">
                            <TagIcon className="w-5 h-5 mr-2 text-primary-600" />
                            Recommended Tags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {results.seoContent.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="badge badge-primary cursor-pointer hover:bg-primary-200"
                                onClick={() => copyToClipboard(tag.tag)}
                              >
                                {tag.tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Thumbnail Text */}
                      {results.seoContent.thumbnailText && (
                        <div className="card p-6">
                          <h4 className="font-medium mb-4 flex items-center">
                            <PhotoIcon className="w-5 h-5 mr-2 text-primary-600" />
                            Thumbnail Text Ideas
                          </h4>
                          <div className="space-y-2">
                            {results.seoContent.thumbnailText.map((text, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <span className="text-sm font-medium">{text.text}</span>
                                <button
                                  onClick={() => copyToClipboard(text.text)}
                                  className="btn btn-outline btn-sm"
                                >
                                  Copy
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comment Analysis */}
                  {results.commentAnalysis && (
                    <div className="card p-6">
                      <h4 className="font-medium mb-4 flex items-center">
                        <UserGroupIcon className="w-5 h-5 mr-2 text-primary-600" />
                        Comment Sentiment Analysis
                      </h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {results.commentAnalysis.sentiments?.positive || 0}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {results.commentAnalysis.sentiments?.neutral || 0}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {results.commentAnalysis.sentiments?.negative || 0}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Start Your First Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter a topic or YouTube URL to get started with AI-powered SEO analysis
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'recent' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid gap-6">
              {recentProjects.length > 0 ? (
                recentProjects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card p-6 hover:shadow-medium transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium">{project.title}</h3>
                          <span className={`badge ${
                            project.status === 'completed' ? 'badge-success' :
                            project.status === 'processing' ? 'badge-warning' :
                            'badge-error'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {project.type === 'topic_analysis' ? 'Topic Analysis' : 'Video Analysis'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          {project.metrics?.seoScore && (
                            <span className="flex items-center">
                              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                              SEO Score: {project.metrics.seoScore}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/projects/${project._id}`}
                          className="btn btn-outline btn-sm"
                        >
                          View Details
                          <ExternalLinkIcon className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Recent Projects
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start analyzing videos or topics to see your projects here
                  </p>
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className="btn btn-primary"
                  >
                    Start Analysis
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {analytics ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Projects</span>
                    <ChartBarIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold">{analytics.performance?.totalProjects || 0}</div>
                  <div className="text-sm text-green-600 mt-2">
                    +{analytics.growth?.projects || 0} this month
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg SEO Score</span>
                    <ArrowTrendingUpIcon className="w-5 h-5 text-success-600" />
                  </div>
                  <div className="text-3xl font-bold">{analytics.performance?.averageSeoScore || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Out of 100
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <CheckCircleIcon className="w-5 h-5 text-success-600" />
                  </div>
                  <div className="text-3xl font-bold">
                    {analytics.performance?.totalProjects > 0 
                      ? Math.round((analytics.performance.successfulProjects / analytics.performance.totalProjects) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {analytics.performance?.successfulProjects || 0} successful
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Searches</span>
                    <MagnifyingGlassIcon className="w-5 h-5 text-warning-600" />
                  </div>
                  <div className="text-3xl font-bold">{analytics.featureUsage?.titleGenerator || 0}</div>
                  <div className="text-sm text-green-600 mt-2">
                    +{analytics.growth?.searches || 0} this month
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
