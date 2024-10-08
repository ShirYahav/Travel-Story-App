import express, { NextFunction, Request, Response } from "express";
import UserModel from "../models/user-model";
import logic from '../logic/auth-logic';
import { CredentialsModel } from "../models/credentials-model";
import cyber from '../utils/cyber';

const router = express.Router();

router.post("/auth/register", async (request: Request, response: Response, next: NextFunction) => {
    try {
        const user = new UserModel(request.body);
        const token = await logic.register(user);
        response.status(201).json(token);
    }
    catch (err: any) {
        next(err);
    }
});

router.post("/auth/login", async (request: Request, response: Response, next: NextFunction) => {
    try {
        const credentials = new CredentialsModel(request.body);
        const token = await logic.login(credentials);
        response.json(token);
    }
    catch (err: any) {
        console.log("something went wrong with login")
        next(err);
    }
});

router.get('/auth/me', (req: Request, res: Response) => {
    const authorizationHeader = req.headers['authorization'] || '';

    const user = cyber.getUserFromToken(authorizationHeader);

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token or user not found' });
    }

    res.json({ user });
});

export default router;