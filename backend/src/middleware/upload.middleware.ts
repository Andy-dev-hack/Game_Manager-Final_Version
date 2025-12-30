/**
 * @file upload.middleware.ts
 * @description Configures Multer for file uploads.
 * Handles image uploads with validation and storage configuration.
 */
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where files are saved
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: timestamp + extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter (images only)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const fileTypes = /jpeg|jpg|png/;
  const mimetype = fileTypes.test(file.mimetype);
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: File must be a valid image (jpeg, jpg, png)"));
};

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: fileFilter,
});
export default upload;
