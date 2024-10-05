import StoryModel from "../models/story-model";
import LocationModel, { ILocation } from "../models/location-model";
import mongoose from "mongoose";

async function findLocationById (locationId: string): Promise<ILocation>{

  const location = await LocationModel.findById(locationId).exec();
  if (!location) {
    throw new Error("Location not found");
  }
  return location;
}

async function updateLocationById(locationId: string, updateData: Partial<ILocation>): Promise<ILocation | null> {

  const objectId = mongoose.Types.ObjectId.isValid(locationId) ? new mongoose.Types.ObjectId(locationId) : locationId;
  const existingLocation = await LocationModel.findById(objectId);
  
  if (!existingLocation) {
    throw new Error(`Location with ID ${locationId} not found.`);
  }

  const updatedData = {
    ...updateData,
    photos: existingLocation.photos,
    videos: existingLocation.videos
  };

  const updatedLocation = await LocationModel.findByIdAndUpdate(
    objectId,
    updatedData,
    { new: true }
  );

  if (!updatedLocation) {
    throw new Error(`Failed to update location with ID ${locationId}.`);
  }

  return updatedLocation;
}

async function addLocationToStory(storyId: string, locationData: Partial<ILocation>): Promise<ILocation> {
  const newLocation = new LocationModel(locationData);
  const savedLocation = await newLocation.save();

  await StoryModel.findByIdAndUpdate(
    storyId,
    { $push: { locations: savedLocation._id } },
    { new: true }
  );

  return savedLocation;
}

async function deleteLocationById(locationId: string): Promise<void> {
  try {

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      throw new Error(`Invalid location ID format: ${locationId}`);
    }
    const objectId = new mongoose.Types.ObjectId(locationId);

    const deletedLocation = await LocationModel.findByIdAndDelete(objectId);
    if (!deletedLocation) {
      throw new Error(`Location with ID ${locationId} not found`);
    }
    
  } catch (error) {
    console.error(`Error deleting location with ID ${locationId}:`, error);
    throw error;
  }
}

export default {
  findLocationById,
  updateLocationById,
  addLocationToStory,
  deleteLocationById
};
