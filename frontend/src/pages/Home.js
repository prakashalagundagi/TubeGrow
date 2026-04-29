import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  StarIcon,
  CheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  TrendingUpIcon,
  UserGroupIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('titles');

  const features = [
    {
      icon: LightBulbIcon,
      title: 'AI-Powered Titles',
      description: 'Generate catchy, SEO-optimized titles that grab attention and boost rankings.',
      color: 'primary',
    },
    {
      icon: ChartBarIcon,
      title: 'Video Analytics',
      description: 'Deep dive into video performance, engagement metrics, and audience insights.',
      color: 'success',
    },
    {
      icon: SparklesIcon,
      title: 'Smart Descriptions',
      description: 'Create compelling descriptions that improve discoverability and watch time.',
      color: 'warning',
    },
    {
      icon: TrendingUpIcon,
      title: 'Trending Tags',
      description: 'Find the perfect tags to reach your target audience and trend in your niche.',
      color: 'error',
    },
    {
      icon: UserGroupIcon,
      title: 'Comment Analysis',
      description: 'Understand audience sentiment and engagement through advanced comment analysis.',
      color: 'secondary',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Competitor Insights',
      description: 'Analyze competitor strategies and discover opportunities for growth.',
      color: 'primary',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '5 daily searches',
        '50 monthly searches',
        'Basic SEO tools',
        'Limited analytics',
      ],
      notIncluded: [
        'Bulk analysis',
        'Competitor comparison',
        'Priority support',
        'Custom reports',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For serious content creators',
      features: [
        'Unlimited searches',
        'Advanced SEO tools',
        'Bulk analysis',
        'Competitor comparison',
        'Priority support',
        'Custom reports',
        'API access',
      ],
      notIncluded: [],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For teams and agencies',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'White-label reports',
        'Dedicated support',
        'Custom integrations',
        'Training sessions',
      ],
      notIncluded: [],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Tech YouTuber',
      content: 'TubeGrow helped me triple my views in just 3 months. The SEO tools are incredible!',
      avatar: 'SC',
      rating: 5,
    },
    {
      name: 'Mike Rodriguez',
      role: 'Gaming Content Creator',
      content: 'The competitor analysis feature alone is worth the subscription. Game-changer!',
      avatar: 'MR',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'Education Channel',
      content: 'Finally found a tool that understands what creators actually need. Highly recommend!',
      avatar: 'EJ',
      rating: 5,
    },
  ];

  const demoData = {
    titles: [
      '10 YouTube SEO Secrets That Will Blow Your Mind 🤯',
      'How I Got 1M Views Using These Title Tricks',
      'YouTube Algorithm EXPOSED: What They Don\'t Tell You',
      'The Ultimate Guide to Viral Video Titles',
    ],
    tags: [
      'youtube seo', 'video optimization', 'content strategy', 'viral marketing',
      'youtube algorithm', 'video titles', 'content creation', 'social media marketing'
    ],
    descriptions: [
      'Discover the proven YouTube SEO strategies that top creators use to get millions of views...',
      'Learn how to optimize your YouTube videos for maximum visibility and engagement...',
    ],
  };

  return (
    <>
      <Helmet>
        <title>TubeGrow - YouTube Creator Growth Tool | SEO & Analytics Platform</title>
        <meta name="description" content="Boost your YouTube channel with AI-powered SEO tools, video analytics, and growth insights. Get more views, subscribers, and engagement with TubeGrow." />
        <meta name="keywords" content="YouTube SEO, video optimization, YouTube analytics, content creator tools, YouTube growth" />
        <meta property="og:title" content="TubeGrow - YouTube Creator Growth Tool" />
        <meta property="og:description" content="AI-powered tools to optimize your YouTube content and grow your channel faster" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="container relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <SparklesIcon className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium text-yellow-300">Trusted by 10,000+ creators</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  Grow Your YouTube Channel with
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400">
                    AI-Powered SEO
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl mb-8 text-primary-100 leading-relaxed">
                  Get viral titles, perfect tags, and deep analytics that actually work. 
                  Join creators who've increased their views by 300%+.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to="/register"
                    className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-strong hover:shadow-xl transition-all duration-300"
                  >
                    Start Free Trial
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="btn border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                  >
                    View Demo
                  </Link>
                </div>
                
                <div className="flex items-center gap-6 text-primary-100">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm">4.9/5 from 2,000+ reviews</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex gap-2 mb-4">
                    {['titles', 'tags', 'descriptions'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab
                            ? 'bg-white text-primary-700'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    {demoData[activeTab]?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-3 border border-white/10 animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-2">
                          <CheckIcon className="w-4 h-4 text-green-300" />
                          <span className="text-sm">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse-slow" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-pulse-slow" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Everything You Need to Grow
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Powerful tools designed specifically for YouTube creators who want to dominate their niche
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card card-hover p-8 text-center group"
                >
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Start free, upgrade when you're ready. No hidden fees.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular
                      ? 'bg-primary-600 text-white ring-4 ring-primary-600/20'
                      : 'card'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : ''}`}>
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-primary-600'}`}>
                        {plan.price}
                      </span>
                      {plan.price !== 'Custom' && (
                        <span className={`text-sm ${plan.popular ? 'text-primary-200' : 'text-gray-600'}`}>
                          /month
                        </span>
                      )}
                    </div>
                    <p className={plan.popular ? 'text-primary-100' : 'text-gray-600'}>
                      {plan.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckIcon className={`w-5 h-5 ${plan.popular ? 'text-green-300' : 'text-green-600'}`} />
                        <span className={plan.popular ? 'text-white' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 opacity-50">
                        <span className="w-5 h-5 text-gray-400 line-through">×</span>
                        <span className={plan.popular ? 'text-primary-200 line-through' : 'text-gray-400 line-through'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={plan.name === 'Free' ? '/register' : '/pricing'}
                    className={`w-full btn text-center ${
                      plan.popular
                        ? 'bg-white text-primary-700 hover:bg-primary-50'
                        : 'btn-primary'
                    }`}
                  >
                    {plan.name === 'Free' ? 'Get Started' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Loved by Creators Worldwide
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                See what our users have to say about their growth journey
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-8"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
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
                  className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-strong"
                >
                  Start Your Free Trial
                  <RocketLaunchIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/pricing"
                  className="btn border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  View Pricing
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

export default Home;
