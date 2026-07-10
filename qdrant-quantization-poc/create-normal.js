const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
    host: "localhost",
    port: 6333,
});

async function main() {

    const collectionName = "normal_search";

    // Delete if already exists
    try {
        await client.deleteCollection(collectionName);
        console.log("Old collection deleted");
    } catch (e) {}

    await client.createCollection(collectionName, {
        vectors: {
            size: 384,
            distance: "Cosine",
        },
    });

    console.log("Normal collection created");
}

main();