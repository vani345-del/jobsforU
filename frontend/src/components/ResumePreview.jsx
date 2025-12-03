import React from 'react';
import { useSelector } from 'react-redux';
import { FaEnvelope, FaPhone, FaLinkedin, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

const ResumePreview = () => {
    const { currentData } = useSelector((state) => state.resume);
    const { personalInfo, experience, education, skills, projects, certifications } = currentData;

    return (
        <div className="bg-white min-h-[297mm] p-12 text-gray-800 font-sans shadow-sm" data-resume-preview>

            {/* Header */}
            <header className="border-b-2 border-gray-800 pb-6 mb-8">
                <h1 className="text-5xl font-bold uppercase tracking-wider text-gray-900 mb-4">
                    {personalInfo.fullName || 'Your Name'}
                </h1>
                <div className="flex flex-wrap gap-6 text-gray-600 text-sm font-medium">
                    {personalInfo.email && (
                        <div className="flex items-center">
                            <FaEnvelope className="mr-2" /> {personalInfo.email}
                        </div>
                    )}
                    {personalInfo.phone && (
                        <div className="flex items-center">
                            <FaPhone className="mr-2" /> {personalInfo.phone}
                        </div>
                    )}
                    {personalInfo.address && (
                        <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2" /> {personalInfo.address}
                        </div>
                    )}
                    {personalInfo.linkedin && (
                        <div className="flex items-center">
                            <FaLinkedin className="mr-2" /> {personalInfo.linkedin}
                        </div>
                    )}
                    {personalInfo.portfolio && (
                        <div className="flex items-center">
                            <FaGlobe className="mr-2" /> {personalInfo.portfolio}
                        </div>
                    )}
                </div>
            </header>

            {/* Summary */}
            {personalInfo.summary && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-base">
                        {personalInfo.summary}
                    </p>
                </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Experience
                    </h2>
                    <div className="space-y-6">
                        {experience.map((exp, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{exp.jobTitle}</h3>
                                    <span className="text-sm text-gray-500 font-semibold">
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="text-gray-700 font-medium italic mb-2">
                                    {exp.company} {exp.location && `| ${exp.location}`}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {education.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Education
                    </h2>
                    <div className="space-y-4">
                        {education.map((edu, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-bold text-gray-900">{edu.school}</h3>
                                    <span className="text-sm text-gray-500 font-semibold">
                                        {edu.startDate} - {edu.endDate}
                                    </span>
                                </div>
                                <div className="text-gray-700">
                                    {edu.degree} {edu.location && `| ${edu.location}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Skills
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                        {skills.map((skillGroup, index) => (
                            <div key={index} className="flex flex-col">
                                <span className="font-bold text-gray-900 mb-1">{skillGroup.category}</span>
                                <div className="flex flex-wrap gap-2">
                                    {skillGroup.items.map((item, idx) => (
                                        <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Projects
                    </h2>
                    <div className="space-y-4">
                        {projects.map((proj, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {proj.title}
                                        {proj.link && (
                                            <a href={`https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 text-sm font-normal hover:underline">
                                                ({proj.link})
                                            </a>
                                        )}
                                    </h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                    {proj.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Certifications
                    </h2>
                    <div className="space-y-3">
                        {certifications.map((cert, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">{cert.name}</span>
                                <span className="text-sm text-gray-500 font-semibold">{cert.date}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
};

export default ResumePreview;
