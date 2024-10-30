import express, { Request, Response } from "express";
import cors from "cors";
import dal from "./src/dal";

import storiesController from './src/controllers/story-controller';
import imageController from './src/controllers/images-controller';
import authController from './src/controllers/auth-controller';
import userController from './src/controllers/user-controller';
import openaiController from './src/controllers/openai-controller';
import path from "path";

const port: number = 3001; 

dal.connect();

const app = express();

app.use(cors({
  origin: '*', 
  credentials: true,
}));
app.use(express.json());
app.use("/api" ,storiesController);
app.use("/api", imageController);
app.use("/api", authController);
app.use("/api", userController);
app.use("/api", openaiController);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to my server!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
