import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import session from 'express-session';
import passport from 'passport';

import authRouter from './routes/authRoutes.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// ---------------------------------------------
// 1️⃣ CORS MUST BE FIRST — BEFORE session, passport
// ---------------------------------------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ---------------------------------------------
// 2️⃣ Body parser + cookie parser
// ---------------------------------------------
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------
// 3️⃣ Session MUST come AFTER CORS
// ---------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  })
);

// ---------------------------------------------
// 4️⃣ Passport after session
// ---------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, { id });
});

// ---------------------------------------------
// 5️⃣ Your Routes
// ---------------------------------------------
app.use('/api/auth', authRouter);

// ---------------------------------------------
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
