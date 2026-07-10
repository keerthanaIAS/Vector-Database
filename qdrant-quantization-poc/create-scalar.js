const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
    host: "localhost",
    port: 6333,
});

async function main() {

    const collectionName = "scalar_search";

    // Delete if exists
    try {
        await client.deleteCollection(collectionName);
        console.log("Old collection deleted");
    } catch (e) {}

    await client.createCollection(collectionName, {
        vectors: {
            size: 384,
            distance: "Cosine",
        },

        quantization_config: {
            scalar: {
                type: "int8",
                quantile: 0.99,
                always_ram: true
            }
        }
    });

    console.log("Scalar collection created.");
}

main();