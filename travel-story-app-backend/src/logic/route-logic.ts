import { IStory } from "../models/story-model";
import RouteModel, { IRoute } from "../models/route-model";

async function updateRoutes(existingStory: IStory, routes: IRoute[]): Promise<IRoute[]> {

  const existingRouteIds = existingStory.routes.map((route: any) =>
    route._id.toString()
  );
  const updatedRouteIds = routes.map((route) => route._id?.toString());

  const routesToDelete = existingRouteIds.filter(
    (id) => !updatedRouteIds.includes(id)
  );
  await RouteModel.deleteMany({ _id: { $in: routesToDelete } });

  const updatedRoutes: IRoute[] = [];
  for (const routeData of routes) {
    if (routeData._id) {
      
      const updatedRoute = await RouteModel.findByIdAndUpdate(
        routeData._id,
        routeData,
        { new: true }
      );
      if (updatedRoute) {
        updatedRoutes.push(updatedRoute);
      }
    } else {
      const newRoute = new RouteModel(routeData);
      const savedRoute = await newRoute.save();
      updatedRoutes.push(savedRoute);
    }
  }
  return updatedRoutes;
}
  
export default {
  updateRoutes,
};
