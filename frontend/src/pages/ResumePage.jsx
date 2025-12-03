import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchDraft, saveDraft, setResumeData, loadTemplate, fetchVersions, restoreVersion, saveVersion, deleteVersion, updateVersion } from '../redux/resume/resumeSlice';
import axios from 'axios';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';
import SaveVersionModal from '../components/SaveVersionModal';
import LoadExampleModal from '../components/LoadExampleModal';
import { fresherResume, seniorResume } from '../data/resumeTemplates';
import { FaHistory, FaSave, FaFileAlt, FaSpinner, FaChevronDown, FaCheckCircle, FaExclamationCircle, FaEdit, FaTrash, FaUndo, FaTimes, FaCheck, FaArrowLeft, FaSearchPlus, FaSearchMinus, FaExpand, FaCompress, FaLayerGroup, FaDownload } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import { toast } from 'react-hot-toast';

const ResumePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentData, status, isDirty, lastSaved, versions, error } = useSelector((state) => state.resume);
    // ...
    useEffect(() => {
        if (status === 'failed') {
            console.error("Failed to fetch draft:", error);
            toast.error("Failed to load your saved resume. Please refresh the page.");
        }
    }, [status, error]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadExampleModal, setShowLoadExampleModal] = useState(false);
    const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
    const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);
    const [editingVersion, setEditingVersion] = useState(null); // { id, name, description }
    const historyRef = useRef(null);
    const templatesRef = useRef(null);

    // Preview Controls
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const previewContainerRef = useRef(null);

    const location = useLocation();

    const [activeTemplateName, setActiveTemplateName] = useState('Fresher');

    // Initial Load
    useEffect(() => {
        console.log("ResumePage mounted. Location state:", location.state);
        // Only fetch draft if we didn't just load a template from ProfilePage
        if (!location.state?.templateLoaded) {
            console.log("Fetching draft...");
            dispatch(fetchDraft());
        } else if (location.state?.templateName) {
            console.log("Template loaded from state:", location.state.templateName);
            setActiveTemplateName(location.state.templateName);
        }
        dispatch(fetchVersions());
    }, [dispatch, location.state]);



    // Example Data replaced by fresherResume from templates


    const isResumeEmpty = (data) => {
        return !data.personalInfo.fullName &&
            !data.personalInfo.email &&
            data.experience.length === 0 &&
            data.education.length === 0 &&
            data.skills.length === 0 &&
            data.projects.length === 0;
    };

    const hasLoadedRef = useRef(false);

    // Initial Load & Default Example Check
    useEffect(() => {
        console.log("Status check:", status, "HasLoaded:", hasLoadedRef.current, "CurrentData:", currentData);
        if (status === 'succeeded' && !hasLoadedRef.current) {
            if (isResumeEmpty(currentData)) {
                console.log("Resume is empty, loading example...");
                // Use loadTemplate to avoid marking as dirty immediately on initial load
                dispatch(loadTemplate(fresherResume));
                dispatch(saveDraft(fresherResume));
                toast.success("Welcome! Loaded example data to get you started.");
            } else {
                console.log("Resume has data, skipping example load.");
            }
            hasLoadedRef.current = true;
        }
    }, [status, currentData, dispatch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (historyRef.current && !historyRef.current.contains(event.target)) {
                setShowHistoryDropdown(false);
            }
            if (templatesRef.current && !templatesRef.current.contains(event.target)) {
                setShowTemplatesDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Warn on unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Auto-save Logic
    const debouncedSave = useCallback(
        debounce((data) => {
            dispatch(saveDraft(data));
        }, 1000),
        [dispatch]
    );

    useEffect(() => {
        if (isDirty) {
            debouncedSave(currentData);
        }
    }, [currentData, isDirty, debouncedSave]);

    // Monitor save status
    useEffect(() => {
        if (status === 'failed' && error) {
            toast.error(`Error: ${error.message || "Something went wrong"}`);
        }
    }, [error, status]);

    // Load Example Data
    const loadExampleData = () => {
        // Use loadTemplate for manual load example too
        const templateToLoad = activeTemplateName === 'Senior' ? seniorResume : fresherResume;
        dispatch(loadTemplate(templateToLoad));
        dispatch(saveDraft(templateToLoad));
    };

    const loadExample = () => {
        setShowLoadExampleModal(true);
    };

    const handleLoadTemplate = async (templateData, templateName) => {
        // Simplified Logic: Only auto-save if the user has made actual edits (isDirty is true)
        if (isDirty) {
            try {
                await dispatch(saveVersion({
                    name: `Auto-save ${new Date().toLocaleTimeString()}`,
                    description: `Automatically saved before loading ${templateName} template`,
                    resumeData: currentData
                })).unwrap();
                toast.success("Current progress auto-saved.");
            } catch (error) {
                console.error("Failed to auto-save version:", error);
                toast.error("Failed to auto-save current progress.");
            }
        }

        // Use loadTemplate to set data without marking it as dirty
        dispatch(loadTemplate(templateData));
        await dispatch(saveDraft(templateData));
        setShowTemplatesDropdown(false);
        toast.success(`${templateName} template loaded!`);
    };

    const confirmLoadExample = async () => {
        // Helper to check for unsaved changes compared to the latest version
        const hasUnsavedChanges = () => {
            if (versions.length === 0) return true; // No versions, so definitely unsaved
            const latestVersion = versions[0];
            return JSON.stringify(currentData) !== JSON.stringify(latestVersion.resumeData);
        };

        // Only auto-save if there are actual changes compared to the last saved version
        if (currentData.personalInfo.fullName || currentData.experience.length > 0) {
            if (hasUnsavedChanges()) {
                try {
                    await dispatch(saveVersion({
                        name: `Auto-save ${new Date().toLocaleTimeString()}`,
                        description: 'Automatically saved before loading example',
                        resumeData: currentData
                    })).unwrap();
                    toast.success("Current progress auto-saved.");
                } catch (error) {
                    console.error("Failed to auto-save version:", error);
                    toast.error("Failed to auto-save current progress.");
                }
            } else {
                console.log("Skipping auto-save: No changes detected since last version.");
            }
        }
        loadExampleData();
        setShowLoadExampleModal(false);
        toast.success("Example data loaded!");
    };

    const handleSaveSuccess = () => {
        // No longer needed for loadExample, but might be used by SaveVersionModal
    };

    const handleRestore = async (e, version) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to restore version "${version.name}"? Current unsaved changes will be lost.`)) {
            try {
                await dispatch(restoreVersion(version.resumeData)).unwrap();
                toast.success(`Restored version: ${version.name}`);
                setShowHistoryDropdown(false);
            } catch (error) {
                console.error("Restore failed:", error);
                toast.error("Failed to restore version.");
            }
        }
    };

    const handleDeleteVersion = async (e, versionId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this version?")) {
            try {
                await dispatch(deleteVersion(versionId)).unwrap();
                toast.success("Version deleted successfully.");
            } catch (error) {
                console.error("Delete failed:", error);
                toast.error("Failed to delete version.");
            }
        }
    };

    const startEditVersion = (e, version) => {
        e.stopPropagation();
        setEditingVersion({ ...version });
    };

    const cancelEditVersion = (e) => {
        e.stopPropagation();
        setEditingVersion(null);
    };

    const saveEditVersion = async (e) => {
        e.stopPropagation();
        if (editingVersion) {
            try {
                await dispatch(updateVersion({
                    versionId: editingVersion.versionId,
                    name: editingVersion.name,
                    description: editingVersion.description
                })).unwrap();
                setEditingVersion(null);
                toast.success("Version updated successfully!");
            } catch (error) {
                toast.error("Failed to update version.");
            }
        }
    };

    const handleManualSaveDraft = async () => {
        try {
            await dispatch(saveDraft(currentData)).unwrap();
            toast.success("Draft saved successfully!");
        } catch (error) {
            toast.error("Failed to save draft.");
        }
    };

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            // Determine API URL based on environment
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocal
                ? 'http://localhost:5000/api/resume/download-pdf'
                : 'https://jobsfor-u.vercel.app/api/resume/download-pdf';

            // Call backend to generate PDF
            const response = await axios.post(
                apiUrl,
                { resumeData: currentData },
                {
                    responseType: 'blob', // Important for handling binary data
                    withCredentials: true
                }
            );

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generate filename
            const filename = `resume-${currentData.personalInfo.fullName.replace(/\s+/g, '_') || 'draft'}.pdf`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("PDF downloaded successfully!");
        } catch (error) {
            console.error("Download failed:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Please try again.';
            toast.error(`Failed to download PDF: ${errorMessage}`);
        } finally {
            setIsDownloading(false);
        }
    };

    // Zoom Handlers
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));

    // Fullscreen Handler
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            previewContainerRef.current.requestFullscreen().catch(err => {
                toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen change events (e.g., user pressing Esc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);


    if (status === 'loading' && !currentData.personalInfo.fullName) {
        return <div className="flex justify-center items-center h-screen bg-gray-50"><FaSpinner className="animate-spin text-4xl text-blue-600" /></div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
            {/* Minimal Top Bar */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center z-20 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                        title="Back to Dashboard"
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                        Resume<span className="font-light text-gray-400">Builder</span>
                    </h1>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                        {isDirty ? (
                            <>
                                <FaSpinner className="animate-spin text-blue-500" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle className="text-green-500" />
                                <span>Saved</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={handleManualSaveDraft} className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <FaSave /> Save Draft
                    </button>

                    <button onClick={loadExample} className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <FaFileAlt /> Load Example
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className={`text-sm font-medium transition-colors flex items-center gap-2 ${isDownloading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </button>

                    {/* Templates Dropdown */}
                    <div className="relative" ref={templatesRef}>
                        <button
                            onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <FaLayerGroup className="text-gray-400" />
                            Templates
                            <FaChevronDown className={`text-xs transition-transform ${showTemplatesDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showTemplatesDropdown && (
                            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up ring-1 ring-black/5">
                                <div className="py-1">
                                    <button
                                        onClick={() => handleLoadTemplate(fresherResume, "Fresher")}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                    >
                                        Fresher / Entry Level
                                    </button>
                                    <button
                                        onClick={() => handleLoadTemplate(seniorResume, "Senior")}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                    >
                                        Senior / Experienced
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* History Dropdown */}
                    <div className="relative" ref={historyRef}>
                        <button
                            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <FaHistory className="text-gray-400" />
                            History
                            <FaChevronDown className={`text-xs transition-transform ${showHistoryDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showHistoryDropdown && (
                            <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up ring-1 ring-black/5">
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 p-1.5 rounded-md">
                                            <FaHistory className="text-blue-600 text-xs" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-700 tracking-wide">Version History</h3>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">{versions.length} Saved</span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {versions.length === 0 ? (
                                        <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                                            <FaHistory className="text-3xl mb-3 opacity-20" />
                                            <p className="text-sm">No versions saved yet.</p>
                                            <p className="text-xs mt-1 opacity-60">Save your progress to create a version.</p>
                                        </div>
                                    ) : (
                                        versions.map((v) => (
                                            <div key={v.versionId} className="p-4 border-b border-gray-50 last:border-0 hover:bg-blue-50/50 transition-all duration-200 group relative">
                                                {editingVersion && editingVersion.versionId === v.versionId ? (
                                                    <div className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                                                        <input
                                                            type="text"
                                                            value={editingVersion.name}
                                                            onChange={(e) => setEditingVersion({ ...editingVersion, name: e.target.value })}
                                                            className="text-sm font-medium border-gray-200 rounded-md px-3 py-1.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                            placeholder="Version Name"
                                                            onClick={(e) => e.stopPropagation()}
                                                            autoFocus
                                                        />
                                                        <textarea
                                                            value={editingVersion.description || ''}
                                                            onChange={(e) => setEditingVersion({ ...editingVersion, description: e.target.value })}
                                                            className="text-xs text-gray-600 border-gray-200 rounded-md px-3 py-2 w-full resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                            placeholder="Add a description..."
                                                            rows="2"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="flex justify-end gap-2 pt-1">
                                                            <button onClick={cancelEditVersion} className="text-xs font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">Cancel</button>
                                                            <button onClick={saveEditVersion} className="text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md shadow-sm transition-all flex items-center gap-1">Save Changes</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <span className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">{v.name}</span>
                                                            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap border border-gray-200">{new Date(v.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {v.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{v.description}</p>}

                                                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                                                            <button
                                                                onClick={(e) => handleRestore(e, v)}
                                                                className="flex-1 text-xs font-medium flex items-center justify-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-md transition-all"
                                                                title="Restore this version"
                                                            >
                                                                <FaUndo size={10} /> Restore
                                                            </button>
                                                            <button
                                                                onClick={(e) => startEditVersion(e, v)}
                                                                className="text-xs font-medium flex items-center justify-center gap-1.5 text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-md transition-all shadow-sm"
                                                                title="Edit details"
                                                            >
                                                                <FaEdit size={10} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteVersion(e, v.versionId)}
                                                                className="text-xs font-medium flex items-center justify-center gap-1.5 text-red-600 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-md transition-all shadow-sm"
                                                                title="Delete version"
                                                            >
                                                                <FaTrash size={10} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            if (versions.length > 0 && JSON.stringify(currentData) === JSON.stringify(versions[0].resumeData)) {
                                toast.error("No changes to save. This version already exists.");
                                return;
                            }
                            setShowSaveModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-lg hover:scale-105 transition-all"
                    >
                        <FaSave /> Save Version
                    </button>
                </div>
            </div>

            {/* Main Content - Split Screen */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Form */}
                <div className="w-1/2 h-full bg-gray-50/50 overflow-hidden">
                    <ResumeForm data={currentData} />
                </div>

                {/* Right: Preview */}
                <div className="w-1/2 h-full bg-gray-200/50 overflow-hidden relative flex flex-col">

                    {/* Preview Toolbar */}
                    <div className="absolute top-4 right-8 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200">
                        <button
                            onClick={() => {
                                setIsRefreshing(true);
                                setTimeout(() => setIsRefreshing(false), 500);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
                            title="Refresh Preview"
                        >
                            <FaUndo className={`transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors" title="Zoom Out">
                            <FaSearchMinus />
                        </button>
                        <span className="text-xs font-medium text-gray-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors" title="Zoom In">
                            <FaSearchPlus />
                        </button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors" title="Toggle Fullscreen">
                            {isFullscreen ? <FaCompress /> : <FaExpand />}
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div
                        ref={previewContainerRef}
                        className={`flex-1 overflow-auto flex justify-center p-8 transition-all duration-300 ${isFullscreen ? 'bg-gray-900' : ''} ${isRefreshing ? 'opacity-50 blur-sm scale-95' : 'opacity-100 scale-100'}`}
                    >
                        <div
                            className="transition-transform duration-200 origin-top shadow-2xl rounded-sm bg-white"
                            style={{
                                transform: `scale(${zoomLevel})`,
                                width: '210mm',
                                minHeight: '297mm',
                                height: 'fit-content'
                            }}
                        >
                            <ResumePreview />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showSaveModal && <SaveVersionModal onClose={() => setShowSaveModal(false)} onSaveSuccess={handleSaveSuccess} />}
            {showLoadExampleModal && <LoadExampleModal onClose={() => setShowLoadExampleModal(false)} onConfirm={confirmLoadExample} />}

        </div>
    );
};

export default ResumePage;
