import StoryModel, { IStory } from "../models/story-model";
import LocationModel, { ILocation } from "../models/location-model";
import RouteModel, { IRoute } from "../models/route-model";
import locationLogic from './location-logic';
import routeLogic from "./route-logic";
import { Types } from "mongoose";
import UserModel from "../models/user-model";

async function getAllStories(): Promise<IStory[]> {
  return StoryModel.find()
    .populate({ path: "locations", model: LocationModel })
    .populate({ path: "routes", model: RouteModel })
    .exec();
}

async function getStoriesByCountry(country: string): Promise<IStory[]> {
  return StoryModel.find({ countries: { $in: [country] } })
    .populate({ path: "locations", model: LocationModel })
    .populate({ path: "routes", model: RouteModel })
    .populate({ path: "user", model: UserModel })
    .exec();
}

async function getStoriesByUserId(userId: string): Promise<IStory[]> {
  const stories = await StoryModel.find({ user: userId })
  .populate({ path: "locations", model: LocationModel })
  .populate({ path: "routes", model: RouteModel })
  .exec();
  
  if (!stories || stories.length === 0) {
    throw new Error("No stories found for this user.");
  }

  return stories;
}

async function getStoryById(storyId: string): Promise<IStory | null> {
  try {
    
    const story = await StoryModel.findById(storyId)
      .populate({ path: "locations", model: LocationModel })
      .populate({ path: "routes", model: RouteModel })
      .exec();

    if (!story) {
      throw new Error("Story not found");
    }

    return story;
  } catch (error) {
    console.error(`Error fetching story with ID ${storyId}:`, error);
    throw new Error("Unable to fetch story");
  }
}

async function addStory(story: IStory): Promise<IStory> {
  const { locations, routes } = story;

  if (locations.length === 0) {
    throw new Error("A story must have at least one location.");
  }

  const savedLocations = [];
  for (const locationData of locations) {
    const location = new LocationModel(locationData);
    const savedLocation = await location.save();
    savedLocations.push(savedLocation);
  }

  const savedRoutes = [];
  for (const routeData of routes) {
    const route = new RouteModel(routeData);
    const savedRoute = await route.save();
    savedRoutes.push(savedRoute);
  }

  const newStory = new StoryModel({
    ...story, 
    locations: savedLocations.map((loc) => loc._id), 
    routes: savedRoutes.map((route) => route._id), 
  });

  return newStory.save();
}

async function updateStory(
  storyId: string,
  title: string,
  description: string,
  countries: string[],
  startDate: Date,
  endDate: Date,
  budget: number,
  currency: string,
  locations: ILocation[],
  routes: IRoute[]
): Promise<IStory | null> {
 
  const existingStory = await StoryModel.findById(storyId);
  if (!existingStory) {
    throw new Error("Story not found.");
  }

  const updatedLocations = await locationLogic.updateLocations(existingStory, locations);
  const updatedRoutes = await routeLogic.updateRoutes(existingStory, routes);

  existingStory.title = title;
  existingStory.description = description;
  existingStory.countries = countries;
  existingStory.startDate = startDate;
  existingStory.endDate = endDate;
  existingStory.budget = budget;
  existingStory.currency = currency;
  existingStory.locations = updatedLocations.map((loc) => loc._id as Types.ObjectId);
  existingStory.routes = updatedRoutes.map((route) => route._id as Types.ObjectId);

  return existingStory.save();
}

async function deleteStory(storyId: string): Promise<void> {
  
  const existingStory = await StoryModel.findById(storyId);
  if (!existingStory) {
    throw new Error("Story not found.");
  }

  const locationIds = existingStory.locations;
  await LocationModel.deleteMany({ _id: { $in: locationIds } });

  const routeIds = existingStory.routes;
  await RouteModel.deleteMany({ _id: { $in: routeIds } });

  await StoryModel.findByIdAndDelete(storyId);
}


export default {
  getAllStories,
  getStoriesByCountry,
  getStoriesByUserId,
  getStoryById,
  addStory,
  updateStory,
  deleteStory,
};
