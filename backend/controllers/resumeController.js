import Resume from '../models/Resume.js';
import { v4 as uuidv4 } from 'uuid';
import { generateResumeHTML } from '../utils/generateResumeHTML.js';

// --- Draft Controllers ---

// Get Draft
export const getDraft = async (req, res) => {
    try {
        console.log(`[getDraft] Fetching draft for user: ${req.userId}`);
        let resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            console.log(`[getDraft] No resume found, creating new one for user: ${req.userId}`);
            // Create a new empty resume document if it doesn't exist
            resume = await Resume.create({
                userId: req.userId,
                draft: {
                    personalInfo: {
                        fullName: "",
                        email: "",
                        phone: "",
                        linkedin: "",
                        portfolio: "",
                        address: "",
                        summary: ""
                    },
                    experience: [],
                    education: [],
                    skills: [],
                    projects: [],
                    certifications: []
                },
                versions: []
            });
        } else {
            console.log(`[getDraft] Found resume. Draft fullName: ${resume.draft?.personalInfo?.fullName}`);
        }

        res.json(resume.draft);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Save/Update Draft
export const saveDraft = async (req, res) => {
    try {
        const { resumeData } = req.body;
        console.log(`[saveDraft] Saving draft for user: ${req.userId}. Name: ${resumeData?.personalInfo?.fullName}`);

        let resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            console.log(`[saveDraft] No resume found, creating new one.`);
            resume = new Resume({ userId: req.userId });
        }

        resume.draft = resumeData;
        const savedResume = await resume.save();
        console.log(`[saveDraft] Saved successfully. New draft fullName: ${savedResume.draft?.personalInfo?.fullName}`);

        res.json(resume.draft);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Version Controllers ---

// Create Version
export const createVersion = async (req, res) => {
    try {
        const { name, description, resumeData } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Version name is required' });
        }

        let resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const newVersion = {
            versionId: uuidv4(),
            name,
            description,
            createdAt: new Date(),
            resumeData: resumeData || resume.draft // Use provided data or current draft
        };

        resume.versions.push(newVersion);
        await resume.save();

        res.json(newVersion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get All Versions
export const getVersions = async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            return res.json([]);
        }

        // Return versions sorted by date desc
        const sortedVersions = resume.versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(sortedVersions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete Version
export const deleteVersion = async (req, res) => {
    try {
        const { versionId } = req.params;

        const resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        resume.versions = resume.versions.filter(v => v.versionId !== versionId);
        await resume.save();

        res.json({ message: 'Version deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Version (Name/Description)
export const updateVersion = async (req, res) => {
    try {
        const { versionId } = req.params;
        const { name, description } = req.body;

        const resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const versionIndex = resume.versions.findIndex(v => v.versionId === versionId);
        if (versionIndex === -1) {
            return res.status(404).json({ message: 'Version not found' });
        }

        if (name) resume.versions[versionIndex].name = name;
        if (description !== undefined) resume.versions[versionIndex].description = description;

        await resume.save();

        res.json(resume.versions[versionIndex]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Download PDF with @sparticuz/chromium
export const downloadPDF = async (req, res) => {
    try {
        const { resumeData } = req.body;

        if (!resumeData) {
            return res.status(400).json({ message: 'Resume data is required' });
        }

        const html = generateResumeHTML(resumeData);
        let browser = null;

        try {
            console.log('[PDF] Starting PDF generation...');

            if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
                console.log('[PDF] Running in PRODUCTION/VERCEL mode with @sparticuz/chromium');

                const chromium = await import('@sparticuz/chromium');
                const puppeteerCore = await import('puppeteer-core');

                // Configure sparticuz/chromium
                chromium.default.setGraphicsMode = false;

                // Log the path to debug
                const executablePath = await chromium.default.executablePath();
                console.log('[PDF] Executable Path:', executablePath);

                browser = await puppeteerCore.default.launch({
                    args: chromium.default.args,
                    defaultViewport: chromium.default.defaultViewport,
                    executablePath: executablePath,
                    headless: chromium.default.headless,
                    ignoreHTTPSErrors: true,
                });

                console.log('[PDF] Browser launched with @sparticuz/chromium');
            } else {
                // Local development
                console.log('[PDF] Running in LOCAL mode');
                const puppeteer = await import('puppeteer');

                browser = await puppeteer.default.launch({
                    headless: "new",
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });

                console.log('[PDF] Browser launched with local puppeteer');
            }

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            console.log('[PDF] HTML content loaded');

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });

            await browser.close();
            console.log('[PDF] PDF generated successfully');

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Length': pdfBuffer.length,
                'Content-Disposition': `attachment; filename="resume-${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}.pdf"`
            });

            return res.send(pdfBuffer);
        } catch (error) {
            console.error('[PDF] Generation Error:', error);
            if (browser) await browser.close();
            return res.status(500).json({
                message: 'Failed to generate PDF',
                error: error.message
            });
        }
    } catch (error) {
        console.error('[PDF] Controller Error:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};
