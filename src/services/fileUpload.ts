import express from "express";
import cloudinary from "../config/cloudanary";
import dotenv from "dotenv"
const router = express.Router();
dotenv.config()
router.get("/cloudinary-signature", async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Only sign params you’ll actually send in formData
    const paramsToSign = {
      timestamp,
      folder: "schoolapp",
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    res.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: "schoolapp",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
