const client = require("../config/qdrant");

async function createCollection() {
    await client.createCollection("images", {
        vectors: {
            size: 1024,
            distance: "Cosine"
        }
    });
    console.log("Collection Created");
}

createCollection().catch(console.error);
// If your embedding model returns 768 dimensions instead of 1024, change size accordingly.