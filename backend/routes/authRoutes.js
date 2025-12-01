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
  updateProfile,
  currentUser
} from "../controllers/authController.js";

import isAuth from "../middleware/isAuth.js";

const authRouter = express.Router();

authRouter.get("/current-user", isAuth, currentUser); // ✅ now returns 200 with null if not logged in
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.post("/google", googleAuth);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.put("/profile", isAuth, updateProfile);

export default authRouter;
