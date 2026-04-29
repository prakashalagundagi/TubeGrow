import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - TubeGrow</title>
        <meta name="description" content="The page you're looking for doesn't exist or has been moved." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary-600">404</h1>
            <div className="w-24 h-1 bg-primary-600 mx-auto mt-4"></div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to another location.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn btn-primary inline-flex items-center"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn btn-outline inline-flex items-center"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Looking for something specific?
            </p>
            <nav className="flex flex-wrap justify-center gap-4">
              <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Dashboard
              </Link>
              <Link to="/pricing" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Pricing
              </Link>
              <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Login
              </Link>
              <Link to="/register" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
