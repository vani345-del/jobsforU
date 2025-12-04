import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/auth/authSlice';
import { FaUserCircle, FaSignOutAlt, FaFileAlt } from 'react-icons/fa';

const Header = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                        C
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">Clabsy</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    {user ? (
                        <>
                            <Link to="/resume" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
                                <FaFileAlt />
                                <span>Resume Builder</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
                                <FaUserCircle className="text-xl" />
                                <span>Profile</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2">
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
