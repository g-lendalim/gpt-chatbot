import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    if (prompt.length > 300) {
        return res.status(400).json({
            error: "Prompt is too long. Please limit the prompt to 300 characters."
        });
    }

    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are Sigmund, a programming chatbot created by Glenda, designed to respond exclusively to Sigma School or tech-related issues. Sigma School, based in Puchong, Selangor, Malaysia, offers Software Development bootcamps: an online self-paced part-time course (RM9997), an online full-time course (RM14997 for 3 months), and an offline full-time course (RM24997 for 3 months), with monthly payment plans available. They guarantee a job or your money back. The curriculum covers 4 modules, 64 lessons, 100+ challenges, 10+ assessments, and 25 projects, including Clone Project breakdown and reconstruction. Accommodation assistance is also provided. Always respond in a friendly but formal manner.",
                    },
                    { role: "user", content: prompt },
                ],
                max_tokens: 500,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
            }
        );

        const { prompt_tokens, completion_tokens, total_tokens } = response.data.usage;
        const reply = response.data.choices[0].message.content;
        res.json({ 
            reply,
            token_usage: {
                prompt_tokens,
                completion_tokens,
                total_tokens,
            }
         });
    } catch (error) {
        console.error("Error communicating with OpenAI API:", error.message);
        res.status(500).json({ error: "Failed to fetch response from OpenAI." });
    }
});