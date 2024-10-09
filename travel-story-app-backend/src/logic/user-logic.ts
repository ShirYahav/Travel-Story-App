import mongoose from "mongoose";
import StoryModel from "../models/story-model";
import UserModel from "../models/user-model";
import LocationModel from "../models/location-model";
import RouteModel from "../models/route-model";

const likeStory = async (userId: string, storyId: string) => {
  try {
    
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const objectIdStory: any = new mongoose.Types.ObjectId(storyId);

    if ((user.likedStories as any[]).some((id: any) => id.toString() === objectIdStory.toString())) {
      throw new Error("Story already liked");
    }

    await StoryModel.findByIdAndUpdate(
      storyId,
      { $inc: { likes: 1 } }, 
      { new: true } 
    );

    
    (user.likedStories as any[]).push(objectIdStory);
    await user.save();
  } catch (error) {
    console.error(error);
    throw new Error("Error liking story");
  }
};

const dislikeStory = async (userId: string, storyId: string) => {
  try {
    
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const objectIdStory: any = new mongoose.Types.ObjectId(storyId);

    if (!(user.likedStories as any[]).some((id: any) => id.toString() === objectIdStory.toString())) {
      throw new Error("Story not liked yet");
    }

    await StoryModel.findByIdAndUpdate(
      storyId,
      { $inc: { likes: -1 } }, 
      { new: true }
    );

    user.likedStories = (user.likedStories as any[]).filter((id: any) => id.toString() !== objectIdStory.toString());
    await user.save();
    
  } catch (error) {
    console.error(error);
    throw new Error("Error unliking story");
  }
};

const getLikedStoriesByUser = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate({
      path: 'likedStories',
      model: StoryModel,
      populate: [
        { path: 'locations', model: LocationModel },
        { path: 'routes', model: RouteModel },
        { path: 'user', model: UserModel }
      ]
    });

  if (!user) {
    throw new Error("User not found");
  }

  return user.likedStories;
};

export default {
  likeStory,
  dislikeStory,
  getLikedStoriesByUser,
};
