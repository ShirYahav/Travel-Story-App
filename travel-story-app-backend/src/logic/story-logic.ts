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
  user: string,
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
    user: user,
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
  // Find the existing story by ID
  const existingStory = await StoryModel.findById(storyId);
  if (!existingStory) {
    throw new Error("Story not found.");
  }

    // Step 1: Find and delete locations that are no longer in the updated locations list
  const existingLocationIds = existingStory.locations.map((loc: any) => loc._id.toString());
  const updatedLocationIds = locations.map((loc) => loc._id?.toString());
  
    // Identify locations to delete (those in existingStory but not in updated locations)
  const locationsToDelete = existingLocationIds.filter(id => !updatedLocationIds.includes(id));
  await LocationModel.deleteMany({ _id: { $in: locationsToDelete } });
  
  // Update Locations: either update or add new locations
  const updatedLocations = [];
  for (const locationData of locations) {
    if (locationData._id) {
      // Update existing location
      const updatedLocation = await LocationModel.findByIdAndUpdate(locationData._id, locationData, { new: true });
      updatedLocations.push(updatedLocation);
    } else {
      // Add new location
      const newLocation = new LocationModel(locationData);
      const savedLocation = await newLocation.save();
      updatedLocations.push(savedLocation);
    }
  }

  const existingRouteIds = existingStory.routes.map((route: any) => route._id.toString());
  const updatedRouteIds = routes.map((route) => route._id?.toString());

  // Identify routes to delete (those in existingStory but not in updated routes)
  const routesToDelete = existingRouteIds.filter(id => !updatedRouteIds.includes(id));
  await RouteModel.deleteMany({ _id: { $in: routesToDelete } });

  // Update Routes: either update or add new routes
  const updatedRoutes = [];
  for (const routeData of routes) {
    if (routeData._id) {
      // Update existing route
      const updatedRoute = await RouteModel.findByIdAndUpdate(routeData._id, routeData, { new: true });
      updatedRoutes.push(updatedRoute);
    } else {
      // Add new route
      const newRoute = new RouteModel(routeData);
      const savedRoute = await newRoute.save();
      updatedRoutes.push(savedRoute);
    }
  }

  // Update the story with new data
  existingStory.title = title;
  existingStory.description = description;
  existingStory.countries = countries;
  existingStory.startDate = startDate;
  existingStory.endDate = endDate;
  existingStory.budget = budget;
  existingStory.currency = currency;
  existingStory.locations = updatedLocations.map((loc) => loc._id);
  existingStory.routes = updatedRoutes.map((route) => route._id);

  // Save the updated story
  return existingStory.save();
}

export default {
  getAllStories,
  getStoriesByCountry,
  addStory,
  updateStory
};
