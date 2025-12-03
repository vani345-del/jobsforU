import express from 'express';
import isAuth from '../middleware/isAuth.js';
import {
    getDraft,
    saveDraft,
    createVersion,
    getVersions,
    deleteVersion,
    updateVersion,
    downloadPDF
} from '../controllers/resumeController.js';

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
    console.log(`[requireAuth] ${req.method} ${req.path} - userId: ${req.userId || 'null'}`);
    if (!req.userId) {
        console.log(`[requireAuth] ❌ Access denied - No userId`);
        return res.status(401).json({ message: 'Not authorized' });
    }
    console.log(`[requireAuth] ✅ Access granted for user: ${req.userId}`);
    next();
};

// Apply isAuth and requireAuth to all routes
router.use(isAuth);
router.use(requireAuth);

// --- Draft Routes ---
router.get('/draft', getDraft);
router.post('/draft', saveDraft);

// --- Version Routes ---
router.post('/version', createVersion);
router.get('/versions', getVersions);
router.delete('/version/:versionId', deleteVersion);
router.put('/version/:versionId', updateVersion);
router.post('/download-pdf', downloadPDF);

export default router;
