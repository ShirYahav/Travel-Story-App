import StoryModel, { IStory } from "../models/story-model";
import LocationModel, { ILocation } from "../models/location-model";
import RouteModel, { IRoute } from "../models/route-model";

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
    .exec();
}

async function addStory(
  userId: string,
  title: string,
  description: string,
  countries: string[],
  startDate: Date,
  endDate: Date,
  budget: number,
  currency: string,
  locations: ILocation[],
  routes: IRoute[]
): Promise<IStory> {
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
    user: userId,
    title,
    description,
    countries,
    startDate,
    endDate,
    budget,
    currency,
    locations: savedLocations.map((loc) => loc._id),
    routes: savedRoutes.map((route) => route._id),
  });

  return newStory.save();
}

export default {
  getAllStories,
  getStoriesByCountry,
  addStory,
};
