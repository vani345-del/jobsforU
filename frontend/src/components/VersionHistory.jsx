import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVersions, deleteVersion, restoreVersion } from '../redux/resume/resumeSlice';
import { FaHistory, FaTrash, FaUndo, FaTimes } from 'react-icons/fa';

const VersionHistory = ({ onClose }) => {
    const dispatch = useDispatch();
    const { versions } = useSelector((state) => state.resume);

    useEffect(() => {
        dispatch(fetchVersions());
    }, [dispatch]);

    const handleRestore = (version) => {
        if (window.confirm(`Are you sure you want to restore version "${version.name}"? Current unsaved changes will be lost.`)) {
            dispatch(restoreVersion(version.resumeData));
            onClose();
        }
    };

    const handleDelete = (versionId) => {
        if (window.confirm('Are you sure you want to delete this version?')) {
            dispatch(deleteVersion(versionId));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
            <div className="w-96 bg-white h-full shadow-xl p-6 overflow-y-auto animate-slide-in-right">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaHistory /> Version History
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                </div>

                {versions.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">No saved versions yet.</p>
                ) : (
                    <div className="space-y-4">
                        {versions.map((version) => (
                            <div key={version.versionId} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900">{version.name}</h3>
                                    <span className="text-xs text-gray-500">
                                        {new Date(version.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {version.description && (
                                    <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                                )}
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => handleRestore(version)}
                                        className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                                    >
                                        <FaUndo size={12} /> Restore
                                    </button>
                                    <button
                                        onClick={() => handleDelete(version.versionId)}
                                        className="flex items-center gap-1 text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                                    >
                                        <FaTrash size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VersionHistory;
