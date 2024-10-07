import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string; 
}

const UserSchema: Schema<IUser> = new Schema({
    firstName: {
        type: String,
        required: [true, "Missing first name"],
        //minlength: [2, "First name is too short"],
        //maxlength: [20, "First name is too long"],
        //match: [/^([a-zA-Z]*)$/, "Invalid First Name"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Missing last name"],
        //minlength: [2, "Last name is too short"],
        //maxlength: [20, "Last name is too long"],
        //match: [/^([a-zA-Z]*)$/, "Invalid Last Name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Missing Email"],
        //minlength: [5, "Email is too short"],
        //maxlength: [150, "Email is too long"],
        //match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid Email"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Missing Password"],
        //minlength: [8, "Password is too short"],
        //match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one letter and one number, and can include special characters"],
        trim: true
    },
    role: {
        type: String,
        default: "user"
    }
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false
});

const UserModel: Model<IUser> = mongoose.model<IUser>("UserModel", UserSchema, "users");

export default UserModel;
