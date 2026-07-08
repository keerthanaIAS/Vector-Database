// text to image search flow
const qdrant = require("../config/qdrant");
const { generateTextEmbedding } = require("../services/embeddingService");
const { generatePresignedUrl } = require("../services/generatePresignedUrl");

exports.searchByText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Text is required"
            });
        }
        // Generate embedding for the text
        const embedding = await generateTextEmbedding(text);
        // Search Qdrant
        const results = await qdrant.search("images", {
            vector: embedding,
            limit: 5,
            with_payload: true,
            with_vector: false
        });
        
        // Generate fresh pre-signed URLs
        for (const point of results) {
            if (point.payload?.key) {
                point.payload.imageUrl =
                    await generatePresignedUrl(point.payload.key);
            }
        }
        return res.json({
            success: true,
            query: text,
            count: results.length,
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