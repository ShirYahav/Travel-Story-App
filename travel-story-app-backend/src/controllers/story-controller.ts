import express, { IRoute, Request, Response } from "express";
import logic from "../logic/story-logic";
import { ILocation } from "../models/location-model";

const router = express.Router();

router.get("/all-stories", async (request: Request, response: Response) => {
  try {
    const stories = await logic.getAllStories();
    response.json(stories);
  } catch (err) {
    response.status(400).json({ message: err.message });
  }
});

router.get("/stories-by-country/:country", async (request: Request, response: Response) => {
    try {
      const { country } = request.params;
      const stories = await logic.getStoriesByCountry(country);
      response.json(stories);
    } catch (err) {
      response.status(400).json({ message: err.message });
    }
  }
);

router.post('/add-story', async (req: Request, res: Response) => {
    try {
      const { user, title, description, countries, startDate, endDate, budget, currency, locations, routes } = req.body;
  
      const newStory = await logic.addStory(
        user,
        title,
        description,
        countries,
        startDate,
        endDate,
        budget,
        currency,
        locations,
        routes
      );
  
      res.status(201).json(newStory);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

router.put('/update-story/:storyId', async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;
    const { title, description, countries, startDate, endDate, budget, currency, locations, routes } = req.body;

    const updatedStory = await logic.updateStory(
      storyId,
      title,
      description,
      countries,
      startDate,
      endDate,
      budget,
      currency,
      locations,
      routes
    );

    if (!updatedStory) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.status(200).json(updatedStory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
