// File: App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePage from './pages/ProfilePage'; 
import Header from './components/Header';
import { Toaster } from "react-hot-toast";


import ForgetPassword from './pages/ForgetPassword' 
import VerifyOtp from './pages/VerifyOtp'; 



const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
 
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
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