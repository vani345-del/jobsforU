import groq from '../config/ai.js';

export const enhancedSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: "User content is required" });
        }

        console.log("Calling Groq AI (Llama 3.3)");
        console.log("User content:", userContent);

        // Call Groq API with Llama 3.3 model (latest supported model)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert resume writer. Create a professional 1-2 sentence summary highlighting the candidate's experience, skills, achievements, and career goals. Be concise and ATS-friendly."
                },
                {
                    role: "user",
                    content: userContent
                }
            ],
            model: "llama-3.3-70b-versatile", // Latest fast and high-quality model
            temperature: 0.7,
            max_tokens: 150
        });

        const enhancedSummary = chatCompletion.choices[0]?.message?.content || "";

        console.log("Enhanced summary generated successfully via Groq");

        return res.status(200).json({ message: enhancedSummary });

    } catch (error) {
        console.error("Groq AI Error:", error);
        console.error("Error details:", error.message);
        return res.status(500).json({ message: error.message || "Failed to enhance summary" });
    }
};
