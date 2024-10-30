import express, { Request, Response } from "express";
import { OpenAI } from 'openai';

const router = express.Router();

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/generate-story-post', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],  // Use 'messages' for chat models
      max_tokens: 500,
    });
    res.json({ post: response.choices[0].message?.content.trim() || "Couldn't generate a post." });
  } catch (error) {
    console.error("Error generating Facebook post:", error);
    res.status(500).json({ error: "Failed to generate post content." });
  }
});

export default router;