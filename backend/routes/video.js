const express = require('express');
const { protect, checkUsageLimits } = require('../middleware/auth');
const { validateProject, validateYouTubeUrl } = require('../middleware/validation');
const {
  generateSEO,
  analyzeVideo,
  analyzeComments,
  getVideoDetails
} = require('../controllers/videoController');

const router = express.Router();

// All video routes require authentication and usage limits
router.use(protect);
router.use(checkUsageLimits);

// @route   POST /api/videos/generate-seo
// @desc    Generate SEO content for a topic or video
// @access  Private
router.post('/generate-seo', validateProject, generateSEO);

// @route   POST /api/videos/analyze
// @desc    Analyze a YouTube video (SEO + comments)
// @access  Private
router.post('/analyze', validateYouTubeUrl, analyzeVideo);

// @route   POST /api/videos/analyze-comments
// @desc    Analyze comments for a video
// @access  Private
router.post('/analyze-comments', analyzeComments);

// @route   POST /api/videos/details
// @desc    Get basic video details
// @access  Private
router.post('/details', validateYouTubeUrl, getVideoDetails);

module.exports = router;
