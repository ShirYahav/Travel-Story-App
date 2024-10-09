import express, { IRoute, Request, Response } from "express";
import StoryModel from "../models/story-model";
import UserModel from "../models/user-model";
import cyber from "../utils/cyber";
import logic from '../logic/user-logic';


const router = express.Router();

router.post('/story/:storyId/like', async (req: Request, res: Response) => {
    try {
      const authorizationHeader = req.header("authorization");

      if (!authorizationHeader) {
        return res.status(401).send({ error: "Authorization header missing" });
      }

      const user = cyber.getUserFromToken(authorizationHeader);

      if (!user || !user._id) {
        return res.status(401).send({ error: "Invalid token" });
      }

      // Explicitly cast user._id to string
      const userId = user._id as string;
      const { storyId } = req.params;

      await logic.likeStory(userId, storyId);
      res.status(200).send({ message: "Story liked successfully" });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});

router.post('/story/:storyId/dislike', async (req: Request, res: Response) => {
    try {
      const authorizationHeader = req.header("authorization");

      if (!authorizationHeader) {
        return res.status(401).send({ error: "Authorization header missing" });
      }

      const user = cyber.getUserFromToken(authorizationHeader);

      if (!user || !user._id) {
        return res.status(401).send({ error: "Invalid token" });
      }

      const userId = user._id as string;
      const { storyId } = req.params;

      await logic.dislikeStory(userId, storyId);
      res.status(200).send({ message: "Story disliked successfully" });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});

router.get('/get-liked-stories/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const likedStories = await logic.getLikedStoriesByUser(userId);
      res.status(200).send(likedStories);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
});
  
export default router;
