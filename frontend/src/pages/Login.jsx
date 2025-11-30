import React, { useState, useEffect } from 'react';
import { FaGoogle, FaLinkedin, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/auth/authSlice';
import { setUserData } from "../redux/auth/authSlice";


import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import api from "../api/axios";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // **NEW**: State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

 
  useEffect(() => {
  
    if (error && error.includes('Account not verified. A new verification code has been sent')) {
        toast.success(error); 
      
        navigate("/verify-otp", { state: { userEmail: email } }); 
    }
  }, [error, navigate, email, dispatch]);


  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


   const handleLinkedInAuth = () => {
   
    const serverUrl = 'http://localhost:5000'; 
     // Redirect to the backend's Passport initiation route
    window.location.href = `${serverUrl}/api/auth/linkedin`;
    console.log(`Initiating LinkedIn OAuth flow via redirect to: ${serverUrl}/api/auth/linkedin`);
  };


const handleGoogleAuth = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const googleData = {
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
    };

    const res = await api.post("/api/auth/google", googleData, {
      withCredentials: true,
    });

    dispatch(setUserData(res.data));

    toast.success(`Welcome ${res.data.name}`);

    navigate("/profile");
  } catch (error) {
    console.error("Google error:", error);
    toast.error("Google login failed");
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch the thunk action
    dispatch(loginUser({ email, password, navigate }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-2xl rounded-xl">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
        Log In to Your Account
      </h2>

      {/* Backend Error Display */}
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* Updated: Password Field with Eye Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10"
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 focus:outline-none text-gray-500 hover:text-gray-700 cursor-pointer" // **ADDED: cursor-pointer**
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer" // **ADDED: cursor-pointer**
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      {/* Separator */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">Or continue with</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="flex space-x-4">
        <button onClick={handleGoogleAuth}
          className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" // **ADDED: cursor-pointer**
        >
          <FaGoogle className="h-5 w-5 mr-2 text-red-600" />
          Google
        </button>
        <button
          onClick={handleLinkedInAuth}
          className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" // **ADDED: cursor-pointer**
        >
          <FaLinkedin className="h-5 w-5 mr-2 text-blue-700" />
          LinkedIn
        </button>
      </div>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;