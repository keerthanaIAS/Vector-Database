// image to image search flow
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");

const s3 = require("../config/s3");
const qdrant = require("../config/qdrant");

const { generatePresignedUrl } = require("../services/generatePresignedUrl");
const { generateEmbedding } = require("../services/embeddingService");

exports.searchImage = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
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

        const results = await qdrant.search("images", {
            vector: embedding,
            limit: 5,
            with_payload: true,
            with_vector: false
        });

        // Add a fresh signed URL to every result
        for (const point of results) {
            if (point.payload?.key) {
                point.payload.imageUrl =
                    await generatePresignedUrl(point.payload.key);
            }

        }

        res.json({
            success: true,
            results
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};