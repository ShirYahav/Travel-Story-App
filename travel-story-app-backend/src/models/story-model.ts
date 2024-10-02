import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { ILocation } from "./location-model";
import { IRoute } from "./route-model";

export interface IStory extends Document {
    user: string;
    countries: string[];
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    currency: string;
    locations: Types.ObjectId[];
    routes: Types.ObjectId[]; 
    likes: number;
}

const StorySchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        //required: [true, "User is required"]
    },
    countries: {
        type: [String],
        required: [true, "Countries are required"]
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"]
    },
    endDate: {
        type: Date,
        required: [true, "End date is required"]
    },
    budget: {
        type: Number,
        required: [true, "Budget is required"]
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
        trim: true
    },
    locations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "locations",
        required: [true, "Locations are required"]
    }],
    routes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "routes",
        //required: [true, "Routes are required"]
    }],
    likes: {
        type: Number,
        default: 0,
    },
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false
});

const StoryModel: Model<IStory> = mongoose.model<IStory>("StoryModel", StorySchema, "stories");

export default StoryModel;
