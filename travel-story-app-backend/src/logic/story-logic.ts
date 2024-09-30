import StoryModel, { IStory } from "../models/story-model";
import LocationModel from "../models/location-model";
import RouteModel from "../models/route-model";

async function getAllStories(): Promise<IStory[]> {
  return StoryModel.find()
    .populate({ path: 'locations', model: LocationModel })  
    .populate({ path: 'routes', model: RouteModel })
    .exec();
}

export default {
  getAllStories
};
