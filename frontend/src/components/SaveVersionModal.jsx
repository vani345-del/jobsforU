import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { saveVersion } from "../redux/resume/resumeSlice"
import { FaSave, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

const SaveVersionModal = ({ onClose, onSaveSuccess }) => {
    const dispatch = useDispatch();
    const { currentData } = useSelector((state) => state.resume);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = async () => {
        if (!name.trim()) return;

        try {
            await dispatch(saveVersion({
                name,
                description,
                resumeData: currentData
            })).unwrap();
            toast.success("Version saved successfully!");
            onClose();
        } catch (error) {
            console.error("Failed to save version:", error);
            toast.error("Failed to save version.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaSave /> Save Version
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Version Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Software Engineer V1"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Notes about this version..."
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none h-24"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Version
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveVersionModal;
