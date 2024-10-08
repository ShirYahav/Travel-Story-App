import { NextFunction, Request, Response } from "express";
import cyber from "../utils/cyber";


async function verifyLoggedIn(request: Request, response: Response, next: NextFunction): Promise<void> {

    const authorizationHeader = request.header("authorization");

    const isValid = await cyber.verifyToken(authorizationHeader);

    if(!isValid) {
        console.log("Something went wrong... You are not logged in");
        return;
    }
    next();
}

export default verifyLoggedIn;