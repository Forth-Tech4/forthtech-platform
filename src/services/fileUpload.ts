// server/uploads.ts
import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Storage config
const storage = multer.diskStorage({
  destination: function (req:any, file:any, cb:any) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req:any, file:any, cb:any) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
console.log("mmmmmm")
router.post("/upload", upload.single("file"), (req:any, res) => {
    console.log("oinnnnn",req?.file)
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `http://192.168.1.24:4000/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

export default router;
