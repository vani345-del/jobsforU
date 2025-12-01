import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";

import authRouter from "./routes/authRoutes.js";

dotenv.config();
connectDB()
const app = express();
const port = process.env.PORT || 8000;

// Parse JSON (for base64 avatar)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ❌ Completely removed multer — it was breaking multipart requests

const allowedOrigins = [
  "http://localhost:5173",
  "https://jobsfor-u-4qa6.vercel.app", // frontend
  "https://jobsfor-u.vercel.app"       // backend (self)
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization"
  );

  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Important: respond to OPTIONS immediately
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

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
