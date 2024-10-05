import mongoose, { Document, Schema, Model } from "mongoose";

export interface ILocation extends Document {
    _id: string;
    country: string;
    city: string;
    startDate: Date;
    endDate: Date;
    story: string;
    cost: number;
    currency: string;
    photos: string[];
    videos: string[];
}

const LocationSchema: Schema = new Schema({
    country: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    story: {
        type: String,
        trim: true
    },
    cost: {
        type: Number
    },
    currency: {
        type: String,
        trim: true
    },
    photos: {
        type: [String]
    },
    videos: {
        type: [String],
    }
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false
});

const LocationModel: Model<ILocation> = mongoose.model<ILocation>("LocationModel", LocationSchema, "locations");

export default LocationModel;
