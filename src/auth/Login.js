// src/auth/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { redirectToOAuthLogin } from '../oauth';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check for error messages in the URL query params
    const params = new URLSearchParams(location.search);
    const errorMessage = params.get('error');
    
    if (errorMessage) {
      let displayMessage;
      switch (errorMessage) {
        case 'session_expired':
          displayMessage = 'Your session has expired. Please log in again.';
          break;
        case 'token_failure':
          displayMessage = 'Authentication failed. Please try again.';
          break;
        case 'unauthorized':
          displayMessage = 'You do not have permission to access this resource.';
          break;
        default:
          displayMessage = errorMessage;
      }
      setError(displayMessage);
    }
  }, [location]);

  const handleLogin = () => {
    // Redirect to the OAuth login flow
    redirectToOAuthLogin();
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-full flex items-center justify-center lg:w-1/2">
        <div className='w-11/12 max-w-[700px] px-10 py-20 rounded-3xl bg-white border-2 border-gray-100'>
          <h1 className='text-5xl font-semibold'>Welcome Back</h1>
          <p className='text-base mt-4 text-gray-600'>
            Sign in to access the thesis management system
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className='mt-8 flex flex-col gap-y-4'>
            <button 
              onClick={handleLogin}
              className='active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] 
              ease-in-out transform py-4 bg-violet-500 rounded-xl text-white font-bold text-lg'>
              Sign in with NUM
            </button>
          </div>
        </div>
      </div>
      <div className="hidden relative w-1/2 h-full lg:flex items-center justify-center bg-gray-200">
        <div className="w-60 h-60 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 animate-spin"/> 
        <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg" />
      </div>
    </div>
  );
}

export default Login;