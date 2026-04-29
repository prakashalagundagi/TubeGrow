const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Subscription details
  subscription: {
    type: String,
    enum: ['free', 'basic', 'pro'],
    default: 'free'
  },
  subscriptionId: String,
  subscriptionEnds: Date,
  
  // Usage limits
  usage: {
    dailySearches: {
      type: Number,
      default: 0
    },
    monthlySearches: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Preferences
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Role for admin access
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Reset daily usage
userSchema.methods.resetDailyUsage = function() {
  const today = new Date();
  const lastReset = this.usage.lastResetDate;
  
  if (today.toDateString() !== lastReset.toDateString()) {
    this.usage.dailySearches = 0;
    this.usage.lastResetDate = today;
    return this.save();
  }
  return Promise.resolve(this);
};

// Check if user can make more searches
userSchema.methods.canSearch = function() {
  const limits = {
    free: { daily: 5, monthly: 50 },
    basic: { daily: 20, monthly: 500 },
    pro: { daily: -1, monthly: -1 } // Unlimited
  };
  
  const userLimit = limits[this.subscription];
  
  if (userLimit.daily === -1) return { canSearch: true, remaining: 'Unlimited' };
  
  const remainingDaily = userLimit.daily - this.usage.dailySearches;
  const remainingMonthly = userLimit.monthly - this.usage.monthlySearches;
  
  return {
    canSearch: remainingDaily > 0 && remainingMonthly > 0,
    remaining: Math.min(remainingDaily, remainingMonthly),
    dailyRemaining: remainingDaily,
    monthlyRemaining: remainingMonthly
  };
};

// Increment search usage
userSchema.methods.incrementUsage = function() {
  this.usage.dailySearches += 1;
  this.usage.monthlySearches += 1;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
