const { body, validationResult } = require('express-validator');
const Joi = require('joi');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Project validation
const validateProject = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('type')
    .isIn(['topic_analysis', 'video_analysis', 'competitor_analysis'])
    .withMessage('Invalid project type'),
  body('input.topic')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Topic must be between 1 and 200 characters'),
  body('input.videoUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid YouTube URL'),
  handleValidationErrors
];

// YouTube URL validation
const validateYouTubeUrl = (req, res, next) => {
  const { videoUrl } = req.body;
  
  if (!videoUrl) {
    return next();
  }

  const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/|youtube\.com\/shorts\/)[\w-]{11}/;
  
  if (!youtubeUrlRegex.test(videoUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid YouTube URL'
    });
  }

  // Extract video ID
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
  if (videoIdMatch) {
    req.videoId = videoIdMatch[1];
  }

  next();
};

// Update profile validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('preferences.darkMode')
    .optional()
    .isBoolean()
    .withMessage('darkMode must be a boolean'),
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be a boolean'),
  body('preferences.language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'])
    .withMessage('Invalid language code'),
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be greater than 0'
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = { page, limit };
  next();
};

// Date range validation
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Limit date range to 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (start < oneYearAgo) {
      return res.status(400).json({
        success: false,
        message: 'Date range cannot exceed 1 year'
      });
    }
  }
  
  next();
};

// Export validation
const validateExport = [
  body('format')
    .isIn(['pdf', 'csv', 'json'])
    .withMessage('Export format must be pdf, csv, or json'),
  body('projectId')
    .isMongoId()
    .withMessage('Invalid project ID'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProject,
  validateYouTubeUrl,
  validateProfileUpdate,
  validatePasswordChange,
  validatePagination,
  validateDateRange,
  validateExport
};
