const express = require('express');
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// All payment routes require authentication
router.use(protect);

// @route   GET /api/payments/plans
// @desc    Get available subscription plans
// @access  Private
router.get('/plans', async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Basic',
        price: 2900, // $29 in cents
        currency: 'usd',
        interval: 'month',
        features: [
          '20 daily searches',
          '500 monthly searches',
          'Advanced SEO tools',
          'Basic analytics',
          'Email support'
        ],
        limits: {
          daily: 20,
          monthly: 500
        }
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 9900, // $99 in cents
        currency: 'usd',
        interval: 'month',
        features: [
          'Unlimited searches',
          'All SEO tools',
          'Advanced analytics',
          'Bulk analysis',
          'Competitor comparison',
          'Priority support',
          'API access',
          'Custom reports'
        ],
        limits: {
          daily: -1, // Unlimited
          monthly: -1
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 29900, // $299 in cents
        currency: 'usd',
        interval: 'month',
        features: [
          'Everything in Pro',
          'Team collaboration (5 users)',
          'White-label reports',
          'Dedicated support',
          'Custom integrations',
          'Training sessions',
          'SLA guarantee'
        ],
        limits: {
          daily: -1,
          monthly: -1
        }
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payments/subscription
// @desc    Get current subscription
// @access  Private
router.get('/subscription', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const subscription = {
      plan: user.subscription,
      status: user.subscriptionEnds && user.subscriptionEnds > new Date() ? 'active' : 'inactive',
      endsAt: user.subscriptionEnds,
      subscriptionId: user.subscriptionId,
      canUpgrade: user.subscription !== 'pro'
    };

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/stripe/create-session
// @desc    Create Stripe checkout session
// @access  Private
router.post('/stripe/create-session', async (req, res, next) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Get plan details
    const plans = await getPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: `TubeGrow ${plan.name} Plan`,
              description: `Monthly subscription to TubeGrow ${plan.name} plan`,
              images: ['https://your-domain.com/logo.png']
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id,
        planId: planId
      }
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    next(error);
  }
});

// @route   POST /api/payments/stripe/confirm
// @desc    Confirm Stripe payment
// @access  Private
router.post('/stripe/confirm', async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Get subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Update user subscription
    const user = await User.findById(req.user.id);
    const planId = session.metadata.planId;
    
    user.subscription = planId === 'basic' ? 'basic' : planId === 'pro' ? 'pro' : 'enterprise';
    user.subscriptionId = subscription.id;
    user.subscriptionEnds = new Date(subscription.current_period_end * 1000);
    
    await user.save();

    // Update analytics
    const analytics = await Analytics.findOne({ user: req.user.id });
    if (analytics) {
      analytics.subscription.currentPlan = user.subscription;
      analytics.subscription.planHistory.push({
        plan: user.subscription,
        startDate: new Date(),
        endDate: user.subscriptionEnds,
        price: session.amount_total / 100,
        currency: session.currency
      });
      await analytics.save();
    }

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        plan: user.subscription,
        endsAt: user.subscriptionEnds
      }
    });
  } catch (error) {
    console.error('Stripe confirmation error:', error);
    next(error);
  }
});

// @route   POST /api/payments/razorpay/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/razorpay/create-order', async (req, res, next) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Get plan details
    const plans = await getPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create order
    const order = await razorpay.orders.create({
      amount: plan.price,
      currency: plan.currency,
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        planId: planId
      }
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    next(error);
  }
});

// @route   POST /api/payments/razorpay/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/razorpay/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are required'
      });
    }

    // Verify signature
    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update user subscription
    const user = await User.findById(req.user.id);
    
    user.subscription = planId === 'basic' ? 'basic' : planId === 'pro' ? 'pro' : 'enterprise';
    user.subscriptionEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    await user.save();

    // Update analytics
    const analytics = await Analytics.findOne({ user: req.user.id });
    if (analytics) {
      analytics.subscription.currentPlan = user.subscription;
      analytics.subscription.planHistory.push({
        plan: user.subscription,
        startDate: new Date(),
        endDate: user.subscriptionEnds,
        price: 0, // Razorpay doesn't provide this in verification
        currency: 'inr'
      });
      await analytics.save();
    }

    res.json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      data: {
        plan: user.subscription,
        endsAt: user.subscriptionEnds
      }
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    next(error);
  }
});

// @route   POST /api/payments/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription (Stripe)
    if (user.subscriptionId.startsWith('sub_')) {
      await stripe.subscriptions.del(user.subscriptionId);
    }

    // Update user
    user.subscription = 'free';
    user.subscriptionId = null;
    user.subscriptionEnds = null;
    
    await user.save();

    // Update analytics
    const analytics = await Analytics.findOne({ user: req.user.id });
    if (analytics && analytics.subscription.planHistory.length > 0) {
      const lastPlan = analytics.subscription.planHistory[analytics.subscription.planHistory.length - 1];
      lastPlan.endDate = new Date();
      analytics.subscription.currentPlan = 'free';
      await analytics.save();
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    next(error);
  }
});

// @route   GET /api/payments/history
// @desc    Get payment history
// @access  Private
router.get('/history', async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ user: req.user.id });
    
    if (!analytics) {
      return res.json({
        success: true,
        data: []
      });
    }

    const history = analytics.subscription.planHistory.map(plan => ({
      plan: plan.plan,
      startDate: plan.startDate,
      endDate: plan.endDate,
      price: plan.price,
      currency: plan.currency,
      status: plan.endDate && plan.endDate < new Date() ? 'expired' : 'active'
    }));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to get plans
async function getPlans() {
  return [
    {
      id: 'basic',
      name: 'Basic',
      price: 2900,
      currency: 'usd',
      interval: 'month'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9900,
      currency: 'usd',
      interval: 'month'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29900,
      currency: 'usd',
      interval: 'month'
    }
  ];
}

module.exports = router;
