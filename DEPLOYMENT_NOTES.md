# Deployment Checklist

## 1. Environment Variables (Vercel)
Ensure the following environment variables are set in your **Frontend** project on Vercel:
- `VITE_BASE_URL`: The full URL of your deployed backend (e.g., `https://jobsfor-u.vercel.app` or `https://your-backend-project.vercel.app`).

## 2. CORS Configuration
I have already updated `backend/index.js` to include your Vercel domains:
- `https://jobsfor-u.vercel.app`
- `https://jobsfor-u-4qa6.vercel.app`
- `https://jobs4u-ai.vercel.app`

## 3. PDF Generation
The backend is now configured to use `@sparticuz/chromium` correctly in the Vercel environment. This allows Puppeteer to run within Vercel's serverless limits.

## 4. Redeploy
Push your latest changes to GitHub/GitLab to trigger a new deployment on Vercel.
