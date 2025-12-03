import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { setUserData } from '../redux/auth/authSlice';
import { setResumeData, saveVersion, fetchVersions, fetchDraft, loadTemplate, saveDraft } from '../redux/resume/resumeSlice';
import { fresherResume, seniorResume } from '../data/resumeTemplates';
import { FaUserGraduate, FaBriefcase, FaEdit, FaCamera, FaSpinner } from 'react-icons/fa';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentData, versions, isDirty } = useSelector((state) => state.resume);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDraft());
    dispatch(fetchVersions());
  }, [dispatch]);

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

      const res = await axios.put(
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

  const handleSelectTemplate = async (templateData, templateName) => {
    // Check if there is existing data (non-empty)
    const hasExistingData = currentData?.personalInfo?.fullName || currentData?.experience?.length > 0;

    if (hasExistingData) {
      // If data exists, DO NOT overwrite. Just navigate.
      // The user can switch templates inside the builder if they really want to.
      toast.success("Resuming your saved draft...");
      navigate('/resume');
      return;
    }

    // Only if NO data exists, load the template
    dispatch(loadTemplate(templateData));
    await dispatch(saveDraft(templateData));
    toast.success(`${templateName} template loaded!`);
    navigate('/resume', { state: { templateLoaded: true, templateName } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Profile Section */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="relative group">
                <img
                  src={avatarPreview || "https://placehold.co/150"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  alt="Profile"
                />
                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                  <FaCamera className="text-gray-600" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={loading} />
                </label>
              </div>
              <div className="flex-1 ml-6 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mb-2 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaEdit />}
                {loading ? "Updating..." : "Save Profile"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={user?.email || ""}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Start with a Template</h3>
            {(currentData?.personalInfo?.fullName || currentData?.experience?.length > 0) && (
              <button
                onClick={() => navigate('/resume')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <FaEdit className="text-blue-600" />
                Continue Editing Draft
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Fresher Template Card */}
            <div
              onClick={() => handleSelectTemplate(fresherResume, "Fresher")}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-indigo-500 group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <FaUserGraduate className="text-2xl text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Fresher / Entry Level</h4>
                </div>
                <p className="text-gray-600 mb-4">
                  Optimized for students and graduates. Focuses on education, skills, projects, and internships. ATS-friendly layout.
                </p>
                <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
                  Use this template &rarr;
                </div>
              </div>
            </div>

            {/* Senior Template Card */}
            <div
              onClick={() => handleSelectTemplate(seniorResume, "Senior")}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-indigo-500 group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FaBriefcase className="text-2xl text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Senior / Experienced</h4>
                </div>
                <p className="text-gray-600 mb-4">
                  Designed for experienced professionals. Highlights work history, leadership roles, and specialized technical skills.
                </p>
                <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
                  Use this template &rarr;
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
