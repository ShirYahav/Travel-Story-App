import express, { IRoute, Request, Response } from "express";
import logic from "../logic/story-logic";
import StoryModel, { IStory } from "../models/story-model";
import LocationModel from "../models/location-model";
import RouteModel from "../models/route-model";

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

    const savedLocations = [];
    for (const location of locations) {
      const newLocation = new LocationModel(location);
      const savedLocation = await newLocation.save();
      savedLocations.push(savedLocation._id);
    }

    const savedRoutes = [];
    for (const route of routes) {
      const newRoute = new RouteModel(route);
      const savedRoute = await newRoute.save();
      savedRoutes.push(savedRoute._id);
    }

    const newStory = new StoryModel({
      user,
      title,
      description,
      countries,
      startDate: new Date(startDate),  
      endDate: new Date(endDate),
      budget,
      currency,
      locations: savedLocations,  
      routes: savedRoutes,  
      likes: 0 
    });

    const savedStory = await newStory.save();
    res.status(201).json({
      message: "Story created successfully",
      story: savedStory,
      locations: savedLocations 
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.put('/update-story/:storyId', async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;
    const { title, description, countries, startDate, endDate, budget, currency, locations, routes } = req.body;

    const updateData = {
      title,
      description,
      countries,
      startDate: startDate ? new Date(startDate) : undefined, 
      endDate: endDate ? new Date(endDate) : undefined,       
      budget,
      currency,
      locations,
      routes
    };

    const updatedStory = await logic.updateStory(storyId, updateData);

    if (!updatedStory) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.status(200).json(updatedStory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/delete-story/:storyId', async (req: Request, res: Response) => {

  const { storyId } = req.params;
  try {

    await logic.deleteStory(storyId);
    res.status(200).json({ message: 'Story and associated data deleted successfully.' });
  } catch (err) {

    res.status(400).json({ message: err.message });
  }
});

router.get('/stories-by-user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const stories = await logic.getStoriesByUserId(userId);
    res.status(200).json(stories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/story/:storyId', async (req: Request, res: Response) => {
  const { storyId } = req.params;

  try {
    const story = await logic.getStoryById(storyId);
    res.status(200).json(story);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/story/:storyId/like", async (req: Request, res: Response) => {
  const { storyId } = req.params;

  try {
    const updatedStory = await logic.likeStory(storyId);
    res.status(200).json({ success: true, likes: updatedStory.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/story/:storyId/unlike", async (req: Request, res: Response) => {
  const { storyId } = req.params;

  try {
    const updatedStory = await logic.unlikeStory(storyId);
    res.status(200).json({ success: true, likes: updatedStory.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/top-stories', async (req: Request, res: Response) => {
  try {
    const stories = await logic.getTopStories();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top vacations" });
  }
});

export default router;
