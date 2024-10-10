import { ICredentials } from "../models/credentials-model";
import ErrorModel from "../models/error-model";
import UserModel, { IUser } from "../models/user-model";
import cyber from "../utils/cyber";

async function register(user: IUser): Promise<string> {

    const errors = user.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    const isTaken = await isEmailTaken(user);
    if(isTaken) {
        throw new ErrorModel(400, `email ${user.email} already taken`);
    }

    user.password = cyber.hash(user.password);

    user.save();

    delete user.password;

    const token = cyber.getNewToken(user);

    return token;
}

async function login(credentials: ICredentials): Promise<string> {

    const errors = credentials.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    credentials.password = cyber.hash(credentials.password);

    const existingUser = await UserModel.findOne({ email: credentials.email, password: credentials.password}).exec();

    if(!existingUser) {
        throw new ErrorModel(401, "Incorrect email or password");
    }

    delete existingUser.password;

    const token = cyber.getNewToken(existingUser);

    return token;
}

async function isEmailTaken(user: IUser): Promise<boolean> {
    user = await UserModel.findOne({email: user.email})
    if(!user){
        return false;
    }
    return true
}

export default {
    register,
    login,
    isEmailTaken,
}