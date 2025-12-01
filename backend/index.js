import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";

import authRouter from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Body parsers with limit (for base64 avatars etc.)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

import multer from "multer";
const upload = multer();
app.use(upload.none());

// 🎯 Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://jobs4u-ai.vercel.app",
  "https://jobs4u-ai-9vrl.vercel.app",
  "https://jobsfor-u-4qa6.vercel.app", 
   "https://jobsfor-o5up5tfvd-vanis-projects-3c27f728.vercel.app"  // ⭐ ADD THIS
];



const vercelPreviewRegex = /^https:\/\/[^/]+\.vercel\.app$/; 



// CORS with dynamic origin
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (vercelPreviewRegex.test(origin)) {
        return callback(null, true);

      }

      console.log("❌ CORS BLOCKED ORIGIN:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Cookies
app.use(cookieParser());

// Passport
app.use(passport.initialize());

// Connect to DB once
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

// Routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

// CRITICAL: For local development only
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// CRITICAL: Export for Vercel serverless
export default app;