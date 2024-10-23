import express, { Request, Response } from "express";
import cors from "cors";
import dal from "./src/dal";

import storiesController from './src/controllers/story-controller';
import imageController from './src/controllers/images-controller';
import authController from './src/controllers/auth-controller';
import userController from './src/controllers/user-controller';
import path from "path";

const port: number = 3001; 

dal.connect();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',  // Development frontend URL
    'https://travelog-app.vercel.app'  // Production frontend URL
  ],
  credentials: true,  // If you are dealing with cookies or authentication
}));
app.use(express.json());
app.use("/api" ,storiesController);
app.use("/api", imageController);
app.use("/api", authController);
app.use("/api", userController);
app.use('/photos', express.static(path.join(__dirname, 'assets/stories/photos')));
app.use('/videos', express.static(path.join(__dirname, 'assets/stories/videos')));


app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to my server!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
