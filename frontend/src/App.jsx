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

 useEffect(() => {
  if (!user) {
    const checkAuth = async () => {
      try {
        const res = await api.get('/api/auth/current-user', { 
          withCredentials: true 
        });

        if (res.status === 200) {
          dispatch(setUserData(res.data));
          console.log("Auth Check: User state re-hydrated from cookie.");
        }
      } catch (error) {
  if (error.response?.status === 401) {
    // Expected: user not logged in
    console.log("Auth Check: User not logged in.");
    // Optionally: redirect to login
    // navigate("/login");
  } else {
    console.error("Auth Check failed:", error);
    toast.error("Something went wrong while checking auth.");
  }
} finally {
  setIsAuthCheckComplete(true);
}
    };
    checkAuth();
  } else {
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