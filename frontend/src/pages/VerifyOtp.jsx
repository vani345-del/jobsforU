import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/auth/authSlice';
import axios from "axios";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const location = useLocation();
  const initialEmail = location.state?.userEmail || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });

      dispatch(setUserData(res.data));
      toast.success(`Verification successful! Welcome ${res.data.name}.`);
      navigate("/profile");

    } catch (error) {
      console.error("OTP Verification Error:", error);
      const errorMessage = error.response?.data?.message || 'Verification failed. Please check your code.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-2xl rounded-xl">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
        Verify Your Account
      </h2>
      <p className="text-center text-gray-600 mb-4">
        We sent a 6-digit code to **{email || 'your email address'}**.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {!initialEmail && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Verification Code (OTP)</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength="6"
            className="mt-1 block w-full px-3 py-2 text-center text-2xl border border-gray-300 rounded-md shadow-sm tracking-widest focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6 || !email}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link
          to="/signup"
          className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
        >
          Didn't receive the code? Click here to go back and correct your email or try signing up again.
        </Link>
      </p>
    </div>
  );
};

export default VerifyOtp;