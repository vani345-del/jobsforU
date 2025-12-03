import React from 'react';
import { FaExclamationTriangle, FaFileAlt, FaTimes } from 'react-icons/fa';

const LoadExampleModal = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-[480px] transform transition-all scale-100">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FaFileAlt className="text-blue-600 text-xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Load Example Resume</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                    <FaExclamationTriangle className="text-amber-500 mt-1 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Warning: Current content will be replaced.</p>
                        <p>Loading the example will replace all your current resume data.</p>
                    </div>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    Don't worry! Your current work will be automatically saved to your <strong>Version History</strong> before the example is loaded, so you can restore it later if needed.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                        Yes, Load Example
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoadExampleModal;
