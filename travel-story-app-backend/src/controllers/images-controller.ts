import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import LocationModel from "../models/location-model";
import fs from 'fs';
import locationLogic from '../logic/location-logic'

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "";

    if (file.mimetype.startsWith("image/")) {
      uploadPath = path.join(__dirname, "../Assets/stories/photos");
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath = path.join(__dirname, "../Assets/stories/videos");
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/upload/:locationId", upload.fields([
    { name: "photos", maxCount: 20 },
    { name: "videos", maxCount: 10 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { locationId } = req.params;
      const location = await LocationModel.findById(locationId);
      if (!location) {
        return res.status(404).send("Location not found");
      }

      if (!req.files) {
        return res.status(400).send("No files uploaded");
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.photos) {
        const photoPaths = files.photos.map((file) => file.filename);
        location.photos.push(...photoPaths);
      }

      if (files.videos) {
        const videoPaths = files.videos.map((file) => file.filename);
        location.videos.push(...videoPaths);
      }

      await location.save();

      res.send({
        message: "Files uploaded and paths saved to location successfully",
        photos: location.photos,
        videos: location.videos,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).send("Error uploading files");
    }
  }
);


// router.get("/story/:storyId/photos", async (req: Request, res: Response) => {
//   try {
//     const { storyId } = req.params;

//     // Fetch the story using the getStoryById logic
//     const story = await storyLogic.getStoryById(storyId);
//     if (!story) {
//       return res.status(404).send("Story not found");
//     }

//     // Extract the locations from the story
//     const locations = story.locations;

//     // Initialize an array to hold all photo URLs
//     const allPhotoUrls: string[] = [];

//     // Loop through each location and gather the photo URLs
//     for (const locationId of locations) {
//       const location = await LocationModel.findById(locationId);
//       if (location && location.photos.length > 0) {
//         // Map each photo filename to its corresponding URL
//         const photoUrls = location.photos.map((photo) => `/photos/${photo}`);
//         allPhotoUrls.push(...photoUrls);  // Collect the photo URLs
//       }
//     }

//     // Send the collected photo URLs as the response
//     res.json({ photos: allPhotoUrls });
//   } catch (error) {
//     console.error("Error fetching photos for story:", error);
//     res.status(500).send("Error fetching photos");
//   }
// });

router.get("/story/photo/:imageName" ,async (request, response) => {
  try {
      const imageName = request.params.imageName;
      const absolutePath = path.join(__dirname, "..", "assets", "stories", "photos", imageName);
      response.sendFile(absolutePath);
  }
  catch (err) {
      response.status(400).json(err);
  }
});

router.get("/story/photos/:locationId", async (request: Request, response: Response) => {
  try {
    const { locationId } = request.params;
    const location = await locationLogic.findLocationById(locationId);  


    const base64Photos: string[] = [];

    for (const photoName of location.photos) {
      const absolutePath = path.join(__dirname, "..", "assets", "stories", "photos", photoName);

      const fileData = fs.readFileSync(absolutePath);
      const base64Photo = fileData.toString("base64");

      base64Photos.push(`data:image/jpeg;base64,${base64Photo}`);
    }

    response.json({ photos: base64Photos });
  } catch (err) {
    console.error("Error fetching photos:", err);
    response.status(400).json(err);
  }
});

router.get("/story/videos/:locationId", async (request: Request, response: Response) => {
  try {
    const { locationId } = request.params;
    const location = await locationLogic.findLocationById(locationId);

    const base64Videos: string[] = [];

    for (const videoName of location.videos) {
      const absolutePath = path.join(__dirname, "..", "assets", "stories", "videos", videoName);

      const fileData = fs.readFileSync(absolutePath);
      const base64Video = fileData.toString("base64");

      base64Videos.push(`data:video/mp4;base64,${base64Video}`);
    }

    response.json({ videos: base64Videos });
  } catch (err) {
    console.error("Error fetching videos:", err);
    response.status(400).json(err);
  }
});


export default router;