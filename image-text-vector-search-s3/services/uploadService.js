const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage
});

module.exports = upload;

// Why memoryStorage()?
// There are two approaches.

// 1. Disk Storage
// Image ↓ Server Disk ↓ Read Again ↓ Upload to S3

// Extra disk operations.

// 2. Memory Storage
// Image ↓ RAM ↓ Directly Upload to S3

// Faster and cleaner.