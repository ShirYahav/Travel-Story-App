import { IStory } from "../models/story-model";
import LocationModel, { ILocation } from "../models/location-model";
import { Types } from "mongoose";

async function updateLocations(existingStory: IStory, locations: ILocation[]): Promise<ILocation[]> {
  
  const existingLocationIds = existingStory.locations.map((loc: any) =>
    loc._id.toString()
  );
  const updatedLocationIds = locations.map((loc) => loc._id?.toString());

  const locationsToDelete = existingLocationIds.filter(
    (id) => !updatedLocationIds.includes(id)
  );
  await LocationModel.deleteMany({ _id: { $in: locationsToDelete } });

  const updatedLocations: ILocation[] = [];
  for (const locationData of locations) {
    if (locationData._id) {

      const updatedLocation = await LocationModel.findByIdAndUpdate(
        locationData._id,
        locationData,
        { new: true }
      );
      if (updatedLocation) {
        updatedLocations.push(updatedLocation);
      }
    } else {
      
      const newLocation = new LocationModel(locationData);
      const savedLocation = await newLocation.save();
      updatedLocations.push(savedLocation);
    }
  }
  return updatedLocations;
}

// async function saveLocations(locations: ILocation[]): Promise<> {
    
// }

export default {
  updateLocations,
  //saveLocations
};
