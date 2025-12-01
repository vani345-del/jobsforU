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

// Parse JSON (for base64 avatar)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ❌ Completely removed multer — it was breaking multipart requests

// Allowed frontend domains
const allowedOrigins = [
  "http://localhost:5173",
  "https://jobs4u-ai.vercel.app",
  "https://jobs4u-ai-9vrl.vercel.app",
  "https://jobsfor-u-4qa6.vercel.app",
  "https://jobsfor-o5up5tfvd-vanis-projects-3c27f728.vercel.app"
];

const vercelPreviewRegex = /^https:\/\/[^/]+\.vercel\.app$/;

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      if (vercelPreviewRegex.test(origin)) return callback(null, true);

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

// Connect to DB
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

// Local mode
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
