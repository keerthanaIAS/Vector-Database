const express = require("express");
const router = express.Router();
const upload = require("../services/uploadService");
const {
    uploadImage
} = require("../controllers/uploadController");

router.post(
    "/upload",
    upload.single("image"),
    uploadImage
);

module.exports = router;

// What does upload.single("image") mean?
// Suppose the frontend sends:
// form-data
// image : cat.jpg

// Multer extracts it and makes it available as:
// req.file

// Without Multer:
// req.file ↓ undefined