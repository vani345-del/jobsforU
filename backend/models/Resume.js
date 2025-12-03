import mongoose from 'mongoose';

const resumeDataSchema = new mongoose.Schema({
    personalInfo: {
        fullName: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        portfolio: { type: String, default: "" },
        address: { type: String, default: "" },
        summary: { type: String, default: "" }
    },
    experience: [{
        id: String,
        jobTitle: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String
    }],
    education: [{
        id: String,
        degree: String,
        school: String,
        location: String,
        startDate: String,
        endDate: String
    }],
    skills: [{
        category: String,
        items: [String]
    }],
    projects: [{
        id: String,
        title: String,
        link: String,
        description: String
    }],
    certifications: [{
        id: String,
        name: String,
        date: String
    }]
}, { _id: false });

const versionSchema = new mongoose.Schema({
    versionId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    resumeData: { type: resumeDataSchema, required: true }
}, { _id: false });

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    draft: {
        type: resumeDataSchema,
        default: () => ({})
    },
    versions: [versionSchema]
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
