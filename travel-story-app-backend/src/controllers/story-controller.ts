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

    // Save each location first
    const savedLocations = [];
    for (const location of locations) {
      const newLocation = new LocationModel(location);
      const savedLocation = await newLocation.save();
      savedLocations.push(savedLocation._id); // Save the ObjectId reference
    }

    // Save each route first
    const savedRoutes = [];
    for (const route of routes) {
      const newRoute = new RouteModel(route);
      const savedRoute = await newRoute.save();
      savedRoutes.push(savedRoute._id); // Save the ObjectId reference
    }

    // Now create the story, passing the ObjectId references for locations and routes
    const newStory = new StoryModel({
      user,
      title,
      description,
      countries,
      startDate: new Date(startDate),  // Ensure correct date format
      endDate: new Date(endDate),
      budget,
      currency,
      locations: savedLocations,  // Use the saved location ObjectId's
      routes: savedRoutes,        // Use the saved route ObjectId's
      likes: 0                    // Default likes to 0
    });

    const savedStory = await newStory.save();
    res.status(201).json({
      message: "Story created successfully",
      story: savedStory,
      locations: savedLocations // Ensure this returns the full locations, not just their IDs.
    });

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
export default router;
