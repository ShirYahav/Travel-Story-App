import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; 
import express, { Request, Response } from "express";
import LocationModel from "../models/location-model";

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

router.post("/get-presigned-url", async (req: Request, res: Response) => {
  const { fileName, fileType, folder } = req.body;  
  const key = `${folder}/${Date.now()}-${fileName}`; 

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.json({ presignedUrl, key });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).send("Error generating URL");
  }
});

router.put("/add-location-media/:locationId", async (req: Request, res: Response) => {
  const { locationId } = req.params;
  const { fileKey, mediaType } = req.body; 

  try {
    const location = await LocationModel.findById(locationId);
    if (!location) {
      return res.status(404).send("Location not found");
    }

    if (mediaType === 'photo') {
      location.photos.push(fileKey);
    } else if (mediaType === 'video') {
      location.videos.push(fileKey);
    }

    await location.save();
    res.send({
      message: "Media added to location successfully",
      location,
    });
  } catch (error) {
    console.error("Error updating location with media:", error);
    res.status(500).send("Error updating location");
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

router.delete('/delete-location-media/:locationId', async (req: Request, res: Response) => {
  const { locationId } = req.params;
  const { fileKey, fileType } = req.body;

  try {
    const location = await LocationModel.findById(locationId);
    if (!location) {
      return res.status(404).send("Location not found.");
    }

    if (fileType === "photos") {
      location.photos = location.photos.filter((key) => key !== fileKey);
    } else if (fileType === "videos") {
      location.videos = location.videos.filter((key) => key !== fileKey);
    }

    await location.save();

    await deleteFromS3(fileKey);
    res.status(200).send("Media deleted successfully.");
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).send("Error deleting media.");
  }
});

export default router;