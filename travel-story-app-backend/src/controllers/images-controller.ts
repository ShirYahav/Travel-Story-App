import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import LocationModel from "../models/location-model";
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "";

    if (file.mimetype.startsWith("image/")) {
      uploadPath = path.join(__dirname, "../assets/stories/photos");
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath = path.join(__dirname, "../assets/stories/videos");
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });  // Create directory if not exists
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

router.post(
  "/upload/:locationId",
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 5 },
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
        location.photos.push(...photoPaths);  // Push the file paths into the location's photos array
      }

      if (files.videos) {
        const videoPaths = files.videos.map((file) => file.filename);
        location.videos.push(...videoPaths);  // Push the file paths into the location's videos array
      }

      await location.save();  // Save the updated location in MongoDB

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


export default router;
