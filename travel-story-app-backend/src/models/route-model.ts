import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRoute extends Document {
    _id: string;
    origin: string;
    destination: string;
    transportType: string;
    duration: number
    note: string;
    cost: number;
    currency: string;
}

const RouteSchema: Schema = new Schema({
    origin: {
        type: String,
        required: [true, "Origin is required"],
        trim: true
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
        trim: true
    },
    transportType: {
        type: String,
        required: [true, "Transport type is required"],
        trim: true
    },
    duration: {
        type: Number, 
        min: [0, 'Duration cannot be negative']
    },
    note: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    cost: {
        type: Number,
        min: [0, 'Cost cannot be negative']
    },
    currency: {
        type: String,
        trim: true
    }
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false
});

const RouteModel: Model<IRoute> = mongoose.model<IRoute>("RouteModel", RouteSchema, "routes");

export default RouteModel;
