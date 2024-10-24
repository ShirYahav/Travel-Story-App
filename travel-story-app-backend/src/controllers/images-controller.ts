import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import express, { Request, Response } from "express";
import multer from "multer";
import { Readable } from 'stream';
import LocationModel from "../models/location-model";
import locationLogic from '../logic/location-logic'

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const getS3Url = (bucket: string, key: string) => {
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
  const key = `${folder}/${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command); 

  return getS3Url(params.Bucket, params.Key);
};

router.post("/upload/:locationId", upload.fields([
  { name: "photos", maxCount: 20 },
  { name: "videos", maxCount: 10 },
]), async (req: Request, res: Response) => {
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
      const photoUploadPromises = files.photos.map((file) =>
        uploadToS3(file, 'photos')
      );
      const photoPaths = await Promise.all(photoUploadPromises);
      location.photos.push(...photoPaths);
    }

    if (files.videos) {
      const videoUploadPromises = files.videos.map((file) =>
        uploadToS3(file, 'videos')
      );
      const videoPaths = await Promise.all(videoUploadPromises);
      location.videos.push(...videoPaths); 
    }

    await location.save();

    res.send({
      message: "Files uploaded to S3 and paths saved to location successfully",
      photos: location.photos,
      videos: location.videos,
    });
  } catch (error) {
    console.error("Error uploading files to S3:", error);
    res.status(500).send("Error uploading files");
  }
});


const getS3Object = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });

  const result = await s3.send(command);
  return result.Body as Readable;
};

router.get("/story/photo/:imageName", async (request: Request, response: Response) => {
  try {
    const imageName = request.params.imageName;
    const key = `photos/${imageName}`; 

    const s3Stream = await getS3Object(key);

    if (s3Stream) {
      s3Stream.pipe(response);
    } else {
      response.status(404).json({ message: "Image not found" });
    }

  } catch (err) {
    console.error("Error fetching photo from S3:", err);
    response.status(500).json({ error: "Error fetching photo from S3", details: err });
  }
});

router.get("/story/photos/:locationId", async (request: Request, response: Response) => {
  try {
    const { locationId } = request.params;
    const location = await locationLogic.findLocationById(locationId);

    if (!location || !location.photos.length) {
      return response.status(404).send("No photos found for this location");
    }

    const base64Photos: string[] = [];

    for (const photoUrl of location.photos) {
      const photoName = photoUrl.split('/').pop();
      const key = `photos/${photoName}`; 

      const s3Stream = await getS3Object(key);

      const chunks: Uint8Array[] = [];
      for await (const chunk of s3Stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const base64Photo = buffer.toString("base64");

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

    if (!location || !location.videos.length) {
      return response.status(404).send("No videos found for this location");
    }

    const base64Videos: string[] = [];

    for (const videoUrl of location.videos) {
      const videoName = videoUrl.split('/').pop();
      const key = `videos/${videoName}`; 
      const s3Stream = await getS3Object(key);

      const chunks: Uint8Array[] = [];
      for await (const chunk of s3Stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const base64Video = buffer.toString("base64");

      base64Videos.push(`data:video/mp4;base64,${base64Video}`);
    }

    response.json({ videos: base64Videos });
  } catch (err) {
    console.error("Error fetching videos:", err);
    response.status(400).json(err);
  }
});


router.put("/update-media/:locationId", upload.fields([
  { name: "photos", maxCount: 20 },
  { name: "videos", maxCount: 10 },
]), async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const location = await LocationModel.findById(locationId);

    if (!location) {
      return res.status(404).send("Location not found");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const deleteOldMediaPromises = [];

    for (const photoUrl of location.photos) {
      const photoKey = photoUrl.split('/').pop(); 
      deleteOldMediaPromises.push(deleteFromS3(`photos/${photoKey}`));
    }

    for (const videoUrl of location.videos) {
      const videoKey = videoUrl.split('/').pop(); 
      deleteOldMediaPromises.push(deleteFromS3(`videos/${videoKey}`));
    }

    await Promise.all(deleteOldMediaPromises);

    location.photos = [];
    location.videos = [];

    if (files.photos) {
      const photoUploadPromises = files.photos.map((file) => {
        return uploadToS3(file, 'photos');
      });

      const newPhotoPaths = await Promise.all(photoUploadPromises);
      location.photos.push(...newPhotoPaths); 
    }

    if (files.videos) {
      const videoUploadPromises = files.videos.map((file) => {
        return uploadToS3(file, 'videos');
      });

      const newVideoPaths = await Promise.all(videoUploadPromises);
      location.videos.push(...newVideoPaths); 
    }

    await location.save();

    res.send({
      message: "Media updated successfully",
      photos: location.photos,
      videos: location.videos,
    });
  } catch (error) {
    console.error("Error updating media:", error);
    res.status(500).send("Error updating media");
  }
});

const deleteFromS3 = async (key: string) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  await s3.send(command);
};



export default router;