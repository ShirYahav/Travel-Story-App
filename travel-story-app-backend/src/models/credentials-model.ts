import { Document, model, Schema } from "mongoose";

export interface ICredentials extends Document {
    email: string;
    password: string
}

const CredentialsSchema = new Schema<ICredentials>({
    email: {
        type: String,
        required: [true, "Missing Email"],
        minlength: [5, "Last name is too short"],
        maxlength: [150, "Last name is too long"],
        //match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid Email"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Missing Password"],
        minlength: [8, "Password is too short"],
        //match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "Password must contain at least one letter or number"],
        trim: true
    }
}, {
    versionKey: false
});

export const CredentialsModel = model<ICredentials>("CredentialsModel", CredentialsSchema, "credentials");