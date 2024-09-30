import express, { Request, Response } from "express";
import logic from "../logic/story-logic";

const router = express.Router();

router.get("/all-stories", async (request: Request, response: Response) => {
  try {
    const stories = await logic.getAllStories();
    response.json(stories);
  } catch (err) {
    response.status(400).json({ message: err.message });
  }
});

router.get(
  "/stories-by-country/:country",
  async (request: Request, response: Response) => {
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
      const { userId, title, description, countries, startDate, endDate, budget, currency, locations, routes } = req.body;
  
      const newStory = await logic.addStory(
        userId,
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

export default router;
