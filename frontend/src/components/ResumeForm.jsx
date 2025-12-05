import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateResumeData, updateSectionData } from '../redux/resume/resumeSlice';
import { FaPlus, FaTrash, FaMagic } from 'react-icons/fa';
import axios from 'axios';

const InputGroup = ({ label, type = "text", value, onChange, placeholder, className = "" }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200 hover:bg-white hover:shadow-sm"
        />
    </div>
);

const TextAreaGroup = ({ label, value, onChange, placeholder, className = "" }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200 hover:bg-white hover:shadow-sm min-h-[100px]"
        />
    </div>
);

const SectionHeader = ({ title, onAdd }) => (
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h3>
        {onAdd && (
            <button
                onClick={onAdd}
                className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-medium"
            >
                <FaPlus size={10} /> Add New
            </button>
        )}
    </div>
);



const ResumeForm = ({ data }) => {
    const dispatch = useDispatch();
    const reduxData = useSelector((state) => state.resume.currentData);
    const currentData = data || reduxData;
    const { personalInfo, experience, education, skills, projects, certifications } = currentData;

    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhanceError, setEnhanceError] = useState('');

    const handleChange = (e, section, field) => {
        dispatch(updateResumeData({
            [section]: {
                ...currentData[section],
                [field]: e.target.value
            }
        }));
    };

    const handleAiEnhance = async () => {
        if (!personalInfo.summary || personalInfo.summary.trim() === '') {
            setEnhanceError('Please enter a summary first before enhancing it.');
            setTimeout(() => setEnhanceError(''), 3000);
            return;
        }

        setIsEnhancing(true);
        setEnhanceError('');

        try {
            const response = await axios.post('/api/ai/enhanced-summary', {
                userContent: personalInfo.summary
            });

            if (response.data && response.data.message) {
                dispatch(updateResumeData({
                    personalInfo: {
                        ...personalInfo,
                        summary: response.data.message
                    }
                }));
            }
        } catch (error) {
            console.error('Error enhancing summary:', error);
            setEnhanceError(error.response?.data?.message || 'Failed to enhance summary. Please try again.');
            setTimeout(() => setEnhanceError(''), 5000);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleArrayChange = (e, section, index, field) => {
        const newSectionData = [...currentData[section]];
        newSectionData[index] = { ...newSectionData[index], [field]: e.target.value };
        dispatch(updateSectionData({ section, data: newSectionData }));
    };

    const addItem = (section, initialItem) => {
        const newSectionData = [...currentData[section], initialItem];
        dispatch(updateSectionData({ section, data: newSectionData }));
    };

    const removeItem = (section, index) => {
        const newSectionData = currentData[section].filter((_, i) => i !== index);
        dispatch(updateSectionData({ section, data: newSectionData }));
    };

    const handleSkillCategoryChange = (e, index) => {
        const newSkills = [...skills];
        newSkills[index] = { ...newSkills[index], category: e.target.value };
        dispatch(updateSectionData({ section: 'skills', data: newSkills }));
    };

    const handleSkillItemsChange = (e, index) => {
        const newSkills = [...skills];
        newSkills[index] = { ...newSkills[index], items: e.target.value.split(',').map(item => item.trim()) };
        dispatch(updateSectionData({ section: 'skills', data: newSkills }));
    };

    return (
        <div className="h-full overflow-y-auto p-6 bg-white/50 backdrop-blur-sm custom-scrollbar pb-20">
            <div className="max-w-3xl mx-auto space-y-10 pb-20">

                {/* Personal Info */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <SectionHeader title="Personal Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputGroup label="Full Name" value={personalInfo.fullName || ''} onChange={(e) => handleChange(e, 'personalInfo', 'fullName')} placeholder="e.g. Alex Morgan" />
                        <InputGroup label="Email Address" type="email" value={personalInfo.email || ''} onChange={(e) => handleChange(e, 'personalInfo', 'email')} placeholder="e.g. alex@example.com" />
                        <InputGroup label="Phone Number" value={personalInfo.phone || ''} onChange={(e) => handleChange(e, 'personalInfo', 'phone')} placeholder="e.g. +1 555 000 0000" />
                        <InputGroup label="LinkedIn URL" value={personalInfo.linkedin || ''} onChange={(e) => handleChange(e, 'personalInfo', 'linkedin')} placeholder="linkedin.com/in/..." />
                        <InputGroup label="Portfolio URL" value={personalInfo.portfolio || ''} onChange={(e) => handleChange(e, 'personalInfo', 'portfolio')} placeholder="yourwebsite.com" />
                        <InputGroup label="Location" value={personalInfo.address || ''} onChange={(e) => handleChange(e, 'personalInfo', 'address')} placeholder="City, Country" />

                        {/* AI Enhance Button and Professional Summary */}
                        <div className="md:col-span-2 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                                    Professional Summary
                                </label>
                                <button
                                    onClick={handleAiEnhance}
                                    disabled={isEnhancing || !personalInfo.summary}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isEnhancing || !personalInfo.summary
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:shadow-lg transform hover:scale-105'
                                        }`}
                                >
                                    <FaMagic className={isEnhancing ? 'animate-spin' : ''} />
                                    {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
                                </button>
                            </div>

                            {enhanceError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                                    {enhanceError}
                                </div>
                            )}

                            <textarea
                                value={personalInfo.summary || ''}
                                onChange={(e) => handleChange(e, 'personalInfo', 'summary')}
                                placeholder="Briefly describe your professional background..."
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all duration-200 hover:bg-white hover:shadow-sm min-h-[100px]"
                            />
                        </div>
                    </div>
                </section>

                {/* Experience */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <SectionHeader title="Experience" onAdd={() => addItem('experience', { id: Date.now().toString(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' })} />
                    <div className="space-y-6">
                        {experience.map((exp, index) => (
                            <div key={index} className="relative p-5 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                <button onClick={() => removeItem('experience', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <FaTrash size={14} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Job Title" value={exp.jobTitle} onChange={(e) => handleArrayChange(e, 'experience', index, 'jobTitle')} placeholder="e.g. Senior Developer" />
                                    <InputGroup label="Company" value={exp.company} onChange={(e) => handleArrayChange(e, 'experience', index, 'company')} placeholder="e.g. Tech Corp" />
                                    <InputGroup label="Location" value={exp.location} onChange={(e) => handleArrayChange(e, 'experience', index, 'location')} placeholder="e.g. New York, NY" />
                                    <div className="flex gap-3">
                                        <InputGroup label="Start Date" value={exp.startDate} onChange={(e) => handleArrayChange(e, 'experience', index, 'startDate')} placeholder="YYYY-MM" className="w-1/2" />
                                        <InputGroup label="End Date" value={exp.endDate} onChange={(e) => handleArrayChange(e, 'experience', index, 'endDate')} placeholder="YYYY-MM" className="w-1/2" />
                                    </div>
                                    <TextAreaGroup label="Description" value={exp.description} onChange={(e) => handleArrayChange(e, 'experience', index, 'description')} placeholder="Describe your responsibilities and achievements..." className="md:col-span-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Education */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <SectionHeader title="Education" onAdd={() => addItem('education', { id: Date.now().toString(), degree: '', school: '', location: '', startDate: '', endDate: '' })} />
                    <div className="space-y-6">
                        {education.map((edu, index) => (
                            <div key={index} className="relative p-5 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                <button onClick={() => removeItem('education', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <FaTrash size={14} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Degree" value={edu.degree} onChange={(e) => handleArrayChange(e, 'education', index, 'degree')} placeholder="e.g. BS Computer Science" />
                                    <InputGroup label="School" value={edu.school} onChange={(e) => handleArrayChange(e, 'education', index, 'school')} placeholder="e.g. University of Tech" />
                                    <InputGroup label="Location" value={edu.location} onChange={(e) => handleArrayChange(e, 'education', index, 'location')} placeholder="City, Country" />
                                    <div className="flex gap-3">
                                        <InputGroup label="Start Date" value={edu.startDate} onChange={(e) => handleArrayChange(e, 'education', index, 'startDate')} placeholder="YYYY-MM" className="w-1/2" />
                                        <InputGroup label="End Date" value={edu.endDate} onChange={(e) => handleArrayChange(e, 'education', index, 'endDate')} placeholder="YYYY-MM" className="w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Skills */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <SectionHeader title="Skills" onAdd={() => addItem('skills', { category: '', items: [] })} />
                    <div className="space-y-4">
                        {skills.map((skill, index) => (
                            <div key={index} className="relative p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                <button onClick={() => removeItem('skills', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <FaTrash size={14} />
                                </button>
                                <div className="grid grid-cols-1 gap-4">
                                    <InputGroup label="Category" value={skill.category} onChange={(e) => handleSkillCategoryChange(e, index)} placeholder="e.g. Frontend, Languages" />
                                    <InputGroup label="Skills (comma separated)" value={skill.items.join(', ')} onChange={(e) => handleSkillItemsChange(e, index)} placeholder="React, Node.js, Python..." />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Projects */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <SectionHeader title="Projects" onAdd={() => addItem('projects', { id: Date.now().toString(), title: '', link: '', description: '' })} />
                    <div className="space-y-6">
                        {projects.map((proj, index) => (
                            <div key={index} className="relative p-5 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                <button onClick={() => removeItem('projects', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <FaTrash size={14} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Project Title" value={proj.title} onChange={(e) => handleArrayChange(e, 'projects', index, 'title')} placeholder="e.g. E-Commerce App" />
                                    <InputGroup label="Link" value={proj.link} onChange={(e) => handleArrayChange(e, 'projects', index, 'link')} placeholder="github.com/..." />
                                    <TextAreaGroup label="Description" value={proj.description} onChange={(e) => handleArrayChange(e, 'projects', index, 'description')} placeholder="What did you build?" className="md:col-span-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Certifications */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <SectionHeader title="Certifications" onAdd={() => addItem('certifications', { id: Date.now().toString(), name: '', date: '' })} />
                    <div className="space-y-4">
                        {certifications.map((cert, index) => (
                            <div key={index} className="relative p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                <button onClick={() => removeItem('certifications', index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <FaTrash size={14} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Certification Name" value={cert.name} onChange={(e) => handleArrayChange(e, 'certifications', index, 'name')} placeholder="e.g. AWS Certified" />
                                    <InputGroup label="Date" value={cert.date} onChange={(e) => handleArrayChange(e, 'certifications', index, 'date')} placeholder="YYYY-MM" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ResumeForm;
