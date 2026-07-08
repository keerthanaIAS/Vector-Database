const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");

const s3 = require("../config/s3");
const qdrant = require("../config/qdrant");

const { generateEmbedding } = require("../services/embeddingService");
const { generatePresignedUrl } = require("../services/generatePresignedUrl");

exports.uploadImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded"
            });
        }

        const fileName =
            `${uuid()}-${req.file.originalname.replace(/\s+/g, "-")}`;

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }));

        const signedUrl = await generatePresignedUrl(fileName);

        const embedding = await generateEmbedding(signedUrl);

        await qdrant.upsert("images", {
            wait: true,
            points: [
                {
                    id: crypto.randomUUID(),
                    vector: embedding,
                    payload: {
                        key: fileName,
                        originalName: req.file.originalname,
                        contentType: req.file.mimetype,
                        createdAt: new Date().toISOString()
                    }
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// Notice we now have both:
// imageUrl → stored in MongoDB
// signedUrl → used only to call Jina AI
        

// What is PutObjectCommand?
// S3 stores objects.

// When we upload a file:
// Upload Image -> S3Client -> PutObjectCommand -> AWS S3 -> Generate Pre-signed URL -> Jina AI -> Embedding -> Qdrant

// Internally, AWS creates:
// Bucket
//    │
//    ├── cat.jpg
//    ├── dog.jpg
//    ├── car.jpg

// Why UUID?
// Suppose two users upload:
// cat.jpg
// Without UUID:
// cat.jpg ↓ cat.jpg ↓ Overwrite ❌

// With UUID:
// 71a2f-cat.jpg
// 8bc52-cat.jpg
// 9dc71-cat.jpg

// Every filename is unique.

// What is wait:true?
// wait:true --> means: Wait until the operation is fully completed before returning a response. This ensures that the data is safely stored and indexed before proceeding.
// means : Insert Point ↓ Wait Until Saved ↓ Return Success
// Without it:  Insert Request ↓ Return Immediately ↓ Save Later