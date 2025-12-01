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
    updateProfile ,
    currentUser
} from "../controllers/authController.js";

import isAuth from "../middleware/isAuth.js";
import passport from 'passport'; 
import User from '../models/User.js'; // ⭐ NEW IMPORT for route handler




const authRouter = express.Router();

authRouter.put("/profile",
    isAuth,
    updateProfile
);


// ⭐ NEW Route: Endpoint to check if the cookie/token is valid and return user data
authRouter.get("/current-user", isAuth, currentUser);


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