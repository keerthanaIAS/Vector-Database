const express = require("express");
const router = express.Router();
const upload = require("../services/uploadService");
const {
    searchImage
} = require("../controllers/searchController");

router.post("/", upload.single("image"), searchImage);

module.exports = router;

// while search the image Internal Flow
// dog.jpg ↓ S3 ↓ Signed URL ↓ Jina AI ↓ Embedding ↓ Qdrant Search ↓ Top 5 Images