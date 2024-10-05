import StoryModel, { IStory } from "../models/story-model";
import RouteModel, { IRoute } from "../models/route-model";

async function updateRouteById(routeId: string, updatedData: Partial<IRoute>): Promise<IRoute | null> {

  const updatedRoute = await RouteModel.findByIdAndUpdate(
    routeId,
    updatedData,
    { new: true } 
  );

  if (!updatedRoute) {
    throw new Error("Route not found.");
  }
  return updatedRoute;
}

async function addRouteToStory(storyId: string, routeData: Partial<IRoute>): Promise<IRoute> {
  const newRoute = new RouteModel(routeData);
  const savedRoute = await newRoute.save();

  await StoryModel.findByIdAndUpdate(
    storyId,
    { $push: { routes: savedRoute._id } },
    { new: true }
  );
  return savedRoute;
}

async function deleteRouteById(routeId: string): Promise<void> {

  await StoryModel.updateMany(
    { routes: routeId },
    { $pull: { routes: routeId } }
  );

  await RouteModel.findByIdAndDelete(routeId);
}
  
export default {
  updateRouteById,
  addRouteToStory,
  deleteRouteById
};
