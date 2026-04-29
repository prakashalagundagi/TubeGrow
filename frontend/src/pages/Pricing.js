import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { paymentAPI } from '../services/api';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const Pricing = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const [plansRes, subscriptionRes] = await Promise.all([
        paymentAPI.getPlans(),
        isAuthenticated ? paymentAPI.getSubscription() : Promise.resolve({ data: null })
      ]);
      
      setPlans(plansRes.data);
      setSubscription(subscriptionRes.data);
    } catch (error) {
      console.error('Pricing data fetch error:', error);
      toast.error('Failed to load pricing information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    setSelectedPlan(planId);
    setPaymentProcessing(true);

    try {
      if (paymentMethod === 'stripe') {
        const response = await paymentAPI.createStripeSession(planId);
        if (response.data.url) {
          window.location.href = response.data.url;
        }
      } else {
        // Razorpay flow would go here
        toast.info('Razorpay integration coming soon!');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || 'Failed to process subscription');
    } finally {
      setPaymentProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      await paymentAPI.cancel();
      toast.success('Subscription cancelled successfully');
      fetchPricingData();
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const getPlanFeatures = (plan) => {
    const commonFeatures = [
      { name: 'Basic SEO tools', included: true },
      { name: 'Email support', included: true },
    ];

    const planSpecificFeatures = {
      free: [
        { name: '5 daily searches', included: true },
        { name: '50 monthly searches', included: true },
        { name: 'Limited analytics', included: true },
        { name: 'Advanced SEO tools', included: false },
        { name: 'Bulk analysis', included: false },
        { name: 'Competitor comparison', included: false },
        { name: 'Priority support', included: false },
        { name: 'API access', included: false },
        { name: 'Custom reports', included: false },
      ],
      basic: [
        { name: '20 daily searches', included: true },
        { name: '500 monthly searches', included: true },
        { name: 'Advanced SEO tools', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Email support', included: true },
        { name: 'Bulk analysis', included: false },
        { name: 'Competitor comparison', included: false },
        { name: 'Priority support', included: false },
        { name: 'API access', included: false },
        { name: 'Custom reports', included: false },
      ],
      pro: [
        { name: 'Unlimited searches', included: true },
        { name: 'All SEO tools', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Bulk analysis', included: true },
        { name: 'Competitor comparison', included: true },
        { name: 'Priority support', included: true },
        { name: 'API access', included: true },
        { name: 'Custom reports', included: true },
      ],
      enterprise: [
        { name: 'Everything in Pro', included: true },
        { name: 'Team collaboration (5 users)', included: true },
        { name: 'White-label reports', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Training sessions', included: true },
        { name: 'SLA guarantee', included: true },
      ]
    };

    return [...commonFeatures, ...(planSpecificFeatures[plan.id] || [])];
  };

  const getRecommendedPlan = () => {
    if (!user) return 'basic';
    
    const usage = user.usage;
    if (usage.dailySearches >= 4 || usage.monthlySearches >= 40) return 'pro';
    if (usage.dailySearches >= 2 || usage.monthlySearches >= 20) return 'basic';
    return 'free';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recommendedPlan = getRecommendedPlan();

  return (
    <>
      <Helmet>
        <title>Pricing - TubeGrow</title>
        <meta name="description" content="Choose the perfect TubeGrow plan for your YouTube growth needs. Free, Basic, Pro, and Enterprise options available." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Choose the perfect plan for your YouTube growth journey. 
                Start free, upgrade when you're ready.
              </p>
              
              {isAuthenticated && subscription && (
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm">
                    Current plan: <strong>{subscription.plan}</strong>
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 -mt-10">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => {
                const isRecommended = plan.id === recommendedPlan;
                const isCurrentPlan = subscription?.plan === plan.id;
                const features = getPlanFeatures(plan);
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative rounded-2xl p-8 ${
                      isRecommended
                        ? 'bg-primary-600 text-white ring-4 ring-primary-600/20 transform scale-105'
                        : isCurrentPlan
                        ? 'bg-success-600 text-white'
                        : 'card'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                          <SparklesIcon className="w-4 h-4 mr-1" />
                          Recommended
                        </span>
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-white text-success-600 px-4 py-1 rounded-full text-sm font-semibold">
                          Current Plan
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className={`text-2xl font-bold mb-2 ${!isRecommended && !isCurrentPlan ? 'text-gray-900 dark:text-white' : ''}`}>
                        {plan.name}
                      </h3>
                      <div className="mb-2">
                        <span className={`text-4xl font-bold ${!isRecommended && !isCurrentPlan ? 'text-primary-600' : ''}`}>
                          ${plan.price / 100}
                        </span>
                        <span className={`text-sm ${!isRecommended && !isCurrentPlan ? 'text-gray-600 dark:text-gray-400' : 'text-primary-200'}`}>
                          /month
                        </span>
                      </div>
                      <p className={`text-sm ${!isRecommended && !isCurrentPlan ? 'text-gray-600 dark:text-gray-400' : 'text-primary-200'}`}>
                        Perfect for {plan.id === 'free' ? 'getting started' : 
                                   plan.id === 'basic' ? 'growing channels' :
                                   plan.id === 'pro' ? 'serious creators' : 'teams'}
                      </p>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          {feature.included ? (
                            <CheckIcon className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${
                              isRecommended || isCurrentPlan ? 'text-green-300' : 'text-green-600'
                            }`} />
                          ) : (
                            <XMarkIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-gray-400" />
                          )}
                          <span className={`text-sm ${
                            !feature.included ? 'line-through opacity-50' : ''
                          } ${!isRecommended && !isCurrentPlan ? 'text-gray-700 dark:text-gray-300' : ''}`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="space-y-3">
                      {isCurrentPlan ? (
                        <>
                          <button
                            disabled
                            className="w-full btn bg-white/20 text-white cursor-not-allowed"
                          >
                            Current Plan
                          </button>
                          {plan.id !== 'free' && (
                            <button
                              onClick={handleCancelSubscription}
                              className="w-full btn border border-white/30 text-white hover:bg-white/10"
                            >
                              Cancel Subscription
                            </button>
                          )}
                        </>
                      ) : plan.id === 'free' ? (
                        <Link
                          to={isAuthenticated ? '/dashboard' : '/register'}
                          className="w-full btn text-center"
                        >
                          {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
                        </Link>
                      ) : plan.id === 'enterprise' ? (
                        <button
                          onClick={() => window.location.href = 'mailto:sales@tubegrow.com'}
                          className="w-full btn text-center"
                        >
                          Contact Sales
                        </button>
                      ) : (
                        <>
                          {paymentProcessing && selectedPlan === plan.id ? (
                            <button
                              disabled
                              className="w-full btn text-center"
                            >
                              <LoadingSpinner size="sm" className="mx-auto" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSubscribe(plan.id)}
                              className={`w-full btn text-center ${
                                isRecommended
                                  ? 'bg-white text-primary-700 hover:bg-primary-50'
                                  : 'btn-primary'
                              }`}
                            >
                              {isAuthenticated ? 'Upgrade Now' : 'Get Started'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Compare All Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                See exactly what you get with each plan
              </p>
            </motion.div>
            
            <div className="overflow-x-auto">
              <table className="w-full max-w-6xl mx-auto">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Feature
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Free
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Basic
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Pro
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      Daily Searches
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">5</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">20</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      Monthly Searches
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">50</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">500</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      SEO Tools
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      Bulk Analysis
                    </td>
                    <td className="py-4 px-6 text-center">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      API Access
                    </td>
                    <td className="py-4 px-6 text-center">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      Priority Support
                    </td>
                    <td className="py-4 px-6 text-center">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      Team Members
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">1</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">1</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">1</td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Got questions? We've got answers.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  question: 'Can I change my plan anytime?',
                  answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.'
                },
                {
                  question: 'What happens if I exceed my search limit?',
                  answer: 'Free plan users will need to wait until the next day or upgrade to a paid plan. Paid plans have unlimited searches.'
                },
                {
                  question: 'Do you offer refunds?',
                  answer: 'We offer a 14-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us within 14 days for a full refund.'
                },
                {
                  question: 'Can I cancel anytime?',
                  answer: 'Absolutely! You can cancel your subscription at any time. You\'ll continue to have access to premium features until the end of your billing period.'
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards via Stripe, and also support Razorpay for Indian customers. Enterprise plans can also pay via invoice.'
                },
                {
                  question: 'Is my data secure?',
                  answer: 'Yes! We use industry-standard encryption and security practices. Your data is never shared with third parties without your consent.'
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6"
                >
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Grow Your Channel?
              </h2>
              <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
                Join thousands of creators who are already using TubeGrow to accelerate their YouTube growth
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Start Free Trial
                  <RocketLaunchIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/contact"
                  className="btn border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Contact Sales
                </Link>
              </div>
              
              <p className="mt-6 text-primary-200 text-sm">
                No credit card required • Free plan available • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
