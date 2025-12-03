export const generateResumeHTML = (data) => {
    const { personalInfo, experience, education, skills, projects, certifications } = data;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
            @page { margin: 15mm; size: A4; }
            @media print {
                .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                .break-before-auto { break-before: auto; page-break-before: auto; }
                .break-after-auto { break-after: auto; page-break-after: auto; }
                section { break-inside: avoid; page-break-inside: avoid; }
                h2 { break-after: avoid; page-break-after: avoid; }
            }
        </style>
    </head>
    <body class="bg-white text-gray-800">
        <div class="w-full min-h-[297mm]">
            
            <!-- Header -->
            <header class="border-b-2 border-gray-800 pb-6 mb-8">
                <h1 class="text-5xl font-bold uppercase tracking-wider text-gray-900 mb-4">
                    ${personalInfo.fullName || 'Your Name'}
                </h1>
                <div class="flex flex-wrap gap-6 text-gray-600 text-sm font-medium">
                    ${personalInfo.email ? `
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                            ${personalInfo.email}
                        </div>` : ''}
                    ${personalInfo.phone ? `
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                            ${personalInfo.phone}
                        </div>` : ''}
                    ${personalInfo.address ? `
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                            ${personalInfo.address}
                        </div>` : ''}
                    ${personalInfo.linkedin ? `
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            ${personalInfo.linkedin}
                        </div>` : ''}
                    ${personalInfo.portfolio ? `
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/></svg>
                            ${personalInfo.portfolio}
                        </div>` : ''}
                </div>
            </header>

            <!-- Summary -->
            ${personalInfo.summary ? `
                <section class="mb-8">
                    <h2 class="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Professional Summary
                    </h2>
                    <p class="text-gray-700 leading-relaxed text-base">
                        ${personalInfo.summary}
                    </p>
                </section>` : ''}

            <!-- Experience -->
            ${experience.length > 0 ? `
                <section class="mb-8 break-inside-avoid">
                    <h2 class="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Experience
                    </h2>
                    <div class="space-y-6">
                        ${experience.map(exp => `
                            <div class="break-inside-avoid">
                                <div class="flex justify-between items-baseline mb-1">
                                    <h3 class="text-lg font-bold text-gray-900">${exp.jobTitle}</h3>
                                    <span class="text-sm text-gray-500 font-semibold">
                                        ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div class="text-gray-700 font-medium italic mb-2">
                                    ${exp.company} ${exp.location ? `| ${exp.location}` : ''}
                                </div>
                                <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">${exp.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>` : ''}

            <!-- Education -->
            ${education.length > 0 ? `
                <section class="mb-8 break-inside-avoid">
                    <h2 class="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Education
                    </h2>
                    <div class="space-y-4">
                        ${education.map(edu => `
                            <div class="break-inside-avoid">
                                <div class="flex justify-between items-baseline">
                                    <h3 class="text-lg font-bold text-gray-900">${edu.school}</h3>
                                    <span class="text-sm text-gray-500 font-semibold">
                                        ${edu.startDate} - ${edu.endDate}
                                    </span>
                                </div>
                                <div class="text-gray-700">
                                    ${edu.degree} ${edu.location ? `| ${edu.location}` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>` : ''}

            <!-- Skills -->
            ${skills.length > 0 ? `
                <section class="mb-8 break-inside-avoid">
                    <h2 class="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Skills
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                        ${skills.map(skillGroup => `
                            <div class="flex flex-col break-inside-avoid">
                                <span class="font-bold text-gray-900 mb-1">${skillGroup.category}</span>
                                <div class="flex flex-wrap gap-2">
                                    ${skillGroup.items.map(item => `
                                        <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                            ${item}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>` : ''}

            <!-- Projects -->
            ${projects.length > 0 ? `
                <section class="mb-8 break-inside-avoid">
                    <h2 class="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Projects
                    </h2>
                    <div class="space-y-4">
                        ${projects.map(proj => `
                            <div class="break-inside-avoid">
                                <div class="flex justify-between items-baseline mb-1">
                                    <h3 class="text-lg font-bold text-gray-900">
                                        ${proj.title}
                                        ${proj.link ? `<a href="https://${proj.link}" target="_blank" class="ml-2 text-blue-600 text-sm font-normal hover:underline">(${proj.link})</a>` : ''}
                                    </h3>
                                </div>
                                <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">${proj.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>` : ''}

            <!-- Certifications -->
            ${certifications.length > 0 ? `
                <section class="break-inside-avoid">
                    <h2 class="text-xl font-bold uppercase tracking-wider border-b border-gray-300 mb-4 pb-1 text-gray-800">
                        Certifications
                    </h2>
                    <div class="space-y-3">
                        ${certifications.map(cert => `
                            <div class="flex justify-between items-center break-inside-avoid">
                                <span class="font-bold text-gray-900">${cert.name}</span>
                                <span class="text-sm text-gray-500 font-semibold">${cert.date}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>` : ''}

        </div>
    </body>
    </html>
    `;
};
