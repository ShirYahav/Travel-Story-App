import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { ILocation } from "./location-model";
import { IRoute } from "./route-model";
import { IUser } from "./user-model";

export interface IStory extends Document {
    _id: string;
    user: Types.ObjectId | IUser; 
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
        ref: "user",
        required: [true, "User is required"]
    },
    countries: {
        type: [String],
        required: [true, "Countries are required"]
    },
    title: {
        type: String,
        trim: true,
        required: [true, "Title is required"],
        maxlength: 300,
        minlength: 1,
    },
    description: {
        type: String,
        trim: true,
        required: [true, "Description is required"],
        maxlength: 1000,
        minlength: 1,
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
        min: [0, 'Budget cannot be negative']
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
