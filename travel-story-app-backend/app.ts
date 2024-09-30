import express, { Request, Response } from "express";
import dal from "./src/dal";
import cors from "cors";

import storiesController from './src/controllers/story-controller';

const port: number = 3000; 

dal.connect();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api" ,storiesController);


app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to my server!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
