import express, { Request, Response } from "express";
import logic from '../logic/story-logic';

const router = express.Router();

router.get("/all-stories", async (request: Request, response: Response) => {
    try {
        const stories = await logic.getAllStories();
        response.json(stories);
    } catch (err) {
        response.status(400).json({ message: err.message });
    }
});

export default router;
