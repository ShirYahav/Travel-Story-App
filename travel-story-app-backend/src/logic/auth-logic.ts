import { ICredentials } from "../models/credentials-model";
import UserModel, { IUser } from "../models/user-model";
import cyber from "../utils/cyber";

async function register(user: IUser): Promise<string> {

    const errors = user.validateSync();

    const isTaken = await isEmailTaken(user);
    if(isTaken) {
        console.log("email is taken")
    }

    user.password = cyber.hash(user.password);

    user.save();

    delete user.password;

    const token = cyber.getNewToken(user);

    return token;
}

async function login(credentials: ICredentials): Promise<string> {

    const errors = credentials.validateSync();
    
    credentials.password = cyber.hash(credentials.password);

    const existingUser = await UserModel.findOne({ email: credentials.email, password: credentials.password}).exec();

    if(!existingUser) {
        console.log("Incorrect email or password");
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