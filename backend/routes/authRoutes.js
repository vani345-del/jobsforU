// File: authRoutes.js (UPDATED)

import express from "express";
import { 
    signup, 
    login, 
    logout, 
    googleAuth, 
    forgotPassword, 
    resetPassword, 
    verifyOtp,
    linkedInCallback,
    updateProfile 
} from "../controllers/authController.js";

import isAuth from "../middleware/isAuth.js";
import passport from 'passport'; 
import multer from 'multer';
import User from '../models/User.js'; // ⭐ NEW IMPORT for route handler


const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const authRouter = express.Router();

authRouter.put("/profile", 
    isAuth,
    upload.single('avatar'), 
    updateProfile
)

// ⭐ NEW Route: Endpoint to check if the cookie/token is valid and return user data
authRouter.get("/current-user", 
    isAuth,
    async (req, res) => {
        // isAuth middleware has validated the token and attached req.userId
        try {
            const user = await User.findById(req.userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: "Server error retrieving user." });
        }
    }
);


authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.post("/google", googleAuth);
authRouter.post("/forgot-password", forgotPassword); 
authRouter.post("/reset-password/:token", resetPassword);
authRouter.post("/verify-otp", verifyOtp);


authRouter.get("/linkedin", 
    passport.authenticate('linkedin', { 
        state: 'some_state_value', 
    })
);


authRouter.get("/linkedin/callback", 
    passport.authenticate('linkedin', { 
        failureRedirect: 'http://localhost:5173/login?error=auth_denied', 
        session: true 
    }),
  
    linkedInCallback 
);

export default authRouter;