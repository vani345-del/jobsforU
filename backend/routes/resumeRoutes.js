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
    if (!req.userId) {
        return res.status(401).json({ message: 'Not authorized' });
    }
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
