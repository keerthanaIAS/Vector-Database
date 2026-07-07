// the first Qdrant operation:
// --------------------------
// Create Collection
// ↓
// Dimension = 3
// ↓
// Distance = Cosine
// ↓
// HNSW Index Created
// ↓
// Ready to Store Vectors

const client = require("../config/qdrant");
require("dotenv").config();

async function createCollection() {
    try {
        await client.deleteCollection(process.env.COLLECTION_NAME);
        await client.createCollection(process.env.COLLECTION_NAME, {
            vectors: {
                size: Number(process.env.VECTOR_SIZE),
                distance: "Cosine"
            }
        });

        console.log("✅ Collection created successfully");

    } catch (error) {
        console.log(error);
    }
}

createCollection();