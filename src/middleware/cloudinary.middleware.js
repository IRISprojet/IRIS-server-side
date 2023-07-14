const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storageCloudinary = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "uploads",
  resource_type: "auto",
  onError: function (err, next) {
    console.log("error", err);
    next(err);
  },
});

const uploadCloudinary = multer({ storage: storageCloudinary });

module.exports = uploadCloudinary;
