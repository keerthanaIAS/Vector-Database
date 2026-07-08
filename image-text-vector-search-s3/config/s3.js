const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

module.exports = s3;

// What is S3Client?
// Think of it as your connection object.

// Without it:
// Node ❌ AWS

// With it:
// Node
//    │
//    ▼
// S3Client
//    │
//    ▼
// AWS S3

// It authenticates every request using your IAM credentials.