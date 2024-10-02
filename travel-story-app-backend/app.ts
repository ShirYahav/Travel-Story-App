import express, { Request, Response } from "express";
import cors from "cors";
import dal from "./src/dal";

import storiesController from './src/controllers/story-controller';
import imageController from './src/controllers/images-controller';

const port: number = 3001; 

dal.connect();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api" ,storiesController);
app.use("/api", imageController);


app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to my server!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
