// controllers/aiController.js
import dotenv from "dotenv";
import openai from "../config/ai.js";

dotenv.config();

export const enhancedSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "User content is required" });
    }

    const prompt = `
You are an expert resume writer. Generate ONLY a professional 1–2 sentence resume summary.
No introductions. No notes. Only the summary.

User summary:
${userContent}
`;

    console.log("Calling OpenAI with model:", process.env.OPENAI_MODEL);

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-nano",
      input: prompt,
      store: false,
    });

    const enhancedText = response.output_text;

    return res.status(200).json({ message: enhancedText });
  } catch (error) {
    console.error("OPENAI ERROR:", error);
    return res.status(500).json({ message: "Failed to enhance summary" });
  }
};
