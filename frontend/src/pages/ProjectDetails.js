import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  TagIcon,
  PhotoIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShareIcon,
  DownloadIcon,
  PencilIcon,
  TrashIcon,
  CopyIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { projectAPI } from '../services/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getProject(id);
      setProject(response.data);
    } catch (error) {
      console.error('Project fetch error:', error);
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await projectAPI.exportProject(id, format);
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 
            format === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Project exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export project');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const response = await projectAPI.shareProject(id);
      const shareUrl = `${window.location.origin}/shared/${response.data.shareToken}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to generate share link');
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await projectAPI.deleteProject(id);
      toast.success('Project deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete project');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title} - TubeGrow</title>
        <meta name="description" content={`View project details for ${project.title} - SEO analysis and recommendations.`} />
      </Helmet>

      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="btn btn-outline btn-sm"
              >
                {sharing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ShareIcon className="w-4 h-4" />
                )}
              </button>
              
              <div className="relative group">
                <button className="btn btn-outline btn-sm">
                  <DownloadIcon className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={exporting}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDelete}
                className="btn btn-error btn-sm"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {formatDate(project.createdAt)}
                </span>
                <span className={`badge ${
                  project.status === 'completed' ? 'badge-success' :
                  project.status === 'processing' ? 'badge-warning' :
                  'badge-error'
                }`}>
                  {project.status}
                </span>
                <span className="flex items-center">
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  SEO Score: {project.metrics?.seoScore || 0}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video Data */}
        {project.videoData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <EyeIcon className="w-6 h-6 mr-2 text-primary-600" />
              Video Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <img
                  src={project.videoData.thumbnail}
                  alt="Video thumbnail"
                  className="w-32 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{project.videoData.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {project.videoData.channel?.name}
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {project.videoData.views?.toLocaleString()} views
                    </span>
                    <span className="flex items-center">
                      <HeartIcon className="w-4 h-4 mr-1" />
                      {project.videoData.likes?.toLocaleString()} likes
                    </span>
                    <span className="flex items-center">
                      <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                      {project.videoData.comments?.toLocaleString()} comments
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                  {project.videoData.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* SEO Content */}
        {project.seoContent && (
          <div className="space-y-8">
            {/* Titles */}
            {project.seoContent.titles && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2 text-primary-600" />
                  Optimized Titles
                </h2>
                <div className="space-y-3">
                  {project.seoContent.titles.map((title, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{title.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Score: {title.score} - {title.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(title.title)}
                        className="btn btn-outline btn-sm ml-4"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Descriptions */}
            {project.seoContent.descriptions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2 text-primary-600" />
                  Optimized Descriptions
                </h2>
                <div className="space-y-4">
                  {project.seoContent.descriptions.map((desc, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Score: {desc.score} - {desc.reason}
                        </p>
                        <button
                          onClick={() => handleCopy(desc.description)}
                          className="btn btn-outline btn-sm"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap">{desc.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tags */}
            {project.seoContent.tags && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <TagIcon className="w-6 h-6 mr-2 text-primary-600" />
                  Recommended Tags
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.seoContent.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-primary cursor-pointer hover:bg-primary-200"
                      onClick={() => handleCopy(tag.tag)}
                    >
                      {tag.tag}
                      <span className="ml-1 text-xs opacity-75">({tag.relevance})</span>
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleCopy(project.seoContent.tags.map(t => t.tag).join(', '))}
                  className="btn btn-outline btn-sm"
                >
                  Copy All Tags
                </button>
              </motion.div>
            )}

            {/* Thumbnail Text */}
            {project.seoContent.thumbnailText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <PhotoIcon className="w-6 h-6 mr-2 text-primary-600" />
                  Thumbnail Text Ideas
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.seoContent.thumbnailText.map((text, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center"
                    >
                      <p className="font-bold text-lg mb-2">{text.text}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Impact: {text.impact} - {text.style}
                      </p>
                      <button
                        onClick={() => handleCopy(text.text)}
                        className="btn btn-outline btn-sm"
                      >
                        <CopyIcon className="w-4 h-4 mr-1" />
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Comment Analysis */}
        {project.commentAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6 mt-8"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <UserGroupIcon className="w-6 h-6 mr-2 text-primary-600" />
              Comment Sentiment Analysis
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {project.commentAnalysis.sentiments?.positive || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {project.commentAnalysis.sentiments?.neutral || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {project.commentAnalysis.sentiments?.negative || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
              </div>
            </div>

            {project.commentAnalysis.keywords && (
              <div>
                <h3 className="font-medium mb-3">Top Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {project.commentAnalysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className={`badge ${
                        keyword.sentiment === 'positive' ? 'badge-success' :
                        keyword.sentiment === 'negative' ? 'badge-error' :
                        'badge-secondary'
                      }`}
                    >
                      {keyword.word} ({keyword.frequency})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Metrics */}
        {project.metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card p-6 mt-8"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2 text-primary-600" />
              Performance Metrics
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {project.metrics.seoScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">SEO Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">
                  {project.metrics.viralPotential}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Viral Potential</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning-600 mb-2 capitalize">
                  {project.metrics.competitionLevel}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Competition</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ProjectDetails;
