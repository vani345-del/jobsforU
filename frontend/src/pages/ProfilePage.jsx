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
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="text-center mt-10">Access Denied</div>;

  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

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

      if (avatarFile) avatarBase64 = await convertFileToBase64(avatarFile);

      const payload = { name, avatar: avatarBase64 };

      const res = await api.put(
        "/api/auth/profile",
        JSON.stringify(payload),
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      dispatch(setUserData(res.data));
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 shadow rounded bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center">User Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <img
            src={avatarPreview || "https://placehold.co/150"}
            className="w-32 h-32 rounded-full object-cover"
          />

          <label className="cursor-pointer bg-gray-200 px-4 py-2 rounded">
            Change Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              form=""   // prevent multipart
              disabled={loading}
            />
          </label>
        </div>

        <div>
          <label>Name</label>
          <input
            className="border rounded w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
