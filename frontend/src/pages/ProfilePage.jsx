import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { setUserData } from '../redux/auth/authSlice';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [name, setName] = useState(user?.name || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

    if (!user) {
        return <div className="text-center text-xl mt-10">Access Denied.</div>;
    }

    // Convert file → base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // File selection preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // instant UI preview
        }
    };

          const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let avatarBase64 = null;

            if (avatarFile) {
                avatarBase64 = await convertFileToBase64(avatarFile);
            }

            const payload = {
                name,
                avatar: avatarBase64, // can be null
            };

            const res = await api.put("/api/auth/profile", payload, {
                // ⭐ CRITICAL FIX: Ensure credentials (cookies) are sent for this cross-origin request
                withCredentials: true, 
            });

            dispatch(setUserData(res.data));
            setAvatarFile(null);
            toast.success("Profile updated successfully!");

        } catch (error) {
            console.error(error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-white shadow-2xl rounded-xl border border-indigo-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                User Profile Dashboard
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                    <img
                        src={avatarPreview || 'https://placehold.co/150'}
                        alt="User Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-300 shadow-md"
                    />

                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-indigo-700 font-semibold py-2 px-4 rounded-lg transition duration-200">
                        Change Photo
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={loading}
                        />
                    </label>
                </div>

                {/* User ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        User ID (MongoDB _id)
                    </label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm break-all">
                        {user._id}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        This is your unique database identifier.
                    </p>
                </div>

                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={loading}
                    />
                </div>

                {/* Email (Read-Only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        value={user.email}
                        readOnly
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? 'Updating...' : 'Save Changes'}
                </button>
            </form>

            <p className="text-sm text-gray-500 pt-4 border-t mt-6 text-center">
                **Note:** This page is protected and contains profile editing features.
            </p>
        </div>
    );
};

export default ProfilePage;
