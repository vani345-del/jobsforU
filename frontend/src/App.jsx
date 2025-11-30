import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData } from './redux/auth/authSlice'; // Import setUserData
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePage from './pages/ProfilePage'; 
import Header from './components/Header';
import { Toaster, toast } from "react-hot-toast";
import api from './api/axios'; // Import your axios instance

import ForgetPassword from './pages/ForgetPassword' 
import VerifyOtp from './pages/VerifyOtp'; 


const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  // NOTE: If the user is null, the app will navigate to login.
  // The loading check in the main App component prevents the redirect flicker.
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  // ⭐ FIX: This useEffect hook re-hydrates the Redux state from the persistent cookie
  useEffect(() => {
    // Only run if the user is not in the Redux state (i.e., on page refresh)
    if (!user) {
      const checkAuth = async () => {
        try {
          // This calls the backend to validate the cookie and return user data
          const res = await api.get('/api/auth/current-user', { 
            withCredentials: true 
          });

          if (res.status === 200) {
            dispatch(setUserData(res.data));
            console.log("Auth Check: User state re-hydrated from cookie.");
          }
        } catch (error) {
          // A 401 error is expected here if the user is genuinely logged out
          // or the cookie is expired/missing. We just keep Redux state as null.
          console.log('Auth Check: No valid cookie found or failed to fetch user.');
        } finally {
          // Crucial: Set this state to true so the application can render
          // the appropriate routes (either ProtectedRoute or Login/Signup).
          setIsAuthCheckComplete(true);
        }
      };
      checkAuth();
    } else {
      // If user is already in state (e.g., after login/signup), skip fetch
      setIsAuthCheckComplete(true);
    }
  }, [user, dispatch]); 

  // Display a loader while checking auth status to prevent flicker and unwanted redirects
  if (!isAuthCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-semibold text-indigo-600">
          Loading Application...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster />
      <Header /> 
      <main className="container mx-auto p-4">
        <Routes>
          
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/verify-otp" element={<VerifyOtp />} /> 
          
          <Route path="/forgot-password" element={<ForgetPassword />} /> 
          
          <Route path="/reset-password/:token" element={<ForgetPassword />} />
          

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;