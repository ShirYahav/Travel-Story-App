import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRoute extends Document {
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
        //required: [true, "Origin is required"],
        trim: true
    },
    destination: {
        type: String,
        //required: [true, "Destination is required"],
        trim: true
    },
    transportType: {
        type: String,
        //required: [true, "Transport type is required"],
        trim: true
    },
    duration: {
        type: Number, 
        //required: [true, "Duration is required"]
    },
    note: {
        type: String,
        trim: true
    },
    cost: {
        type: Number,
        //required: [true, "Cost is required"]
    },
    currency: {
        type: String,
        //required: [true, "Currency is required"],
        trim: true
    }
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false
});

const RouteModel: Model<IRoute> = mongoose.model<IRoute>("RouteModel", RouteSchema, "routes");

export default RouteModel;
