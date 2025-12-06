// config/ai.js
// config/ai.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    
  apiKey: process.env.OPENAI_API_KEY,
  // Force the real OpenAI endpoint (ignores any wrong OPENAI_BASE_URL)
   baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export default openai;
