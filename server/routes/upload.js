import express from 'express';
import multer from 'multer';
import imagekit, { isImageKitConfigured } from '../config/imagekit.js';

const router = express.Router();

// Configure multer to use memory storage, which provides the file as a buffer
const upload = multer({ storage: multer.memoryStorage() });

// The upload route. 'file' is the name of the form field.
router.post('/', upload.single('file'), async (req, res) => {
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
