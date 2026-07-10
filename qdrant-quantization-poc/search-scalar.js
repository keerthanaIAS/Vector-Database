const { QdrantClient } = require("@qdrant/js-client-rest");
const { pipeline } = require("@xenova/transformers");

const client = new QdrantClient({
    host: "localhost",
    port: 6333,
});

async function main() {

    const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
    );

    const query = "Apple mobile phone";

    const embedding = await extractor(query, {
        pooling: "mean",
        normalize: true,
    });

    console.time("Search Time");

    const result = await client.query("scalar_search", {
        query: Array.from(embedding.data),
        limit: 5,
        with_payload: true,
    });

    console.timeEnd("Search Time");

    console.log("\nResults:\n");

    result.points.forEach((item, index) => {
        console.log(
            `${index + 1}. ${item.payload.text}`
        );
        console.log("Score:", item.score);
        console.log("------------------------");
    });

}

main();

// What happened internally?

// Normal collection:-
// Float32 vectors
//         │
//         ▼
// HNSW
//         │
//         ▼
// Search

// Scalar collection:-
// Float32 vectors
//         │
//         ▼
// Convert to Int8
//         │
//         ▼
// HNSW
//         │
//         ▼
// Search
// The search algorithm (HNSW) is the same; only the vector representation differs.