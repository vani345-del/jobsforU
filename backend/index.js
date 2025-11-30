import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import session from "express-session";
import passport from "passport";

import authRouter from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
const port = process.env.PORT || 5000;

// Detect Production (Vercel)
const IS_PROD = process.env.NODE_ENV === "production";

// ===============================================
// ⭐ FINAL PERFECT CORS CONFIG FOR VERCEL + LOCAL
// ===============================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://jobsfor-u-4qa6.vercel.app",   // production frontend
];

// ⭐ Allow ALL preview URLs like:
// https://jobs4u-ai-9vrl.vercel.app
// https://jobs4u-ai-abcd3.vercel.app
const vercelPreviewRegex = /^https:\/\/jobs4u-ai-[a-z0-9]+\.vercel\.app$/;

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow no-origin requests (Postman, mobile apps)
      if (!origin) return callback(null, true);

      // Allow exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview URLs dynamically
      if (vercelPreviewRegex.test(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS BLOCKED:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);


// ===============================================
// Body + Cookies
// ===============================================
app.use(express.json());
app.use(cookieParser());

// ===============================================
// ⭐ FINAL SESSION CONFIG → PRODUCTION SAFE
// ===============================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: IS_PROD,               // MUST be true on Vercel
      sameSite: IS_PROD ? "none" : "lax", // MUST be none on Vercel
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// ===============================================
// Passport
// ===============================================
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

// ===============================================
// Routes
// ===============================================
app.use("/api/auth", authRouter);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
