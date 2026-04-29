const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is verified
      if (!req.user.isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email address'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Admin access middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

// Check subscription level
const checkSubscription = (requiredPlan = 'free') => {
  return (req, res, next) => {
    const user = req.user;
    const plans = ['free', 'basic', 'pro'];
    const userPlanIndex = plans.indexOf(user.subscription);
    const requiredPlanIndex = plans.indexOf(requiredPlan);

    if (userPlanIndex >= requiredPlanIndex) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `This feature requires ${requiredPlan} plan or higher`,
        currentPlan: user.subscription,
        requiredPlan: requiredPlan
      });
    }
  };
};

// Check usage limits
const checkUsageLimits = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Reset daily usage if needed
    await user.resetDailyUsage();
    
    // Check if user can make more searches
    const usageCheck = user.canSearch();
    
    if (!usageCheck.canSearch) {
      return res.status(429).json({
        success: false,
        message: 'Daily/monthly search limit reached',
        remaining: usageCheck.remaining,
        dailyRemaining: usageCheck.dailyRemaining,
        monthlyRemaining: usageCheck.monthlyRemaining,
        subscription: user.subscription
      });
    }
    
    // Add usage info to request
    req.usageInfo = usageCheck;
    next();
  } catch (error) {
    console.error('Usage check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking usage limits'
    });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Optional auth: Invalid token');
    }
  }

  next();
};

module.exports = {
  protect,
  admin,
  checkSubscription,
  checkUsageLimits,
  generateToken,
  optionalAuth
};
