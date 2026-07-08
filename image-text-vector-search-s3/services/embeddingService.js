// This service will:
// - Receive the uploaded S3 image URL.
// - Send it to the Jina embedding API.
// - Receive the embedding vector.
// - Return it to the controller.

// Flow After Upload:-
// Instead of stopping after uploading to S3:
// User ↓ Upload Image ↓ S3 ↓ Get Image URL ↓ Generate Embedding ↓ Store in MongoDB

const axios = require("axios");

async function generateEmbedding(imageUrl) {
    try {
        const response = await axios.post(
            "https://api.jina.ai/v1/embeddings",
            {
                model: "jina-clip-v2",
                input: [
                    {
                        image: imageUrl
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.JINA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data.data[0].embedding;
    } catch (error) {
        console.log(error.response?.data || error.message);
        throw error;
    }

}

async function generateTextEmbedding(text) {
    try {
        const response = await axios.post(
            "https://api.jina.ai/v1/embeddings",
            {
                model: "jina-clip-v2",
                input: [
                    {
                        text: text
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.JINA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.data[0].embedding;

    } catch (error) {

        console.log(error.response?.data || error.message);

        throw error;

    }
}

module.exports = {
    generateEmbedding,
    generateTextEmbedding
};

// What happens here?
// S3 Image URL ↓ POST ↓ Jina API ↓ CLIP Model ↓ 1024 Numbers ↓ Return Vector
// Example:
// [
//   0.123,
//   -0.442,
//   0.003,
//   ...
// ]
// There will be 1024 floating-point numbers (assuming the selected model outputs 1024 dimensions).

