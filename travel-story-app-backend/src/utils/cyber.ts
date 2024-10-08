import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "../models/user-model";

const salt = "eatSaltInModeration"; 

function hash(plainText: string): string {

    if(!plainText) return null;

    const hashedText = crypto.createHmac("sha512", salt).update(plainText).digest("hex");

    return hashedText;
}


const secretKey = "StevieTheTV";

function getNewToken(user: IUser): string {
    const payload = { user };
    const token = jwt.sign(payload, secretKey, { expiresIn: "2h" });
    return token;
}

function verifyToken(authorizationHeader: string): Promise<boolean> {

    return new Promise((resolve, reject) => {

        if(!authorizationHeader) {
            resolve(false);
            return;
        }

        const token = authorizationHeader.split(" ")[1];

        if(!token) {
            resolve(false);
            return;
        }

        jwt.verify(token, secretKey, (err) => {

            if(err) {
                resolve(false);
                return;
            }

            resolve(true);
        });

    });
    
}

function getUserFromToken(authorizationHeader: string): Omit<IUser, 'password'> | null {
    if (!authorizationHeader) return null;

    const token = authorizationHeader.split(" ")[1];
    if (!token) return null;

    const payload: any = jwt.decode(token);
    if (!payload || !payload.user) return null;

    const { password, ...userWithoutPassword } = payload.user;
    
    return userWithoutPassword; 
}

export default {
    getNewToken,
    verifyToken,
    hash,
    getUserFromToken
};