import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";

import authRouter from "./routes/authRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";


dotenv.config();
connectDB()
const app = express();
const port = process.env.PORT || 8000;

// Parse JSON (for base64 avatar)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));



const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://jobsfor-u-4qa6.vercel.app",
  "https://jobsfor-u-4qa6.vercel.app/",
  "https://jobsfor-u.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS middleware handles preflight automatically
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowedOrigins or is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

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
app.use("/api/resume", resumeRouter);


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
