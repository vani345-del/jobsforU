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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
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
                avatar: avatarBase64,
            };

            const res = await api.put("/api/auth/profile", JSON.stringify(payload), {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            dispatch(setUserData(res.data));
            setAvatarFile(null);
            toast.success("Profile updated successfully!");

        } catch (error) {
            console.error(error);
            toast.error("Profile update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-white shadow-2xl rounded-xl border border-indigo-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                User Profile Dashboard
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6" encType="application/json">
                
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
                            form=""     // ⭐ prevents multipart form submission
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm break-all">
                        {user._id}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={user.email}
                        readOnly
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                >
                    {loading ? 'Updating...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
