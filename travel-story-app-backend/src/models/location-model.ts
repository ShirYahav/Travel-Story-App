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
        trim: true,
        required: [true, 'Country is required'],
    },
    city: {
        type: String,
        trim: true,
        required: [true, 'City is required'],
    },
    startDate: {
        type: Date,
        required: [true, 'start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'end date is required'],
    },
    story: {
        type: String,
        trim: true,
        maxlength: 4000,
        minlength: 5,
        required: [true, 'Story content is required'],
    },
    cost: {
        type: Number,
        min: [0, 'Cost cannot be negative']
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
