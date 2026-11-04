import express from 'express';
import multer from 'multer';
import imagekit, { isImageKitConfigured } from '../config/imagekit.js';
import { authenticateAny } from '../middleware/auth.js';

const router = express.Router();

// Configure multer to use memory storage, which provides the file as a buffer
// Images only, max 5 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    const err = new Error('Only image files are allowed.');
    err.status = 400;
    cb(err);
  },
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : err.message;
    res.status(400).json({ message });
  });
};

// The upload route. 'file' is the name of the form field.
router.post('/', authenticateAny, handleUpload, async (req, res) => {
  if (!isImageKitConfigured) {
    return res
      .status(503)
      .json({ message: 'Image upload is not configured on this server. Use an image URL instead.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    // Upload the file to ImageKit
    const result = await imagekit.upload({
      file: req.file.buffer, // The file buffer from multer
      fileName: req.file.originalname, // The original name of the file
    });

    // Send back the URL and fileId from the successful upload
    res.status(200).json({ url: result.url, fileId: result.fileId });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({ message: 'Error uploading file to ImageKit.' });
  }
});

export default router;
