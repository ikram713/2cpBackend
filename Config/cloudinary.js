// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const multer = require('multer');

// Memory storage since we're sending buffers to Cloudinary
const storage = multer.memoryStorage();

// Accept multiple fields: ImgURL (single image) & ServiceImages (array of images)
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024  // limit to 5MB per file (optional)
    }
}).fields([
    { name: 'ImgURL', maxCount: 1 },
    { name: 'ServiceImages', maxCount: 10 }
]);

module.exports = cloudinary;
