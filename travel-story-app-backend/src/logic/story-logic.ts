import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import StoryModel, { IStory } from "../models/story-model";
import LocationModel, { ILocation } from "../models/location-model";
import RouteModel, { IRoute } from "../models/route-model";
import locationLogic from "./location-logic";
import routeLogic from "./route-logic";
import UserModel from "../models/user-model";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


async function getAllStories(): Promise<IStory[]> {
  return StoryModel.find()
  .populate({ path: "locations", model: LocationModel })
  .populate({ path: "routes", model: RouteModel })
  .populate({ path: "user", model: UserModel })
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
    .populate({ path: "user", model: UserModel })
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
      .populate({ path: "user", model: UserModel })
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

const deleteFromS3 = async (key: string) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  await s3.send(command);
};

async function deleteStory(storyId: string): Promise<void> {
  const existingStory = await StoryModel
  .findById(storyId)
  .populate({ path: "locations", model: LocationModel })
  .populate({ path: "routes", model: RouteModel });
  if (!existingStory) {
    throw new Error("Story not found.");
  }

  const mediaKeys: string[] = [];
  existingStory.locations.forEach((location: any) => {
    location.photos.forEach((photoKey: string) => mediaKeys.push(`${photoKey}`));
    location.videos.forEach((videoKey: string) => mediaKeys.push(`${videoKey}`));
  });

  const deletePromises = mediaKeys.map((key) => deleteFromS3(key));
  await Promise.all(deletePromises);

  const locationIds = existingStory.locations.map((loc: any) => loc._id);
  await LocationModel.deleteMany({ _id: { $in: locationIds } });

  const routeIds = existingStory.routes;
  await RouteModel.deleteMany({ _id: { $in: routeIds } });

  await StoryModel.findByIdAndDelete(storyId);
}

interface IUpdateStoryData {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  locations?: Partial<ILocation>[];
  routes?: Partial<IRoute>[];
}

async function updateStory(storyId: string, updateData: IUpdateStoryData): Promise<IStory | null> {
  const {
    title,
    description,
    startDate,
    endDate,
    budget,
    currency,
    locations,
    routes,
  } = updateData;

  const story = await getStoryById(storyId);

  if (!story) {
    throw new Error("Story not found.");
  }

  await StoryModel.findByIdAndUpdate(
    storyId,
    { title, description, startDate, endDate, budget, currency },
    { new: true }
  );

  if (locations) {
    const locationIdsToUpdate = locations
      .map((loc) => loc._id)
      .filter(Boolean) as string[];

    const currentLocationIds = story.locations.map((loc) =>
      typeof loc === "object" && loc._id ? loc._id.toString() : loc.toString()
    );

    const locationIdsToDelete = currentLocationIds.filter(
      (id) => !locationIdsToUpdate.includes(id)
    );

    for (const locationId of locationIdsToDelete) {
      await locationLogic.deleteLocationById(locationId);
    }

    for (const locationData of locations) {
      if (locationData._id) {
        await locationLogic.updateLocationById(locationData._id, locationData);
      } else {
        await locationLogic.addLocationToStory(storyId, locationData);
      }
    }
  }

  if (routes) {
    const routeIdsToUpdate = routes
      .map((route) => route._id)
      .filter(Boolean) as string[];

    const currentRouteIds = story.routes.map((route) =>
      typeof route === "object" && route._id
        ? route._id.toString()
        : route.toString()
    );

    const routeIdsToDelete = currentRouteIds.filter(
      (id) => !routeIdsToUpdate.includes(id)
    );

    for (const routeId of routeIdsToDelete) {
      await routeLogic.deleteRouteById(routeId);
    }

    for (const routeData of routes) {
      if (routeData._id) {
        await routeLogic.updateRouteById(routeData._id, routeData);
      } else {
        await routeLogic.addRouteToStory(storyId, routeData);
      }
    }
  }
  const updatedStory = await getStoryById(storyId);
  return updatedStory;
}

interface UpdatedStoryResponse {
  likes: number;
}

const likeStory = async (storyId: string): Promise<UpdatedStoryResponse> => {
  try {
    const updatedStory = await StoryModel.findByIdAndUpdate(
      storyId,
      { $inc: { likes: 1 } },
      { new: true } 
    ).exec();

    if (!updatedStory) {
      throw new Error("Story not found");
    }

    return { likes: updatedStory.likes };
  } catch (error) {
    throw new Error("Error liking the story: " + error.message);
  }
};

const unlikeStory = async (storyId: string): Promise<UpdatedStoryResponse> => {
  try {
    const updatedStory = await StoryModel.findByIdAndUpdate(
      storyId,
      { $inc: { likes: -1 } },
      { new: true } // Return the updated story
    ).exec();

    if (!updatedStory) {
      throw new Error("Story not found");
    }

    return { likes: updatedStory.likes };
  } catch (error) {
    throw new Error("Error unliking the story: " + error.message);
  }
};

async function getTopStories(): Promise<any> {
  try {
    const topVacations = await StoryModel
      .find() 
      .populate({ path: "locations", model: LocationModel })
      .populate({ path: "routes", model: RouteModel })
      .populate({ path: "user", model: UserModel })
      .sort({ likes: -1 }) 
      .limit(10) 
      .exec();

    return topVacations;
  } catch (error) {
    console.error("Error fetching top vacations:", error);
    throw new Error("Failed to fetch top vacations.");
  }
}

export default {
  getAllStories,
  getStoriesByCountry,
  getStoriesByUserId,
  getStoryById,
  addStory,
  updateStory,
  deleteStory,
  likeStory,
  unlikeStory,
  getTopStories,
};
