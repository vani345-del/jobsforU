

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center bg-gray-50 p-6 rounded-lg shadow-xl">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Welcome to the Full-Stack 
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        The application provides a seamless and secure authentication experience, designed for modern web standards. Users can choose the fastest path to access the platform
      </p>
      
      <div className="flex space-x-4">
        <Link to="/login" className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-lg">
          Log In Now
        </Link>
        <Link to="/signup" className="px-8 py-3 text-lg font-medium text-indigo-700 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-150 shadow-lg">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;